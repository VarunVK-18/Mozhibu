/**
 * Premium Content Middleware
 *
 * Checks whether the requesting user has an active subscription
 * before allowing access to premium chapters/stories.
 *
 * Returns 402 Payment Required with a subscription prompt payload
 * when the user lacks an active subscription.
 */

const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

/**
 * Checks if a user has a specific subscription benefit.
 * Checks the snapshot at time of purchase first, falling back to current plan definition.
 */
const hasEntitlement = async (userId, benefitKey) => {
  const sub = await getActiveSubscription(userId);
  if (!sub) return false;
  
  if (sub.planSnapshot && sub.planSnapshot.structuredBenefits) {
    return !!sub.planSnapshot.structuredBenefits[benefitKey];
  }
  
  if (sub.plan && sub.plan.structuredBenefits) {
    return !!sub.plan.structuredBenefits[benefitKey];
  }
  
  return false;
};

/**
 * Resolve effective access type for a chapter, respecting the
 * chapter-level → book-level override chain.
 *
 * @param {object} chapter - Chapter document (with accessType)
 * @param {object} book - Book document (with accessType)
 * @returns {'free' | 'premium'}
 */
const resolveAccessType = (chapter, book) => {
  if (chapter.accessType && chapter.accessType !== 'inherit') {
    return chapter.accessType;
  }
  return book.accessType || 'free';
};

/**
 * Middleware factory. Pass `{ requireActive: true }` (default) to enforce premium check.
 * Example usage in a route:
 *   router.get('/:chapterId', protect, premiumContent({ chapter, book }), handler)
 *
 * More common usage: call checkPremiumAccess() inside the route handler after loading
 * the chapter + book documents.
 */

/**
 * Check whether a user has an active subscription.
 * @param {string} userId
 * @returns {object|null} active UserSubscription doc or null
 */
const getActiveSubscription = async (userId) => {
  return await UserSubscription.findOne({
    user: userId,
    status: 'active',
    endDate: { $gte: new Date() }
  }).populate('plan', 'name durationDays');
};

/**
 * Build a 402 subscription prompt payload (sent instead of content).
 */
const buildSubscriptionPrompt = async () => {
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ priceInPaise: 1 });
  return {
    type: 'SUBSCRIPTION_REQUIRED',
    message: 'This content requires a Premium subscription.',
    plans: plans.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description,
      priceInPaise: p.priceInPaise,
      priceDisplay: `${p.currency === 'INR' ? '₹' : p.currency} ${(p.priceInPaise / 100).toFixed(2)}`,
      durationDays: p.durationDays,
      marketingBenefits: p.marketingBenefits
    }))
  };
};

/**
 * Express middleware: blocks unauthenticated or non-premium users from
 * content that has been determined to be `premium`.
 *
 * Usage: attach AFTER `protect` middleware and AFTER resolving chapter/book docs.
 * Pass `effectiveAccessType` in `req.effectiveAccessType` before calling.
 */
const premiumContent = async (req, res, next) => {
  // If content is free, pass through immediately
  if (!req.effectiveAccessType || req.effectiveAccessType === 'free') {
    return next();
  }

  // Premium content: user must be authenticated
  if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' });
  }

  // Check active subscription
  const subscription = await getActiveSubscription(req.user.id);
  if (subscription) {
    req.userSubscription = subscription;
    return next();
  }

  // No active subscription — return 402 with plan upsell
  const prompt = await buildSubscriptionPrompt();
  return res.status(402).json(prompt);
};

module.exports = {
  resolveAccessType,
  getActiveSubscription,
  buildSubscriptionPrompt,
  premiumContent,
  hasEntitlement
};
