const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Fallback secret for development, use env in prod
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('--- NEW REGISTRATION REQUEST ---');
  console.log('Request Body:', req.body);
  try {
    const { username, email, mobile, password, preferredLanguage, favoriteGenres, authProvider, role } = req.body;

    // Check if email exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Email is already registered' });
    }

    user = new User({
      username,
      email,
      mobile,
      preferredLanguage,
      favoriteGenres,
      authProvider: authProvider || 'normal',
      role: 'reader', // Everyone starts as a reader
      authorStatus: role === 'writer' ? 'pending' : 'none'
    });

    if (user.authProvider === 'normal') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, mobile: user.mobile, role: user.role, authorStatus: user.authorStatus } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error: ' + err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password ? password.length : 0 });

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ msg: 'Email not registered' });
    }

    if (user.authProvider !== 'normal') {
      return res.status(400).json({ msg: `Please sign in using your ${user.authProvider} account` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Wrong password' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, mobile: user.mobile, role: user.role, authorStatus: user.authorStatus } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
