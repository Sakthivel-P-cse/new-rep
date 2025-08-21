"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const dayjs_1 = __importDefault(require("dayjs"));
const router = (0, express_1.Router)();
router.get('/:token', (req, res) => {
    const { token } = req.params;
    const link = db_1.db.prepare('SELECT * FROM share_links WHERE token = ?').get(token);
    if (!link)
        return res.status(404).send('Invalid link');
    if (link.expires_at && (0, dayjs_1.default)(link.expires_at).isBefore((0, dayjs_1.default)())) {
        return res.status(410).send('Link expired');
    }
    const cert = db_1.db.prepare('SELECT * FROM certificates WHERE id = ?').get(link.certificate_id);
    if (!cert)
        return res.status(404).send('Certificate not found');
    res.render('share', { cert });
});
exports.default = router;
