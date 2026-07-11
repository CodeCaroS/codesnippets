import { createApp } from './api/server.js';
import { resolveLoopbackHost } from './host-policy.js';

const port = Number(process.env.PORT ?? 3001);
const host = resolveLoopbackHost();
const app = createApp({
  databasePath: process.env.DATABASE_PATH,
  version: process.env.npm_package_version ?? '0.1.0',
});

app.listen(port, host, () => {
  console.log(`CodeSnippets server listening on http://${host}:${port}`);
});
