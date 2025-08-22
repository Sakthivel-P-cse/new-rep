import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { SessionUser } from '../lib/types';

const router = Router();

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email) as any;
  if (!user) return res.render('login', { error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.render('login', { error: 'Invalid credentials' });
  const sessionUser: SessionUser = {
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
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'org' | 'admin';
  };

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
  if (existing) {
    return res.render('register', { error: 'Email already in use' });
  }
  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare(
    'INSERT INTO users (id, role, email, name, password_hash, created_at) VALUES (?,?,?,?,?,?)'
  ).run(id, role, email, name, passwordHash, dayjs().toISOString());

  return res.redirect('/login');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

export default router;

