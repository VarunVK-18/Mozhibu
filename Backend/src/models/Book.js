const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cover: { type: String }, // URL to image
  genre: { type: String, required: true },
  competitionTag: { type: String },
  description: { type: String },
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  isAudio: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'published', 'rejected', 'suspended'], default: 'published' },
  rejectionReason: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  titleTranslations: { type: Map, of: String, default: {} },
  tags: { type: [String], default: [] },
  series: { type: String },
  completionStatus: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  originalLanguage: { type: String, default: 'English' },
  accessType: { type: String, enum: ['free', 'premium'], default: 'free' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);
