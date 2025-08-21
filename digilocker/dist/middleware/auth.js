"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
function requireAuth(req, res, next) {
    const user = req.session?.user;
    if (!user) {
        return res.redirect('/login');
    }
    next();
}
function requireRole(roles) {
    return function (req, res, next) {
        const user = req.session?.user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).send('Forbidden');
        }
        next();
    };
}
