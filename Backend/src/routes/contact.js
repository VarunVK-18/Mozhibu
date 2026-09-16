const express = require('express');
const router = express.Router();
const ContactQuery = require('../models/ContactQuery');
const { protect, superadmin } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit a new contact query
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    const query = new ContactQuery({ name, email, message });
    await query.save();

    res.status(201).json({ msg: 'Contact query submitted successfully', query });
  } catch (error) {
    console.error('Error submitting contact query:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/contact
// @desc    Get all contact queries
// @access  Private (Superadmin)
router.get('/', protect, superadmin, async (req, res) => {
  try {
    const queries = await ContactQuery.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    console.error('Error fetching contact queries:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/contact/:id/read
// @desc    Mark a contact query as read
// @access  Private (Superadmin)
router.put('/:id/read', protect, superadmin, async (req, res) => {
  try {
    const query = await ContactQuery.findById(req.params.id);
    
    if (!query) {
      return res.status(404).json({ msg: 'Contact query not found' });
    }

    query.status = 'read';
    await query.save();

    res.json({ msg: 'Marked as read', query });
  } catch (error) {
    console.error('Error updating contact query:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
