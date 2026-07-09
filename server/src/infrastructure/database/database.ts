import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { runMigrations } from './migrations.js';

export type SQLiteDatabase = InstanceType<typeof Database>;

const defaultDatabasePath = (): string => resolve(process.cwd(), 'server', 'data', 'codesnippets.db');

export const createDatabase = (filename = process.env.DATABASE_PATH ?? defaultDatabasePath()): SQLiteDatabase => {
  if (filename !== ':memory:') {
    mkdirSync(dirname(filename), { recursive: true });
  }

  const db = new Database(filename);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  runMigrations(db);
  return db;
};

export const checkDatabaseConnection = (db: SQLiteDatabase): boolean => {
  try {
    db.prepare('SELECT 1').get();
    return true;
  } catch {
    return false;
  }
};
