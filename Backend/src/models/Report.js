const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String, required: true },
    comment: { type: String },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    adminNotes: { type: String },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Report", ReportSchema);
