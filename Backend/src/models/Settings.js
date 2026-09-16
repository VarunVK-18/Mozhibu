const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  contactEmail: {
    type: String,
    default: 'contact.growthux@gmail.com'
  },
  contactPhone: {
    type: String,
    default: '+91 7648999213'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
