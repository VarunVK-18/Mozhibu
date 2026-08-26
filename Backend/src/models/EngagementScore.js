const mongoose = require("mongoose");

const EngagementScoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    // Component scores
    readingScore: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
    timeScore: { type: Number, default: 0 },
    interactionScore: { type: Number, default: 0 },
    // Weighted total
    totalScore: { type: Number, default: 0 },
    fraudFlag: { type: Boolean, default: false },
    fraudReason: { type: String },
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

EngagementScoreSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });
EngagementScoreSchema.index({ month: 1, year: 1, fraudFlag: 1 });

module.exports = mongoose.model("EngagementScore", EngagementScoreSchema);
