// This middleware assumes that `req.user.role` is set by `authMiddleware`

const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ msg: 'Access denied. User role not found.' });
        }

        const hasRole = allowedRoles.includes(req.user.role);
        if (!hasRole) {
            return res.status(403).json({ msg: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};

module.exports = roleMiddleware;
