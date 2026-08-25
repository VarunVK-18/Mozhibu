/**
 * Revenue Engine — Monthly Batch Job
 *
 * Distributes net ad revenue among Platform, Authors, and Readers
 * using integer paise arithmetic to avoid float rounding errors.
 *
 * Idempotent: re-running for the same month/year overwrites existing
 * pending records; finalized months are protected unless `force: true`.
 *
 * Worked examples (from spec):
 *   Author A:  (50_000 / 5_00_000) × 1_50_000 rupees = ₹15,000
 *   Reader X:  (2_000 / 10_00_000) × 50_000 rupees = ₹100
 */

const MonthlyAdRevenue = require('../models/MonthlyAdRevenue');
const RevenueSplitConfig = require('../models/RevenueSplitConfig');
const QualifiedRead = require('../models/QualifiedRead');
const EngagementScore = require('../models/EngagementScore');
const AuthorEarnings = require('../models/AuthorEarnings');
const ReaderReward = require('../models/ReaderReward');
const Book = require('../models/Book');

/**
 * Run the full monthly revenue distribution computation.
 * @param {number} year  - e.g. 2026
 * @param {number} month - 1-12
 * @param {string} adminUserId - ID of admin who triggered the run
 * @param {boolean} force - if true, allows recomputation of finalized months
 * @returns {object} summary report
 */
const computeMonthlyRevenue = async (year, month, adminUserId, force = false) => {
  // ── 1. Load ad revenue ─────────────────────────────────────
  const adRevenue = await MonthlyAdRevenue.findOne({ year, month });
  if (!adRevenue) {
    throw new Error(`No ad revenue record found for ${year}-${month}`);
  }
  if (adRevenue.isFinalized && !force) {
    throw new Error(`Revenue for ${year}-${month} is already finalized. Use force=true to recompute.`);
  }

  const R = adRevenue.netRevenueInPaise; // integer paise

  // ── 2. Load split config (or use defaults) ─────────────────
  let config = await RevenueSplitConfig.findOne().sort({ createdAt: -1 });
  if (!config) {
    config = { platformPercent: 80, authorsPercent: 15, readersPercent: 5,
               minAuthorPayoutInPaise: 10000, minReaderPayoutInPaise: 5000 };
  }

  // ── 3. Compute pools (integer division — platform gets remainder to avoid leakage)
  const authorsPool = Math.floor(R * config.authorsPercent / 100);
  const readersPool = Math.floor(R * config.readersPercent / 100);
  const platformPool = R - authorsPool - readersPool; // exact remainder

  // ── 4. Author Earnings ─────────────────────────────────────
  // Aggregate qualified reads per book-author for the month
  const qualifiedReadsByBook = await QualifiedRead.aggregate([
    { $match: { year, month, isQualified: true, isFraudFlag: false } },
    { $group: { _id: '$book', qualifiedReads: { $sum: 1 } } }
  ]);

  // Map book → author
  const bookIds = qualifiedReadsByBook.map(r => r._id);
  const books = await Book.find({ _id: { $in: bookIds } }, 'author').lean();
  const bookAuthorMap = {};
  books.forEach(b => { bookAuthorMap[b._id.toString()] = b.author.toString(); });

  // Aggregate per author
  const authorReadsMap = {};
  let totalQualifiedReads = 0;
  for (const row of qualifiedReadsByBook) {
    const authorId = bookAuthorMap[row._id.toString()];
    if (!authorId) continue;
    authorReadsMap[authorId] = (authorReadsMap[authorId] || 0) + row.qualifiedReads;
    totalQualifiedReads += row.qualifiedReads;
  }

  // Persist author earnings
  const authorResults = [];
  for (const [authorId, reads] of Object.entries(authorReadsMap)) {
    const earnings = totalQualifiedReads > 0
      ? Number(BigInt(reads) * BigInt(authorsPool) / BigInt(totalQualifiedReads))
      : 0;

    const status = earnings >= config.minAuthorPayoutInPaise ? 'pending' : 'rolled_over';

    await AuthorEarnings.findOneAndUpdate(
      { author: authorId, year, month },
      {
        author: authorId, year, month,
        qualifiedReads: reads,
        totalPlatformReads: totalQualifiedReads,
        earningsInPaise: Number(earnings),
        authorsPoolInPaise: authorsPool,
        status,
        computedAt: new Date(),
        revenueSnapshot: adRevenue._id
      },
      { upsert: true, new: true }
    );
    authorResults.push({ authorId, reads, earningsInPaise: Number(earnings), status });
  }

  // ── 5. Reader Rewards ──────────────────────────────────────
  const engagementScores = await EngagementScore.find(
    { year, month, fraudFlag: false },
    'user totalScore'
  ).lean();

  const totalPlatformScore = engagementScores.reduce((acc, s) => acc + s.totalScore, 0);

  const readerResults = [];
  for (const scoreDoc of engagementScores) {
    const reward = totalPlatformScore > 0
      ? Number(BigInt(scoreDoc.totalScore) * BigInt(readersPool) / BigInt(totalPlatformScore))
      : 0;

    const status = reward >= config.minReaderPayoutInPaise ? 'pending' : 'rolled_over';

    await ReaderReward.findOneAndUpdate(
      { user: scoreDoc.user, year, month },
      {
        user: scoreDoc.user, year, month,
        engagementScore: scoreDoc.totalScore,
        totalPlatformScore,
        rewardInPaise: Number(reward),
        readersPoolInPaise: readersPool,
        status,
        computedAt: new Date(),
        revenueSnapshot: adRevenue._id
      },
      { upsert: true, new: true }
    );
    readerResults.push({ userId: scoreDoc.user, score: scoreDoc.totalScore, rewardInPaise: Number(reward), status });
  }

  // ── 6. Finalize ────────────────────────────────────────────
  adRevenue.isFinalized = true;
  await adRevenue.save();

  return {
    year, month,
    netRevenueInPaise: R,
    platformPoolInPaise: platformPool,
    authorsPoolInPaise: authorsPool,
    readersPoolInPaise: readersPool,
    totalQualifiedReads,
    totalPlatformScore,
    authorsComputed: authorResults.length,
    readersComputed: readerResults.length,
    authorResults,
    readerResults
  };
};

module.exports = { computeMonthlyRevenue };
