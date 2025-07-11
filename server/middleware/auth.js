const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// Middleware to check if user is a worker
const isWorker = (req, res, next) => {
  if (req.user.userType !== 'worker') {
    return res.status(403).json({ message: 'Access denied. Worker role required.' });
  }
  next();
};

// Middleware to check if user is an employer
const isEmployer = (req, res, next) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ message: 'Access denied. Employer role required.' });
  }
  next();
};

// Middleware to check if user is verified
const isVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ message: 'Account verification required.' });
  }
  next();
};

module.exports = { auth, isWorker, isEmployer, isVerified }; 