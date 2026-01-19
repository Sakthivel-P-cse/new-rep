"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const dayjs_1 = __importDefault(require("dayjs"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const stmt = db_1.db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    if (!user)
        return res.render('login', { error: 'Invalid credentials' });
    const ok = bcryptjs_1.default.compareSync(password, user.password_hash);
    if (!ok)
        return res.render('login', { error: 'Invalid credentials' });
    const sessionUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    };
    req.session.user = sessionUser;
    return res.redirect('/dashboard');
});
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});
router.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;
    const existing = db_1.db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        return res.render('register', { error: 'Email already in use' });
    }
    const id = (0, uuid_1.v4)();
    const passwordHash = bcryptjs_1.default.hashSync(password, 10);
    db_1.db.prepare('INSERT INTO users (id, role, email, name, password_hash, created_at) VALUES (?,?,?,?,?,?)').run(id, role, email, name, passwordHash, (0, dayjs_1.default)().toISOString());
    return res.redirect('/login');
});
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});
exports.default = router;
