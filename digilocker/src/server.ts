import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import expressEjsLayouts from 'express-ejs-layouts';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { db } from './db';
import authRoutes from './routes/auth';
import certRoutes from './routes/certificates';
import shareRoutes from './routes/share';
import { injectUserToViews } from './middleware/layout';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

const SQLiteStore = connectSqlite3(session);

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(expressEjsLayouts);
app.set('layout', 'layout');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use(injectUserToViews);

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: process.cwd() }) as any,
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.use('/', authRoutes);

app.get('/dashboard', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  const certs = db
    .prepare('SELECT * FROM certificates WHERE owner_user_id = ? ORDER BY created_at DESC')
    .all(user.id) as any[];
  res.render('dashboard', { user, certs });
});

app.use('/certificates', certRoutes);
app.use('/share', shareRoutes);

app.listen(PORT, () => {
  console.log(`DigiLocker server running at http://localhost:${PORT}`);
});

