import { randomUUID } from 'node:crypto';
import { SnippetRepository } from '../../domain/snippet-repository.js';
import { Snippet, SnippetId, SnippetSearchQuery, UpdateSnippetCommand, applySnippetUpdate, normalizeSnippetTags } from '../../domain/snippet.js';
import type { SQLiteDatabase } from '../database/database.js';

interface SnippetRow {
  id: string;
  title: string;
  description: string;
  source_url: string;
  html: string;
  css: string;
  javascript: string;
  category: string;
  favorite: number;
  archived: number;
  created_at: string;
  updated_at: string;
}

export class SQLiteSnippetRepository implements SnippetRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findById(id: SnippetId): Promise<Snippet | null> {
    const row = this.db.prepare('SELECT * FROM snippets WHERE id = ?').get(id) as SnippetRow | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToSnippet(row);
  }

  async findAll(query: SnippetSearchQuery = {}): Promise<Snippet[]> {
    return this.querySnippets(query);
  }

  async save(snippet: Snippet): Promise<void> {
    const saveSnippet = this.db.transaction((entity: Snippet) => {
      this.db.prepare(
        `INSERT INTO snippets (
          id, title, description, source_url, html, css, javascript, category, favorite, archived, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          source_url = excluded.source_url,
          html = excluded.html,
          css = excluded.css,
          javascript = excluded.javascript,
          category = excluded.category,
          favorite = excluded.favorite,
          archived = excluded.archived,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at`
      ).run(
        entity.id,
        entity.title,
        entity.description,
        entity.sourceUrl.trim(),
        entity.html,
        entity.css,
        entity.javascript,
        entity.category,
        entity.favorite ? 1 : 0,
        entity.archived ? 1 : 0,
        entity.createdAt.toISOString(),
        entity.updatedAt.toISOString(),
      );

      this.syncTags(entity.id, entity.tags);
      this.cleanupOrphanTags();
    });

    saveSnippet(snippet);
  }

  async update(id: SnippetId, command: UpdateSnippetCommand): Promise<Snippet | null> {
    const existing = await this.findById(id);

    if (!existing) {
      return null;
    }

    const updated = applySnippetUpdate(existing, command);
    await this.save(updated);
    return updated;
  }

  async delete(id: SnippetId): Promise<boolean> {
    const deleted = this.db.transaction((snippetId: SnippetId) => {
      const result = this.db.prepare('DELETE FROM snippets WHERE id = ?').run(snippetId);
      this.cleanupOrphanTags();
      return result.changes > 0;
    });

    return deleted(id);
  }

  async listCategories(): Promise<Array<{ id: string; name: string }>> {
    const rows = this.db
      .prepare(`SELECT DISTINCT category AS name FROM snippets WHERE TRIM(category) <> '' ORDER BY category ASC`)
      .all() as Array<{ name: string }>;

    return rows.map((row) => ({ id: row.name, name: row.name }));
  }

  private querySnippets(query: SnippetSearchQuery): Snippet[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (query.archived !== undefined) {
      conditions.push('s.archived = ?');
      params.push(query.archived ? 1 : 0);
    }

    if (query.favorite !== undefined) {
      conditions.push('s.favorite = ?');
      params.push(query.favorite ? 1 : 0);
    }

    if (query.category?.trim()) {
      conditions.push('s.category = ?');
      params.push(query.category.trim());
    }

    if (query.text?.trim()) {
      const text = `%${query.text.trim()}%`;
      conditions.push('(s.title LIKE ? OR s.description LIKE ? OR s.source_url LIKE ? OR s.html LIKE ? OR s.css LIKE ? OR s.javascript LIKE ?)');
      params.push(text, text, text, text, text, text);
    }

    if (query.tags?.length) {
      const tags = normalizeSnippetTags(query.tags);
      const placeholders = tags.map(() => '?').join(', ');
      conditions.push(`EXISTS (
        SELECT 1 FROM snippet_tags st
        INNER JOIN tags t ON t.id = st.tag_id
        WHERE st.snippet_id = s.id AND t.name IN (${placeholders})
      )`);
      params.push(...tags);
    }

    const sortColumn = {
      updatedAt: 's.updated_at',
      createdAt: 's.created_at',
      title: 's.title',
    }[query.sort ?? 'updatedAt'];

    const direction = query.direction === 'asc' ? 'ASC' : 'DESC';
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = this.db
      .prepare(`SELECT DISTINCT s.* FROM snippets s ${whereClause} ORDER BY ${sortColumn} ${direction}`)
      .all(...params) as SnippetRow[];

    return rows.map((row) => this.mapRowToSnippet(row));
  }

  private mapRowToSnippet(row: SnippetRow): Snippet {
    const tagRows = this.db
      .prepare(
        `SELECT t.name FROM tags t
         INNER JOIN snippet_tags st ON st.tag_id = t.id
         WHERE st.snippet_id = ?
         ORDER BY t.name ASC`,
      )
      .all(row.id) as Array<{ name: string }>;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      sourceUrl: row.source_url,
      html: row.html,
      css: row.css,
      javascript: row.javascript,
      tags: tagRows.map((tag) => tag.name),
      category: row.category,
      favorite: Boolean(row.favorite),
      archived: Boolean(row.archived),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private syncTags(snippetId: SnippetId, tags: string[]): void {
    const normalizedTags = normalizeSnippetTags(tags);
    this.db.prepare('DELETE FROM snippet_tags WHERE snippet_id = ?').run(snippetId);

    for (const name of normalizedTags) {
      this.db.prepare('INSERT INTO tags (id, name) VALUES (?, ?) ON CONFLICT(name) DO NOTHING').run(randomUUID(), name);
      this.db.prepare(
        `INSERT INTO snippet_tags (snippet_id, tag_id)
         SELECT ?, id FROM tags WHERE name = ?
         ON CONFLICT(snippet_id, tag_id) DO NOTHING`,
      ).run(snippetId, name);
    }
  }

  private cleanupOrphanTags(): void {
    this.db.prepare('DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM snippet_tags)').run();
  }
}
