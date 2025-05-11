const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Store the user ID in the request object
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

// Middleware to check if user is authorized to access/modify a resource
exports.isResourceOwner = (req, res, next) => {
  // Check if the authenticated user ID matches the requested resource user ID
  if (String(req.user.id) !== String(req.params.id) && 
      String(req.user.id) !== String(req.body.userId)) {
    return res.status(403).json({ message: 'Not authorized to access this resource' });
  }
  next();
};

// For future implementation: Role-based access control
exports.isAdmin = (req, res, next) => {
  // This is a placeholder for future role-based access control
  // You would need to add a 'role' field to your User model
  // and check if the user has admin privileges
  next();
};