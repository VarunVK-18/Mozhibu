const mongoose = require("mongoose");

const MonthlyAdRevenueSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    grossRevenueInPaise: { type: Number, required: true },
    netRevenueInPaise: { type: Number, required: true }, // After platform fees/taxes
    source: {
      type: String,
      enum: ["adsense_api", "manual"],
      default: "manual",
    },
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    importedAt: { type: Date, default: Date.now },
    isFinalized: { type: Boolean, default: false }, // Set to true after computation runs
    notes: { type: String },
  },
  { timestamps: true },
);

// Unique constraint: one record per month/year
MonthlyAdRevenueSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyAdRevenue", MonthlyAdRevenueSchema);
