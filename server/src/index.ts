import { createApp } from './api/server.js';

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';
const app = createApp({
  databasePath: process.env.DATABASE_PATH,
  version: process.env.npm_package_version ?? '0.1.0',
});

app.listen(port, host, () => {
  console.log(`CodeSnippets server listening on http://${host}:${port}`);
});
