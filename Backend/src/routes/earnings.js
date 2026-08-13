/**
 * Earnings & Rewards Routes — User-facing
 * /api/earnings  — Author earnings dashboard data
 * /api/rewards   — Reader rewards dashboard data
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AuthorEarnings = require('../models/AuthorEarnings');
const ReaderReward = require('../models/ReaderReward');
const QualifiedRead = require('../models/QualifiedRead');
const EngagementScore = require('../models/EngagementScore');
const RevenueSplitConfig = require('../models/RevenueSplitConfig');
const MonthlyAdRevenue = require('../models/MonthlyAdRevenue');
const { recordReadEvent } = require('../services/engagementScorer');

// ─── Author Earnings ──────────────────────────────────────────

// GET /api/earnings/me — full history
router.get('/earnings/me', protect, async (req, res) => {
  try {
    const earnings = await AuthorEarnings.find({ author: req.user.id })
      .sort({ year: -1, month: -1 });

    const totalPaid = earnings
      .filter(e => e.status === 'paid')
      .reduce((s, e) => s + e.earningsInPaise, 0);

    const totalPending = earnings
      .filter(e => e.status === 'pending')
      .reduce((s, e) => s + e.earningsInPaise, 0);
      
    const totalRequested = earnings
      .filter(e => e.status === 'requested')
      .reduce((s, e) => s + e.earningsInPaise, 0);
      
    let config = await RevenueSplitConfig.findOne().sort({ createdAt: -1 });
    const minPayoutInPaise = config ? config.minAuthorPayoutInPaise : 10000;

    res.json({
      earnings: earnings.map(e => ({
        ...e.toObject(),
        earningsDisplay: `₹${(e.earningsInPaise / 100).toFixed(2)}`
      })),
      summary: {
        totalPaidInPaise: totalPaid,
        totalPendingInPaise: totalPending,
        totalRequestedInPaise: totalRequested,
        totalPaidDisplay: `₹${(totalPaid / 100).toFixed(2)}`,
        totalPendingDisplay: `₹${(totalPending / 100).toFixed(2)}`,
        totalRequestedDisplay: `₹${(totalRequested / 100).toFixed(2)}`,
        minPayoutInPaise: minPayoutInPaise
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST /api/earnings/withdraw — Request payout for pending earnings
router.post('/earnings/withdraw', protect, async (req, res) => {
  try {
    const earnings = await AuthorEarnings.find({ author: req.user.id, status: 'pending' });
    
    if (earnings.length === 0) {
      return res.status(400).json({ msg: 'No pending earnings to withdraw' });
    }
    
    const totalPending = earnings.reduce((s, e) => s + e.earningsInPaise, 0);
    
    let config = await RevenueSplitConfig.findOne().sort({ createdAt: -1 });
    const minPayoutInPaise = config ? config.minAuthorPayoutInPaise : 10000;
    
    if (totalPending < minPayoutInPaise) {
      return res.status(400).json({ msg: `Minimum withdrawal amount is ₹${(minPayoutInPaise / 100).toFixed(2)}` });
    }
    
    // Update all pending to requested
    await AuthorEarnings.updateMany(
      { author: req.user.id, status: 'pending' },
      { $set: { status: 'requested' } }
    );
    
    res.json({ msg: 'Withdrawal requested successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET /api/earnings/me/projection — current month estimate
router.get('/earnings/me/projection', protect, async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Get this author's qualified reads this month
    const myBooks = await require('../models/Book').find({ author: req.user.id }, '_id').lean();
    const myBookIds = myBooks.map(b => b._id);

    const myReads = await QualifiedRead.countDocuments({
      book: { $in: myBookIds }, month, year, isQualified: true, isFraudFlag: false
    });

    const totalReads = await QualifiedRead.countDocuments({
      month, year, isQualified: true, isFraudFlag: false
    });

    // Get latest ad revenue as a reference point
    const latestRevenue = await MonthlyAdRevenue.findOne().sort({ year: -1, month: -1 });
    const config = await RevenueSplitConfig.findOne().sort({ createdAt: -1 });

    const authorsPercent = config?.authorsPercent || 15;
    const estimatedPool = latestRevenue
      ? Math.floor(latestRevenue.netRevenueInPaise * authorsPercent / 100)
      : 0;

    const estimatedEarnings = totalReads > 0 && estimatedPool > 0
      ? Math.floor(myReads / totalReads * estimatedPool)
      : 0;

    res.json({
      month, year,
      myQualifiedReads: myReads,
      totalPlatformReads: totalReads,
      estimatedEarningsInPaise: estimatedEarnings,
      estimatedEarningsDisplay: `₹${(estimatedEarnings / 100).toFixed(2)}`,
      note: 'Projection based on last month\'s ad revenue. Actual earnings computed at month end.'
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Reader Rewards ───────────────────────────────────────────

// GET /api/rewards/me — full history
router.get('/rewards/me', protect, async (req, res) => {
  try {
    const rewards = await ReaderReward.find({ user: req.user.id })
      .sort({ year: -1, month: -1 });

    const totalPaid = rewards
      .filter(r => r.status === 'paid')
      .reduce((s, r) => s + r.rewardInPaise, 0);

    const totalPending = rewards
      .filter(r => r.status === 'pending')
      .reduce((s, r) => s + r.rewardInPaise, 0);

    // Get current month engagement score
    const now = new Date();
    const currentScore = await EngagementScore.findOne({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    res.json({
      rewards: rewards.map(r => ({
        ...r.toObject(),
        rewardDisplay: `₹${(r.rewardInPaise / 100).toFixed(2)}`
      })),
      currentMonthScore: currentScore,
      summary: {
        totalPaidInPaise: totalPaid,
        totalPendingInPaise: totalPending,
        totalPaidDisplay: `₹${(totalPaid / 100).toFixed(2)}`,
        totalPendingDisplay: `₹${(totalPending / 100).toFixed(2)}`
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Read Event Tracking ──────────────────────────────────────

// POST /api/rewards/track-read
// Called by the chapter reader to log a reading event
router.post('/rewards/track-read', protect, async (req, res) => {
  try {
    const { bookId, chapterId, completionPercent, timeOnPageSeconds } = req.body;
    await recordReadEvent(req.user.id, bookId, chapterId, completionPercent, timeOnPageSeconds);
    res.json({ msg: 'Reading event recorded' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
