const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percent', 'flat'], required: true },
  discountValue: { type: Number, required: true }, // percent: 0-100, flat: paise amount
  maxUses: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  applicablePlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' }] // empty = all plans
}, { timestamps: true });

/**
 * Apply coupon discount to a price in paise.
 * Returns the final price after discount (minimum 0).
 */
CouponSchema.methods.applyDiscount = function(priceInPaise) {
  if (this.discountType === 'percent') {
    const discount = Math.floor(priceInPaise * this.discountValue / 100);
    return Math.max(0, priceInPaise - discount);
  } else {
    return Math.max(0, priceInPaise - this.discountValue);
  }
};

module.exports = mongoose.model('Coupon', CouponSchema);
