/**
 * Revenue Routes — /api/revenue (Admin only)
 * Handles: split config, ad revenue import, computation trigger, reports, payouts.
 */

const express = require('express');
const router = express.Router();
const { protect, superadmin } = require('../middleware/auth');
const { computeMonthlyRevenue } = require('../services/revenueEngine');
const { computeEngagementScores } = require('../services/engagementScorer');

const MonthlyAdRevenue = require('../models/MonthlyAdRevenue');
const RevenueSplitConfig = require('../models/RevenueSplitConfig');
const EngagementScoreConfig = require('../models/EngagementScoreConfig');
const AuthorEarnings = require('../models/AuthorEarnings');
const ReaderReward = require('../models/ReaderReward');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const Coupon = require('../models/Coupon');

// ─── Revenue Split Config ─────────────────────────────────────

// GET /api/revenue/config
router.get('/config', protect, superadmin, async (req, res) => {
  try {
    const config = await RevenueSplitConfig.findOne().sort({ createdAt: -1 });
    const engConfig = await EngagementScoreConfig.findOne().sort({ createdAt: -1 });
    res.json({ splitConfig: config, engagementConfig: engConfig });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// PUT /api/revenue/config
router.put('/config', protect, superadmin, async (req, res) => {
  try {
    const { platformPercent, authorsPercent, readersPercent,
            minAuthorPayoutInPaise, minReaderPayoutInPaise } = req.body;

    const config = new RevenueSplitConfig({
      platformPercent, authorsPercent, readersPercent,
      minAuthorPayoutInPaise, minReaderPayoutInPaise,
      updatedBy: req.user.id
    });
    await config.save();
    res.json(config);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// PUT /api/revenue/engagement-config
router.put('/engagement-config', protect, superadmin, async (req, res) => {
  try {
    const config = new EngagementScoreConfig({ ...req.body, updatedBy: req.user.id });
    await config.save();
    res.json(config);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// ─── Monthly Ad Revenue Import ────────────────────────────────

// POST /api/revenue/monthly
router.post('/monthly', protect, superadmin, async (req, res) => {
  try {
    const { month, year, grossRevenueInPaise, netRevenueInPaise, source, notes } = req.body;

    const existing = await MonthlyAdRevenue.findOne({ month, year });
    if (existing && existing.isFinalized) {
      return res.status(400).json({ msg: 'Revenue for this month is already finalized. Use force=true to override.' });
    }

    const record = await MonthlyAdRevenue.findOneAndUpdate(
      { month, year },
      { month, year, grossRevenueInPaise, netRevenueInPaise,
        source: source || 'manual', importedBy: req.user.id, importedAt: new Date(), notes },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── Computation Trigger ──────────────────────────────────────

// POST /api/revenue/compute/:year/:month
router.post('/compute/:year/:month', protect, superadmin, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const force = req.query.force === 'true';

    // First compute engagement scores
    await computeEngagementScores(year, month);

    // Then compute revenue distribution
    const report = await computeMonthlyRevenue(year, month, req.user.id, force);
    res.json(report);
  } catch (err) {
    console.error('Computation error:', err);
    res.status(500).json({ msg: err.message });
  }
});

// ─── Reports ─────────────────────────────────────────────────

// GET /api/revenue/report/:year/:month
router.get('/report/:year/:month', protect, superadmin, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const adRevenue = await MonthlyAdRevenue.findOne({ year, month });
    const authorEarnings = await AuthorEarnings.find({ year, month })
      .populate('author', 'username email')
      .sort({ earningsInPaise: -1 });
    const readerRewards = await ReaderReward.find({ year, month })
      .populate('user', 'username email')
      .sort({ rewardInPaise: -1 });

    const totalAuthorEarnings = authorEarnings.reduce((s, e) => s + e.earningsInPaise, 0);
    const totalReaderRewards = readerRewards.reduce((s, r) => s + r.rewardInPaise, 0);

    res.json({
      adRevenue,
      summary: {
        totalAuthorEarnings, totalReaderRewards,
        authorCount: authorEarnings.length,
        readerCount: readerRewards.length
      },
      authorEarnings,
      readerRewards
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET /api/revenue/analytics
router.get('/analytics', protect, superadmin, async (req, res) => {
  try {
    const activeSubscribers = await UserSubscription.countDocuments({
      status: 'active', endDate: { $gte: new Date() }
    });
    const totalRevenues = await MonthlyAdRevenue.find().sort({ year: -1, month: -1 }).limit(12);
    const planBreakdown = await UserSubscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    res.json({ activeSubscribers, monthlyRevenues: totalRevenues, planBreakdown });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Author Earnings Payout ───────────────────────────────────

// GET /api/revenue/author-earnings
router.get('/author-earnings', protect, superadmin, async (req, res) => {
  try {
    const { year, month, status } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);
    if (month) filter.month = parseInt(month);
    if (status) filter.status = status;
    const earnings = await AuthorEarnings.find(filter)
      .populate('author', 'username email')
      .sort({ earningsInPaise: -1 });
    res.json(earnings);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// PUT /api/revenue/author-earnings/:id/pay
router.put('/author-earnings/:id/pay', protect, superadmin, async (req, res) => {
  try {
    const earning = await AuthorEarnings.findById(req.params.id);
    if (!earning) return res.status(404).json({ msg: 'Earnings record not found' });
    if (earning.status === 'paid') return res.status(400).json({ msg: 'Already marked as paid' });

    earning.status = 'paid';
    earning.paidAt = new Date();
    earning.paidBy = req.user.id;
    await earning.save();
    res.json(earning);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// PUT /api/revenue/reader-rewards/:id/pay
router.put('/reader-rewards/:id/pay', protect, superadmin, async (req, res) => {
  try {
    const reward = await ReaderReward.findById(req.params.id);
    if (!reward) return res.status(404).json({ msg: 'Reward record not found' });
    if (reward.status === 'paid') return res.status(400).json({ msg: 'Already marked as paid' });

    reward.status = 'paid';
    reward.paidAt = new Date();
    reward.paidBy = req.user.id;
    await reward.save();
    res.json(reward);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Subscription Plan Management (Admin) ────────────────────

// POST /api/revenue/plans
router.post('/plans', protect, superadmin, async (req, res) => {
  try {
    const plan = new SubscriptionPlan({ ...req.body, createdBy: req.user.id });
    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// PUT /api/revenue/plans/:id
router.put('/plans/:id', protect, superadmin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ msg: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// DELETE /api/revenue/plans/:id  (soft delete — deactivate)
router.delete('/plans/:id', protect, superadmin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    res.json({ msg: 'Plan deactivated', plan });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Coupon Management ────────────────────────────────────────

// GET /api/revenue/coupons
router.get('/coupons', protect, superadmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST /api/revenue/coupons
router.post('/coupons', protect, superadmin, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// PUT /api/revenue/coupons/:id
router.put('/coupons/:id', protect, superadmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

module.exports = router;
