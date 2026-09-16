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
  status: {
    type: String,
    enum: ['new', 'read'],
    default: 'new'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContactQuery', contactQuerySchema);
