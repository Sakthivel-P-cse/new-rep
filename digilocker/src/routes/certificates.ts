import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const unique = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, unique);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', requireAuth, (req, res) => {
  const userId = req.session.user!.id;
  const rows = db
    .prepare('SELECT * FROM certificates WHERE owner_user_id = ? ORDER BY created_at DESC')
    .all(userId) as any[];
  res.render('certificates', { certificates: rows });
});

router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  const { title, description, issued_by, issued_at } = req.body as Record<string, string>;
  if (!req.file) return res.status(400).send('No file uploaded');
  const id = uuidv4();
  const userId = req.session.user!.id;
  db.prepare(
    `INSERT INTO certificates (id, owner_user_id, title, description, file_path, mime_type, file_size_bytes, issued_by, issued_at, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    userId,
    title,
    description || null,
    req.file.path,
    req.file.mimetype,
    req.file.size,
    issued_by || null,
    issued_at || null,
    dayjs().toISOString()
  );
  res.redirect('/dashboard');
});

router.post('/upload-for-student', requireAuth, upload.single('file'), (req, res) => {
  const actor = req.session.user!;
  if (!(actor.role === 'org' || actor.role === 'admin')) {
    return res.status(403).send('Forbidden');
  }
  const { student_email, title, description, issued_by, issued_at } = req.body as any;
  const student = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(student_email, 'student') as any;
  if (!student) return res.status(404).send('Student not found');
  if (!req.file) return res.status(400).send('No file uploaded');
  const id = uuidv4();
  db.prepare(
    `INSERT INTO certificates (id, owner_user_id, title, description, file_path, mime_type, file_size_bytes, issued_by, issued_at, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    student.id,
    title,
    description || null,
    req.file.path,
    req.file.mimetype,
    req.file.size,
    issued_by || null,
    issued_at || null,
    dayjs().toISOString()
  );
  res.redirect('/dashboard');
});

router.get('/:id/download', requireAuth, (req, res) => {
  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(req.params.id) as any;
  if (!cert) return res.status(404).send('Not found');
  if (cert.owner_user_id !== req.session.user!.id) return res.status(403).send('Forbidden');
  res.download(cert.file_path, path.basename(cert.file_path));
});

export default router;

