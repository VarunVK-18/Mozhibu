const mongoose = require("mongoose");

const RevenueSplitConfigSchema = new mongoose.Schema(
  {
    platformPercent: { type: Number, required: true, default: 80 },
    authorsPercent: { type: Number, required: true, default: 15 },
    readersPercent: { type: Number, required: true, default: 5 },
    minAuthorPayoutInPaise: { type: Number, default: 10000 }, // ₹100 minimum payout
    minReaderPayoutInPaise: { type: Number, default: 5000 }, // ₹50 minimum payout
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RevenueSplitConfig", RevenueSplitConfigSchema);
