const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorHandler');

const authenticate = {
    // Protect routes
    isAuthenticatedUser: async (req, res, next) => {
        try {
            let token;

            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            } else if (req.cookies.token) {
                token = req.cookies.token;
            }

            if (!token) {
                return next(new ErrorResponse('Not authorized to access this route', 401));
            }

            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id);
                next();
            } catch (err) {
                return next(new ErrorResponse('Not authorized to access this route', 401));
            }
        } catch (error) {
            next(error);
        }
    },

    // Grant access to specific roles
    authorizeRoles: (...roles) => {
        return (req, res, next) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return next(
                    new ErrorResponse(
                        `User role ${req.user ? req.user.role : 'UNDEFINED'} is not authorized to access this route`,
                        403
                    )
                );
            }
            next();
        };
    }
};

module.exports = authenticate;
