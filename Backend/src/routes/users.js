const express = require('express');
const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// @route PUT /api/users/upgrade-role
// @desc Upgrade a reader to a writer
router.put('/upgrade-role', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'writer' || user.role === 'superadmin') {
      return res.status(400).json({ msg: 'User is already an author or admin' });
    }
    
    if (user.authorStatus === 'pending') {
      return res.status(400).json({ msg: 'Author request is already pending' });
    }

    user.authorStatus = 'pending';
    await user.save();

    // Issue a new token with the updated authorStatus
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, mobile: user.mobile, role: user.role, authorStatus: user.authorStatus } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
