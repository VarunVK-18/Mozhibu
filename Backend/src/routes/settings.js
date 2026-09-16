const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, superadmin } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get global settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings
// @desc    Update global settings
// @access  Private (Superadmin)
router.put('/', protect, superadmin, async (req, res) => {
  try {
    const { contactEmail, contactPhone } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }
    
    if (contactEmail) settings.contactEmail = contactEmail;
    if (contactPhone) settings.contactPhone = contactPhone;
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
