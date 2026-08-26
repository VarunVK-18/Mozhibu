const mongoose = require("mongoose");

const SubscriptionPlanHistorySchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    fieldChanged: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin user id
    changedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

module.exports = mongoose.model(
  "SubscriptionPlanHistory",
  SubscriptionPlanHistorySchema,
);
