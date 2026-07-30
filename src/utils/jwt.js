const jwt = require('jsonwebtoken');

/**
 * Sign a JWT token for the given payload.
 */
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Verify a JWT token and return its decoded payload.
 * Throws if invalid or expired.
 */
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

/**
 * Attach JWT cookie + JSON response helper.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken({ id: user._id, role: user.role });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

module.exports = { signToken, verifyToken, sendTokenResponse };
