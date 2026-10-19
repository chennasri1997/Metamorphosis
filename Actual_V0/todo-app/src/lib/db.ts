import Database from 'better-sqlite3';
import path from 'path';

// Cache the connection on globalThis so dev-mode hot reload (and build workers
// importing this module more than once) reuse one instance instead of racing
// to open/create the same file concurrently.
const globalForDb = globalThis as unknown as { db?: Database.Database };

const dbPath = path.join(process.cwd(), 'data.db');
const db = globalForDb.db ?? new Database(dbPath, { timeout: 5000 });
globalForDb.db = db;

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    deadline TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL
  );
`);

export default db;
