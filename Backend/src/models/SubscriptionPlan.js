const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  priceInPaise: { type: Number, required: true }, // e.g., 9900 = ₹99.00
  currency: { type: String, default: 'INR' },
  durationDays: { type: Number, required: true },
  benefits: [{ type: String }],
  terms: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
