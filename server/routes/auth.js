const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['buyer', 'vendor']).withMessage('Role must be buyer or vendor'),
    body('phone')
      .trim()
      .isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits')
      .isNumeric().withMessage('Phone number must contain only numbers'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, role } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'Email already registered.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({ name, email, passwordHash, phone, role });

      return res.status(201).json({
        message: 'Registration successful.',
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error.' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      return res.json({
        message: 'Login successful.',
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error.' });
    }
  }
);

// GET /api/auth/me
router.get('/me', require('../middleware/authMiddleware').protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
