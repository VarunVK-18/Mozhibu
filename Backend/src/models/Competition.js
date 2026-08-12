const mongoose = require('mongoose');

const CompetitionSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true
  },
  tag: {
    type: String,
    required: true,
    default: 'Writing competition'
  },
  title: {
    type: String,
    required: true,
    default: 'The Twelve Tongues Prize 2026'
  },
  description: {
    type: String,
    required: true,
    default: 'One theme, twelve languages. Submit an original short story in your mother tongue for a shot at ₹1,00,000 and a featured spot on the homepage.'
  },
  endDate: {
    type: Date,
    required: true,
    default: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d;
    }
  },
  buttonText: {
    type: String,
    required: true,
    default: 'Submit your story'
  },
  buttonLink: {
    type: String,
    required: true,
    default: '/write/new'
  }
});

module.exports = mongoose.model('Competition', CompetitionSchema);
