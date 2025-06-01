// Middleware to handle async operations and catch errors
module.exports = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
