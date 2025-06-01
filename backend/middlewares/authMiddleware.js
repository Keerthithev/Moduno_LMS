const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - verify JWT token
// Middleware to protect routes
exports.protect = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Or your JWT secret
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please authenticate.",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this route.`,
      })
    }

    next()
  }
}

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "moduno_secret_key")
        const user = await User.findById(decoded.userId)

        if (user && user.isActive) {
          req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log("Invalid token in optional auth:", error.message)
      }
    }

    next()
  } catch (error) {
    console.error("Optional auth middleware error:", error)
    next()
  }
}
