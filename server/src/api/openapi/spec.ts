export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CodeSnippets API',
    version: '0.1.0',
    description: 'Offline-first code snippet playground API.',
  },
  paths: {
    '/api/health': { get: { summary: 'Get API health status' } },
    '/api/snippets': {
      get: { summary: 'List snippets' },
      post: { summary: 'Create a snippet' },
    },
    '/api/snippets/{id}': {
      get: { summary: 'Get a snippet by id' },
      patch: { summary: 'Update a snippet' },
      delete: { summary: 'Delete a snippet' },
    },
    '/api/snippets/{id}/duplicate': { post: { summary: 'Duplicate a snippet' } },
    '/api/snippets/{id}/archive': { post: { summary: 'Toggle snippet archive state' } },
    '/api/snippets/{id}/favorite': { post: { summary: 'Toggle snippet favorite state' } },
    '/api/search': { post: { summary: 'Search snippets' } },
    '/api/tags': { get: { summary: 'List tags' } },
    '/api/categories': { get: { summary: 'List categories' } },
    '/api/import': { post: { summary: 'Import snippets JSON payload' } },
    '/api/export': { get: { summary: 'Export snippets JSON payload' } },
    '/api/run': { post: { summary: 'Build sandbox preview document' } },
    '/api/docs': { get: { summary: 'Serve OpenAPI spec' } },
  },
};
