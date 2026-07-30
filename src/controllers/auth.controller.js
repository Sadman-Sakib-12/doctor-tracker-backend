const User = require('../models/User.model');
const { sendTokenResponse } = require('../utils/jwt');

/**
 * @route  POST /api/auth/register
 * @desc   Register a new admin user
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /api/auth/login
 * @desc   Login an admin user
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /api/auth/logout
 * @desc   Clear token cookie
 * @access Private
 */
const logout = (_req, res) => {
  res
    .clearCookie('token')
    .json({ success: true, message: 'Logged out successfully' });
};

/**
 * @route  GET /api/auth/me
 * @desc   Get current authenticated user
 * @access Private
 */
const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, logout, getMe };
