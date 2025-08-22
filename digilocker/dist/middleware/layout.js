"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectUserToViews = injectUserToViews;
function injectUserToViews(req, res, next) {
    res.locals.user = req.session?.user || null;
    next();
}
