# CodeSnippets

Offline-first playground for HTML, CSS, and JavaScript snippets. CodeSnippets combines a local editor, a sandboxed preview, a searchable SQLite library, and a localhost REST API for scripts and Personal AI OS agents.

## Features

- CodeMirror editor for HTML, CSS, and JavaScript
- Sandboxed iframe preview with captured `console.log`, `console.warn`, and `console.error`
- Local snippet library with search, filters, tags, categories, favorites, archive, and duplicate actions
- JSON import/export for backups and portability
- Local REST API with input validation and OpenAPI endpoint
- Agent integration guide with ready-to-copy prompt and cURL example
- No cloud service or internet connection required at runtime

## Stack

- Frontend: React 18, Vite, TypeScript, CodeMirror 6, TanStack Query
- Backend: Node.js, Express, TypeScript, better-sqlite3
- Database: local SQLite file with WAL mode
- Shared contracts: TypeScript DTOs in `shared`
- Tests: Vitest, Testing Library, Supertest

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend talks to the backend at `http://127.0.0.1:3001`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend and backend together |
| `npm run build` | Build shared package, server, and client |
| `npm test` | Run server and client tests |
| `npm run check` | Run lint, all tests, and production build |

The backend also supports `npm run dev --workspace=server`, `npm run test --workspace=server`, and `npm run build --workspace=server`. The client provides the equivalent workspace commands.

## Configuration

The server binds to loopback by default and accepts these environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Backend HTTP port |
| `DATABASE_PATH` | application default | SQLite database path |
| `VITE_API_PORT` | `3001` | Backend port used by the Vite development proxy |

Example:

```bash
DATABASE_PATH=./data/codesnippets.sqlite PORT=3001 npm run dev --workspace=server
```

## API

The API is local-only by default: `http://127.0.0.1:3001/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check server and database status |
| `GET` | `/snippets` | List snippets with filters and sorting |
| `GET` | `/snippets/:id` | Read one snippet |
| `POST` | `/snippets` | Create a snippet |
| `PATCH` | `/snippets/:id` | Update code or metadata |
| `DELETE` | `/snippets/:id` | Delete a snippet |
| `POST` | `/snippets/:id/duplicate` | Duplicate a snippet |
| `POST` | `/snippets/:id/archive` | Toggle archive state |
| `POST` | `/snippets/:id/favorite` | Toggle favorite state |
| `GET` | `/tags` | List tags |
| `GET` | `/categories` | List categories |
| `POST` | `/search` | Run structured snippet search |
| `GET` | `/export` | Export snippet library as JSON |
| `POST` | `/import` | Import snippet library JSON |
| `POST` | `/run` | Build sandboxed preview document |
| `GET` | `/docs` | Return the OpenAPI specification |

All paths above are relative to `/api`, so the health endpoint is `/api/health`. The in-app **AI OS Integration Docs** page contains an agent prompt and cURL example.

Example request:

```bash
curl -X POST http://127.0.0.1:3001/api/snippets \
  -H "Content-Type: application/json" \
  -d '{"title":"Local Ping","category":"Tools","tags":["demo"],"html":"<main>Ping</main>","css":"main{color:teal}","javascript":"console.log(\"ready\")"}'
```

## Architecture

The backend uses ports-and-adapters boundaries:

```text
client  ->  REST API  ->  application use cases  ->  domain ports  ->  SQLite adapters
                         |
                         +-> sandbox preview builder
```

```text
client/
  src/app/                 Router and application shell
  src/modules/workspace/  Main editor, library, templates, and state hooks
  src/modules/runner/     Preview iframe and console panel
  src/modules/snippets/   API client and snippet editor flows
  src/modules/settings/   Preferences and import/export UI
  src/shared/             Reusable UI and browser infrastructure

server/
  src/domain/             Snippet model and repository ports
  src/application/        Use cases and application errors
  src/infrastructure/     SQLite, migrations, repositories, preview builder
  src/api/                 Routes, validation, serializers, middleware, OpenAPI

shared/
  src/index.ts             Shared DTOs, request types, and runtime validators
```

## Security boundaries

- User JavaScript executes only in a sandboxed iframe with `allow-scripts`.
- The server is restricted to loopback by default.
- CORS allows local development origins only.
- API input is validated with Zod at the HTTP boundary.
- Helmet adds HTTP security headers.
- Preview documents use a dedicated builder instead of executing code in the main application window.

## Development quality gate

Before handing off changes, run:

```bash
npm run check
```

This runs TypeScript/lint checks, all server and client tests, and the production build.

## License

MIT
