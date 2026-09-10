const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect, superadmin } = require('../middleware/auth');

// @route   POST /api/feedback
// @desc    Submit a new bug report or feedback
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ msg: 'Feedback content is required' });
    }

    const feedback = new Feedback({
      user: req.user.id,
      content: content.trim(),
    });

    await feedback.save();

    res.status(201).json({ msg: 'Feedback submitted successfully', feedback });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback (superadmin only)
// @access  Private/SuperAdmin
router.get('/', protect, superadmin, async (req, res) => {
  try {
    // We populate user to show username/penName on the frontend
    const feedbacks = await Feedback.find()
      .populate('user', 'username penName email role')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/feedback/:id/fix
// @desc    Mark feedback as fixed (superadmin only)
// @access  Private/SuperAdmin
router.put('/:id/fix', protect, superadmin, async (req, res) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ msg: 'Feedback not found' });
    }

    feedback.status = 'fixed';
    await feedback.save();

    res.json({ msg: 'Feedback marked as fixed', feedback });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Feedback not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
