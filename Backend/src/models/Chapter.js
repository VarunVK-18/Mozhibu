const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    season: { type: Number, default: 1 },
    title: { type: String, required: true },
    content: { type: String, required: true },
    cover: { type: String },
    order: { type: Number, required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    translations: { type: Map, of: String, default: {} },
    titleTranslations: { type: Map, of: String, default: {} },
    accessType: {
      type: String,
      enum: ["inherit", "free", "premium"],
      default: "inherit",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Chapter", ChapterSchema);
