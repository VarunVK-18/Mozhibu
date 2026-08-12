const mongoose = require('mongoose');

const QualifiedReadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  completionPercent: { type: Number, default: 0, min: 0, max: 100 },
  timeOnPageSeconds: { type: Number, default: 0 },
  // Anti-fraud flags
  isFraudFlag: { type: Boolean, default: false },
  fraudReason: { type: String },
  // Qualification result
  isQualified: { type: Boolean, default: false },
  readAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for aggregation performance
QualifiedReadSchema.index({ book: 1, month: 1, year: 1 });
QualifiedReadSchema.index({ user: 1, month: 1, year: 1 });
QualifiedReadSchema.index({ isQualified: 1, month: 1, year: 1 });

module.exports = mongoose.model('QualifiedRead', QualifiedReadSchema);
