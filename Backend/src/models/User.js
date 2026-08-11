const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String }, // Optional for oauth, but required for 'normal'
  preferredLanguage: { type: String, required: true },
  favoriteGenres: { type: [String], required: true },
  authProvider: { type: String, enum: ['normal', 'google', 'facebook'], default: 'normal' },
  role: { type: String, enum: ['reader', 'writer', 'superadmin'], default: 'reader' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  authorStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  followersCount: { type: Number, default: 0 },
  savedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
