const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Feedback content is required'],
      trim: true,
      maxlength: [2000, 'Feedback cannot be more than 2000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'fixed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
