// ============================================
// AUTHENTICATION MIDDLEWARE - JWT Verification
// ============================================
// This file contains middleware functions for protecting routes
// and verifying user authentication using JSON Web Tokens (JWT)

const jwt = require('jsonwebtoken'); // Library for creating and verifying JWTs
const dotenv = require('dotenv'); // Load environment variables

dotenv.config(); // Load .env file
const JWT_SECRET = process.env.JWT_SECRET; // Secret key for signing/verifying tokens

// ============================================
// VERIFY TOKEN MIDDLEWARE
// ============================================
// This middleware verifies that the request includes a valid JWT
// It protects routes by ensuring only authenticated users can access them
// Usage: router.get('/protected-route', verifyToken, (req, res) => {...})
exports.verifyToken = (req, res, next) => {
  // Extract Authorization header from request
  // Expected format: "Bearer <token>"
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  // Extract the token part (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token signature and decode payload
    // jwt.verify() throws an error if token is invalid or expired
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Store the user ID in the request object for use in route handlers
    // Other middleware/routes can now access req.user.id
    req.user = { id: decoded.id };
    
    // Token is valid, proceed to next middleware or route handler
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    
    // Check if token expired specifically
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    
    // Token is invalid for other reasons (tampered, wrong secret, etc.)
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

// ============================================
// RESOURCE OWNER AUTHORIZATION MIDDLEWARE
// ============================================
// This middleware ensures that a user can only access/modify their own resources
// Prevents users from accessing or modifying other users' data
// Usage: router.put('/user/:id', verifyToken, isResourceOwner, (req, res) => {...})
exports.isResourceOwner = (req, res, next) => {
  // Check if the authenticated user ID matches the requested resource user ID
  // Compare both req.params.id (from URL) and req.body.userId (from request body)
  // String() conversion ensures ObjectId and string comparisons work correctly
  if (String(req.user.id) !== String(req.params.id) && 
      String(req.user.id) !== String(req.body.userId)) {
    // User is trying to access someone else's resource
    return res.status(403).json({ message: 'Not authorized to access this resource' });
  }
  
  // User owns this resource, allow the request to proceed
  next();
};

// ============================================
// ADMIN AUTHORIZATION MIDDLEWARE (Placeholder)
// ============================================
// This is a placeholder for future role-based access control (RBAC)
// Currently not implemented - would require adding a 'role' field to User model
// Future implementation: Check if user has admin role before allowing access
exports.isAdmin = (req, res, next) => {
  // This is a placeholder for future role-based access control
  // You would need to add a 'role' field to your User model
  // and check if the user has admin privileges
  // Example implementation:
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ message: 'Admin access required' });
  // }
  next(); // Currently allows all authenticated users through
};