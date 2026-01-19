"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const dayjs_1 = __importDefault(require("dayjs"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const dir = path_1.default.join(process.cwd(), 'uploads');
            if (!fs_1.default.existsSync(dir))
                fs_1.default.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const unique = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
            cb(null, unique);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
});
router.get('/', auth_1.requireAuth, (req, res) => {
    const userId = req.session.user.id;
    const rows = db_1.db
        .prepare('SELECT * FROM certificates WHERE owner_user_id = ? ORDER BY created_at DESC')
        .all(userId);
    res.render('certificates', { certificates: rows });
});
router.post('/upload', auth_1.requireAuth, upload.single('file'), (req, res) => {
    const { title, description, issued_by, issued_at } = req.body;
    if (!req.file)
        return res.status(400).send('No file uploaded');
    const id = (0, uuid_1.v4)();
    const userId = req.session.user.id;
    db_1.db.prepare(`INSERT INTO certificates (id, owner_user_id, title, description, file_path, mime_type, file_size_bytes, issued_by, issued_at, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, userId, title, description || null, req.file.path, req.file.mimetype, req.file.size, issued_by || null, issued_at || null, (0, dayjs_1.default)().toISOString());
    res.redirect('/dashboard');
});
router.post('/upload-for-student', auth_1.requireAuth, upload.single('file'), (req, res) => {
    const actor = req.session.user;
    if (!(actor.role === 'org' || actor.role === 'admin')) {
        return res.status(403).send('Forbidden');
    }
    const { student_email, title, description, issued_by, issued_at } = req.body;
    const student = db_1.db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(student_email, 'student');
    if (!student)
        return res.status(404).send('Student not found');
    if (!req.file)
        return res.status(400).send('No file uploaded');
    const id = (0, uuid_1.v4)();
    db_1.db.prepare(`INSERT INTO certificates (id, owner_user_id, title, description, file_path, mime_type, file_size_bytes, issued_by, issued_at, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, student.id, title, description || null, req.file.path, req.file.mimetype, req.file.size, issued_by || null, issued_at || null, (0, dayjs_1.default)().toISOString());
    res.redirect('/dashboard');
});
router.get('/:id/download', auth_1.requireAuth, (req, res) => {
    const cert = db_1.db.prepare('SELECT * FROM certificates WHERE id = ?').get(req.params.id);
    if (!cert)
        return res.status(404).send('Not found');
    if (cert.owner_user_id !== req.session.user.id)
        return res.status(403).send('Forbidden');
    res.download(cert.file_path, path_1.default.basename(cert.file_path));
});
exports.default = router;
