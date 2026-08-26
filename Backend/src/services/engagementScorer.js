/**
 * Engagement Scorer — Nightly Cron Job
 *
 * Reads raw ReadingProgress, QualifiedRead raw events, and interaction
 * data to compute a monthly EngagementScore for each reader.
 *
 * Weights are loaded from EngagementScoreConfig for easy admin tuning.
 * Anti-fraud: flags users with implausibly high velocity (>500 chapters/day average).
 */

const ReadingProgress = require("../models/ReadingProgress");
const QualifiedRead = require("../models/QualifiedRead");
const EngagementScore = require("../models/EngagementScore");
const EngagementScoreConfig = require("../models/EngagementScoreConfig");
const Review = require("../models/Review");
const User = require("../models/User");

const MIN_COMPLETION_PERCENT = 30; // default, overridden by config
const MIN_TIME_SECONDS = 60;

/**
 * Compute and persist engagement scores for all users for a given month/year.
 * @param {number} year
 * @param {number} month  1-12
 */
const computeEngagementScores = async (year, month) => {
  // Load config (or defaults)
  let config = await EngagementScoreConfig.findOne().sort({ createdAt: -1 });
  if (!config) {
    config = {
      readingCompletionWeight: 40,
      consistencyWeight: 25,
      timeSpentWeight: 20,
      interactionWeight: 15,
      minCompletionPercentToQualify: MIN_COMPLETION_PERCENT,
      minTimeOnPageSeconds: MIN_TIME_SECONDS,
    };
  }

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 1);

  // ── Load raw qualified reads for the month ─────────────────
  const rawReads = await QualifiedRead.find({
    year,
    month,
    isFraudFlag: false,
  }).lean();

  // ── Group by user ──────────────────────────────────────────
  const userDataMap = {};
  for (const read of rawReads) {
    const uid = read.user.toString();
    if (!userDataMap[uid]) {
      userDataMap[uid] = { reads: [], totalTime: 0, daysActive: new Set() };
    }
    userDataMap[uid].reads.push(read);
    userDataMap[uid].totalTime += read.timeOnPageSeconds || 0;
    if (read.readAt) {
      userDataMap[uid].daysActive.add(new Date(read.readAt).toDateString());
    }
  }

  // ── Load interaction counts (reviews/likes from this month) ─
  const reviews = await Review.find({
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  }).lean();
  const reviewCountMap = {};
  reviews.forEach((r) => {
    const uid = r.user.toString();
    reviewCountMap[uid] = (reviewCountMap[uid] || 0) + 1;
  });

  // ── Compute scores ─────────────────────────────────────────
  const results = [];
  for (const [userId, data] of Object.entries(userDataMap)) {
    const qualifiedReads = data.reads.filter(
      (r) =>
        r.completionPercent >= config.minCompletionPercentToQualify &&
        r.timeOnPageSeconds >= config.minTimeOnPageSeconds,
    ).length;

    // Reading score: 0-100 based on qualified reads (cap at 200)
    const readingScore =
      Math.min(100, qualifiedReads / 2) *
      (config.readingCompletionWeight / 100);

    // Consistency score: 0-100 based on unique days active (cap at 30)
    const daysActive = data.daysActive.size;
    const consistencyScore =
      Math.min(100, (daysActive / 30) * 100) * (config.consistencyWeight / 100);

    // Time score: 0-100 based on total time (cap at 36000s = 10 hours)
    const timeScore =
      Math.min(100, (data.totalTime / 36000) * 100) *
      (config.timeSpentWeight / 100);

    // Interaction score: 0-100 based on reviews/comments (cap at 10)
    const interactions = reviewCountMap[userId] || 0;
    const interactionScore =
      Math.min(100, (interactions / 10) * 100) *
      (config.interactionWeight / 100);

    const totalScore = Math.round(
      readingScore + consistencyScore + timeScore + interactionScore,
    );

    // ── Anti-fraud: flag implausibly high velocity ───────────
    const daysInMonth = new Date(year, month, 0).getDate();
    const avgReadsPerDay = data.reads.length / daysInMonth;
    const fraudFlag = avgReadsPerDay > 500;
    const fraudReason = fraudFlag
      ? `Implausible velocity: ${avgReadsPerDay.toFixed(1)} reads/day`
      : undefined;

    await EngagementScore.findOneAndUpdate(
      { user: userId, year, month },
      {
        user: userId,
        year,
        month,
        readingScore: Math.round(readingScore),
        consistencyScore: Math.round(consistencyScore),
        timeScore: Math.round(timeScore),
        interactionScore: Math.round(interactionScore),
        totalScore,
        fraudFlag,
        fraudReason,
        computedAt: new Date(),
      },
      { upsert: true, returnDocument: "after" },
    );

    // Mark qualified reads for this user
    if (qualifiedReads > 0) {
      await QualifiedRead.updateMany(
        {
          user: userId,
          year,
          month,
          completionPercent: { $gte: config.minCompletionPercentToQualify },
          timeOnPageSeconds: { $gte: config.minTimeOnPageSeconds },
        },
        { $set: { isQualified: !fraudFlag } },
      );
    }

    results.push({ userId, totalScore, fraudFlag });
  }

  console.log(
    `[EngagementScorer] Computed scores for ${results.length} users — ${year}-${month}`,
  );
  return results;
};

/**
 * Record a raw reading event. Called from the chapter-read API.
 * Checks anti-fraud conditions before insertion.
 */
const recordReadEvent = async (
  userId,
  bookId,
  chapterId,
  completionPercent,
  timeOnPageSeconds,
) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Basic velocity check: don't record more than 100 events per user per hour
  const recentCount = await QualifiedRead.countDocuments({
    user: userId,
    readAt: { $gte: new Date(Date.now() - 3600_000) },
  });
  const isFraudFlag = recentCount > 100;
  const fraudReason = isFraudFlag ? "More than 100 reads in 1 hour" : undefined;

  await QualifiedRead.findOneAndUpdate(
    { user: userId, chapter: chapterId, month, year },
    {
      user: userId,
      book: bookId,
      chapter: chapterId,
      month,
      year,
      completionPercent,
      timeOnPageSeconds,
      isFraudFlag,
      fraudReason,
      isQualified: false, // set to true by nightly scorer
      readAt: now,
    },
    { upsert: true, returnDocument: "after" },
  );
};

module.exports = { computeEngagementScores, recordReadEvent };
