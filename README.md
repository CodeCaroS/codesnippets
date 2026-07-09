# CodeSnippets

An **offline-first code snippet playground** — like CodePen or JSFiddle, but built for local usage and API-first integration into a Personal AI OS.

## Features

- ✏️ **HTML / CSS / JavaScript editor** powered by CodeMirror 6
- 🖥️ **Sandboxed preview** — snippet code runs in an isolated iframe, never in the main window
- 📋 **Console capture** — `console.log`, `warn`, and `error` messages appear in the UI
- 📚 **Snippet library** — browse, search, filter, and organise all your snippets
- 🏷️ **Tags, categories, and favorites** — flexible organisation
- 🔍 **Full-text search** — find snippets by title, description, or tags via UI and API
- 📦 **Import / Export** — back up your library as JSON or restore it
- 🌐 **Local REST API** — manage snippets from any tool or AI agent
- 📄 **OpenAPI documentation** available at `GET /api/docs`
- 🔒 **Offline-first** — no internet required, everything stored in a local SQLite database
- 🤖 **AI-ready** — stable API designed for agent workflows

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite, TypeScript, CodeMirror 6, TanStack Query |
| Backend  | Node.js, Express, TypeScript, better-sqlite3 |
| Shared   | TypeScript types package                |
| Testing  | Vitest                                  |
| Database | SQLite (local file, WAL mode)           |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Development

Start the backend (port 3001) and frontend (port 5173) concurrently:

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Project Structure

```
codesnippets/
├── client/          # Vite + React frontend
│   └── src/
│       ├── app/             # Router and App shell
│       ├── modules/
│       │   ├── snippets/    # Editor page and API client
│       │   ├── runner/      # Preview iframe and console panel
│       │   ├── library/     # Explorer page and snippet list
│       │   ├── search/      # Search bar
│       │   ├── import-export/
│       │   └── settings/
│       └── shared/ui/       # Reusable UI components
├── server/          # Express + SQLite backend
│   └── src/
│       ├── domain/          # Snippet model, repository ports
│       ├── application/     # Use cases (CreateSnippet, SearchSnippets, …)
│       ├── infrastructure/  # SQLite repos, preview builder, migrations
│       └── api/             # Routes, middleware, OpenAPI spec
└── shared/          # Shared TypeScript types / DTOs
```

## API Overview

The server binds to `127.0.0.1:3001` (localhost only) by default.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server and database status |
| GET | `/api/snippets` | List snippets (supports `archived`, `favorite`, `category`, `tag` query params) |
| GET | `/api/snippets/:id` | Get a single snippet |
| POST | `/api/snippets` | Create a snippet |
| PATCH | `/api/snippets/:id` | Update a snippet |
| DELETE | `/api/snippets/:id` | Delete a snippet |
| POST | `/api/snippets/:id/duplicate` | Duplicate a snippet |
| POST | `/api/snippets/:id/archive` | Toggle archive flag |
| POST | `/api/snippets/:id/favorite` | Toggle favorite flag |
| GET | `/api/tags` | List all tags |
| GET | `/api/categories` | List all categories |
| POST | `/api/search` | Search snippets |
| GET | `/api/export` | Export all snippets as JSON |
| POST | `/api/import` | Import snippets from JSON |
| POST | `/api/run` | Build a sandboxed preview document |
| GET | `/api/docs` | OpenAPI specification |

Full request/response schemas are available at `GET /api/docs`.

## Architecture

The project follows **Hexagonal (Ports & Adapters) Architecture** with four layers:

- **Domain** — pure business types and interfaces, no framework dependencies
- **Application** — use cases that orchestrate domain logic via repository ports
- **Infrastructure** — SQLite repositories, preview builder, database migrations
- **API** — Express routes that validate input and delegate to use cases

## Security

- Snippet JavaScript runs **only inside a sandboxed iframe** (`sandbox="allow-scripts"`) — never in the main window
- The API server binds to `127.0.0.1` (localhost only)
- CORS is restricted to `localhost` origins
- All API inputs are validated with Zod
- HTTP security headers via Helmet

## License

MIT

