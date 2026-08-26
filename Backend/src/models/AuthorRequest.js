const mongoose = require("mongoose");

const AuthorRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuthorRequest", AuthorRequestSchema);
