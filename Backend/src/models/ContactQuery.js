const mongoose = require('mongoose');

const contactQuerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminReply: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'solved'],
    default: 'new'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContactQuery', contactQuerySchema);
