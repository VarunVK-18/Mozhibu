const mongoose = require('mongoose');

const ReaderRewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  engagementScore: { type: Number, default: 0 },
  totalPlatformScore: { type: Number, default: 0 }, // snapshot
  rewardInPaise: { type: Number, default: 0 },       // integer math only
  readersPoolInPaise: { type: Number, default: 0 },  // snapshot of pool used
  status: { type: String, enum: ['pending', 'paid', 'rolled_over'], default: 'pending' },
  computedAt: { type: Date },
  paidAt: { type: Date },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revenueSnapshot: { type: mongoose.Schema.Types.ObjectId, ref: 'MonthlyAdRevenue' }
}, { timestamps: true });

ReaderRewardSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('ReaderReward', ReaderRewardSchema);
