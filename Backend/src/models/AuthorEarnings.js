const mongoose = require('mongoose');

const AuthorEarningsSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  qualifiedReads: { type: Number, default: 0 },
  totalPlatformReads: { type: Number, default: 0 }, // snapshot of total platform reads at compute time
  earningsInPaise: { type: Number, default: 0 }, // integer math only
  authorsPoolInPaise: { type: Number, default: 0 }, // snapshot of pool used
  status: { type: String, enum: ['pending', 'requested', 'paid', 'rolled_over'], default: 'pending' },
  computedAt: { type: Date },
  paidAt: { type: Date },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revenueSnapshot: { type: mongoose.Schema.Types.ObjectId, ref: 'MonthlyAdRevenue' }
}, { timestamps: true });

// Unique per author per month/year
AuthorEarningsSchema.index({ author: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('AuthorEarnings', AuthorEarningsSchema);
