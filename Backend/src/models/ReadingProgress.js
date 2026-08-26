const mongoose = require("mongoose");

const ReadingProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    currentChapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    progressPercentage: { type: Number, default: 0 },
    lastReadAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ReadingProgress", ReadingProgressSchema);
