const mongoose = require('mongoose');

const PublicationRequestSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: { type: String },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PublicationRequest', PublicationRequestSchema);
