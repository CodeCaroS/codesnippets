import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './server.js';

describe('API server', () => {
  it('creates, lists, updates, and previews snippets', async () => {
    const app = createApp({ databasePath: ':memory:' });

    const createResponse = await request(app)
      .post('/api/snippets')
      .send({
        title: 'Counter',
        html: '<button id="count">0</button>',
        javascript: 'console.log("ready")',
        tags: ['demo'],
        category: 'examples',
        sourceUrl: 'https://example.com/source',
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.title).toBe('Counter');
    expect(createResponse.body.data.sourceUrl).toBe('https://example.com/source');

    const snippetId = createResponse.body.data.id as string;

    const listResponse = await request(app).get('/api/snippets');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.total).toBe(1);
    expect(listResponse.body.data[0].sourceUrl).toBe('https://example.com/source');

    const favoriteResponse = await request(app).post(`/api/snippets/${snippetId}/favorite`);
    expect(favoriteResponse.status).toBe(200);
    expect(favoriteResponse.body.data.favorite).toBe(true);

    const runResponse = await request(app).post('/api/run').send({
      executionId: '6dce4941-5a76-45a8-a05d-0a0c7c9459c7',
      html: '<div>Hello</div>',
      css: 'body { color: red; }',
      javascript: 'console.log("hi")',
    });
    expect(runResponse.status).toBe(200);
    expect(runResponse.body.document).toContain('codesnippets-preview');
    expect(runResponse.body.document).toContain('executionId: "6dce4941-5a76-45a8-a05d-0a0c7c9459c7"');

    const exportResponse = await request(app).get('/api/export');
    expect(exportResponse.status).toBe(200);
    expect(exportResponse.body.snippets).toHaveLength(1);
    expect(exportResponse.body.snippets[0].sourceUrl).toBe('https://example.com/source');
  });

  it('returns not found errors in the expected format', async () => {
    const app = createApp({ databasePath: ':memory:' });

    const response = await request(app).get('/api/snippets/missing');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.message).toBe('Snippet not found');
  });
});
