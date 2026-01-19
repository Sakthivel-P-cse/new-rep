import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbFilePath = path.join(process.cwd(), 'digilocker.sqlite');

if (!fs.existsSync(dbFilePath)) {
  console.log('[db] Creating new SQLite database at', dbFilePath);
}

export const db = new Database(dbFilePath);

db.pragma('journal_mode = WAL');

// Schema migrations (idempotent)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK(role IN ('admin','student','org')),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    issued_by TEXT,
    issued_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(owner_user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS share_links (
    token TEXT PRIMARY KEY,
    certificate_id TEXT NOT NULL,
    expires_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(certificate_id) REFERENCES certificates(id)
  );
`);

