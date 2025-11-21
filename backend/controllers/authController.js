// backend/controllers/authController.js
const { User } = require('../models');
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

    email = email.trim().toLowerCase();
    name = name.trim();

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email already used' });

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ msg: 'Registered', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('register err', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ msg: 'Logged in', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('login err', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get current user info
exports.me = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const user = await User.findById(userId).select('_id name email avatarUrl').lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({ user: { id: user._id.toString(), name: user.name, email: user.email, avatarUrl: user.avatarUrl || null } });
  } catch (err) {
    console.error('me err', err.message || err);
    res.status(401).json({ msg: 'Invalid token' });
  }
};