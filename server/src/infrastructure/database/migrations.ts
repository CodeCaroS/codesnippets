import type { SQLiteDatabase } from './database.js';

const statements = [
  `CREATE TABLE IF NOT EXISTS snippets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    html TEXT DEFAULT '',
    css TEXT DEFAULT '',
    javascript TEXT DEFAULT '',
    category TEXT DEFAULT '',
    favorite INTEGER DEFAULT 0,
    archived INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );`,
  `CREATE TABLE IF NOT EXISTS snippet_tags (
    snippet_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (snippet_id, tag_id),
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`,
];

export const runMigrations = (db: SQLiteDatabase): void => {
  for (const statement of statements) {
    db.prepare(statement).run();
  }
};
