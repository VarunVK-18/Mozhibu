const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cover: { type: String }, // URL to image
  genre: { type: String, required: true },
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  isAudio: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  titleTranslations: { type: Map, of: String, default: {} }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);
