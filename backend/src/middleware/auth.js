const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes by verifying JWT tokens and ensuring user status is Active
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database (including select('password') if required by profile routes,
      // but select('-password') is default because User schema hides it by default)
      req.user = await User.findById(decoded.id).select('+password');

      if (!req.user) {
        return res.status(401).json({ message: 'User account not found' });
      }

      // Check if user is banned (Laravel status check)
      if (req.user.status === 'Banned') {
        return res.status(403).json({
          message: 'Your account has been banned. Please contact support.',
        });
      }

      next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
