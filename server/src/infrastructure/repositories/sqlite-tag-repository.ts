import { TagRepository } from '../../domain/tag-repository.js';
import type { SQLiteDatabase } from '../database/database.js';

export class SQLiteTagRepository implements TagRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async listAll(): Promise<Array<{ id: string; name: string }>> {
    return this.db.prepare('SELECT id, name FROM tags ORDER BY name ASC').all() as Array<{ id: string; name: string }>;
  }
}
