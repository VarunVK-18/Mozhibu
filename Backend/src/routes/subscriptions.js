/**
 * Subscription Routes — /api/subscriptions
 * Handles plan listing, Razorpay order creation, payment verification,
 * webhook handling, subscription management, and invoices.
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { getGateway } = require('../services/paymentGateway');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const Coupon = require('../models/Coupon');
const { getActiveSubscription } = require('../middleware/premiumContent');

// ─── GET /api/subscriptions/plans ────────────────────────────
router.get('/plans', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ displayOrder: 1, priceInPaise: 1 });
    res.json(plans.map(p => ({
      ...p.toObject(),
      priceDisplay: `${p.currency === 'INR' ? '₹' : p.currency} ${(p.priceInPaise / 100).toFixed(2)}`
    })));
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── POST /api/subscriptions/coupon/validate ─────────────────
router.post('/coupon/validate', protect, async (req, res) => {
  try {
    const { code, planId } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ msg: 'Invalid coupon code' });

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ msg: 'Coupon has expired or is not yet active' });
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ msg: 'Coupon usage limit reached' });
    }
    if (coupon.applicablePlans.length > 0 && planId &&
        !coupon.applicablePlans.map(p => p.toString()).includes(planId)) {
      return res.status(400).json({ msg: 'Coupon not applicable to this plan' });
    }

    // Calculate discounted price
    const plan = await SubscriptionPlan.findById(planId);
    const originalPrice = plan ? plan.priceInPaise : 0;
    const finalPrice = plan ? coupon.applyDiscount(originalPrice) : 0;

    res.json({
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      originalPriceInPaise: originalPrice,
      finalPriceInPaise: finalPrice,
      savings: originalPrice - finalPrice,
      savingsDisplay: `₹${((originalPrice - finalPrice) / 100).toFixed(2)}`
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── POST /api/subscriptions/purchase ────────────────────────
// Step 1: Create a Razorpay order and return it to frontend
router.post('/purchase', protect, async (req, res) => {
  try {
    const { planId, couponCode } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ msg: 'Plan not found or inactive' });
    }

    let finalAmountInPaise = plan.priceInPaise;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        finalAmountInPaise = coupon.applyDiscount(plan.priceInPaise);
        appliedCoupon = coupon._id;
      }
    }

    const gateway = getGateway('razorpay');
    const order = await gateway.createOrder(finalAmountInPaise, 'INR', {
      userId: req.user.id,
      planId: plan._id.toString()
    });

    res.json({
      orderId: order.id,
      amount: finalAmountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: plan.name
    });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ msg: 'Failed to create payment order' });
  }
});

// ─── POST /api/subscriptions/verify ──────────────────────────
// Step 2: Verify payment signature and activate subscription
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId, couponCode } = req.body;

    const gateway = getGateway('razorpay');
    const isValid = gateway.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return res.status(400).json({ msg: 'Payment verification failed. Invalid signature.' });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ msg: 'Plan not found' });

    let finalAmount = plan.priceInPaise;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        finalAmount = coupon.applyDiscount(plan.priceInPaise);
        appliedCoupon = coupon._id;
        // Increment usage count
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Expire any existing subscription
    await UserSubscription.updateMany(
      { user: req.user.id, status: 'active' },
      { $set: { status: 'expired' } }
    );

    const subscription = new UserSubscription({
      user: req.user.id,
      plan: plan._id,
      startDate,
      endDate,
      status: 'active',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amountPaidInPaise: finalAmount,
      couponApplied: appliedCoupon,
      planSnapshot: {
        name: plan.name,
        priceInPaise: plan.priceInPaise,
        currency: plan.currency,
        structuredBenefits: plan.structuredBenefits
      }
    });
    await subscription.save();

    res.json({
      msg: 'Subscription activated successfully!',
      subscription: {
        planName: plan.name,
        startDate,
        endDate,
        status: 'active'
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ msg: 'Server Error during payment verification' });
  }
});

// ─── POST /api/subscriptions/webhook ─────────────────────────
// Razorpay webhook handler (raw body required for signature check)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const gateway = getGateway('razorpay');

    const isValid = gateway.verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      return res.status(400).json({ msg: 'Invalid webhook signature' });
    }

    const event = JSON.parse(req.body.toString());
    console.log(`[Webhook] Event received: ${event.event}`);

    if (event.event === 'payment.captured') {
      // Payment confirmed by Razorpay servers — subscription should already be active
      // from the verify endpoint, but this is a safety net
      const paymentId = event.payload?.payment?.entity?.id;
      const existing = await UserSubscription.findOne({ razorpayPaymentId: paymentId });
      if (existing && existing.status !== 'active') {
        existing.status = 'active';
        await existing.save();
        console.log(`[Webhook] Activated subscription via webhook for payment ${paymentId}`);
      }
    }

    if (event.event === 'subscription.cancelled') {
      const razorpaySubId = event.payload?.subscription?.entity?.id;
      if (razorpaySubId) {
        await UserSubscription.updateMany(
          { razorpayOrderId: razorpaySubId },
          { $set: { status: 'cancelled', autoRenew: false } }
        );
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ msg: 'Webhook processing failed' });
  }
});

// ─── GET /api/subscriptions/me ────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const subscription = await getActiveSubscription(req.user.id);
    if (!subscription) {
      return res.json({ active: false, subscription: null });
    }
    res.json({
      active: true,
      subscription: {
        ...subscription.toObject(),
        plan: subscription.plan,
        daysRemaining: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── POST /api/subscriptions/me/cancel ───────────────────────
router.post('/me/cancel', protect, async (req, res) => {
  try {
    const subscription = await getActiveSubscription(req.user.id);
    if (!subscription) {
      return res.status(404).json({ msg: 'No active subscription found' });
    }
    subscription.autoRenew = false;
    await subscription.save();
    res.json({ msg: 'Auto-renewal cancelled. Your subscription remains active until expiry.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── GET /api/subscriptions/me/history ───────────────────────
router.get('/me/history', protect, async (req, res) => {
  try {
    const history = await UserSubscription.find({ user: req.user.id })
      .populate('plan', 'name durationDays')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
