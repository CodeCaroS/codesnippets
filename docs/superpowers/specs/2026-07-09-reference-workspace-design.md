# Reference Workspace Design

## Context

The target app is `Z:\Programming Projects\codesnippet`, a workspace-based TypeScript project with separate `client`, `server`, and `shared` packages. The client already uses React Router, TanStack Query, CodeMirror, and feature-oriented module folders. The server follows a ports-and-adapters shape with domain models, application use cases, infrastructure repositories, and Express routes.

The visual and UX reference is `C:\Users\carol\Downloads\local-code-snippet-playground`. That app uses a single integrated playground workspace with a left icon rail, library sidebar, compact editor tabs, preview, console, settings, backup tooling, and an agent integration guide. Its implementation centralizes much of the state in `App.tsx`, which should not be copied into the target app.

The approved direction is Approach A: adopt the reference layout and theme as the main product experience, while preserving the target app architecture.

## Goals

- Make the target app feel and behave like the reference app in layout, theme, and day-to-day workflow.
- Use the reference charcoal/gold theme, square-edged dense panels, narrow icon rail, library sidebar, compact editor header, preview frame, and console treatment.
- Keep existing architecture boundaries: client modules remain feature-scoped, server behavior remains use-case driven, shared DTOs stay in `shared`.
- Keep TanStack Query as the server-state mechanism and `client/src/modules/snippets/api/snippets-api.ts` as the API boundary.
- Keep CodeMirror as the editor engine instead of replacing it with the reference textareas.
- Add missing reference features where they are absent or only partially exposed.

## Non-Goals

- Do not collapse the app into one large `App.tsx` state container.
- Do not replace the server architecture with the reference app's direct local JSON database router.
- Do not add Gemini or Google AI dependencies from the reference package.
- Do not introduce Tailwind solely to copy class names from the reference. The target app should implement the theme through its existing CSS approach unless a later implementation step proves a local pattern already supports Tailwind.
- Do not remove existing API endpoints that are already documented in the README.

## Architecture

### Client Shell

`client/src/shared/ui/Layout.tsx` becomes the application shell for the reference-style product frame:

- A 64px left icon rail with brand mark, workspace, agent guide, settings, and import/export navigation.
- Main content fills the viewport and uses dark charcoal surfaces, fine borders, and gold accent states from the reference.
- Top navbar navigation is removed from the primary experience in favor of the icon rail.

The shell stays presentational. Route-specific behavior remains inside module pages.

### Routing

The root route becomes the integrated workspace experience:

- `/` renders a new `WorkspacePage`.
- `/snippets/new` and `/snippets/:snippetId` may remain as direct deep links, but they should use the same editor module behavior and visual language.
- `/settings` renders the enhanced settings/tools view.
- `/import-export` can either remain available or be visually folded into the settings/tools experience, but the route should continue working.
- `/agent-guide` is added for the reference-style AI OS integration guide.

### Workspace Page

Add `client/src/modules/workspace/ui/WorkspacePage.tsx`.

Responsibilities:

- Compose the library sidebar, editor surface, preview frame, and console into one viewport.
- Own only UI orchestration state: selected snippet id, active pane/view, draft state, dirty state, run version, console messages, and local settings loaded from local storage.
- Use React Query for snippet list/detail reads and mutations for create, update, favorite, archive, duplicate, delete.
- Use existing API functions from `snippets-api.ts`; add missing exported functions if the route already exists.

It should not know server internals and should not bypass the API module.

## Feature Requirements

### Library Sidebar

The library sidebar should match the reference layout and theme:

- Fixed-width sidebar next to the icon rail.
- Header with "Library Explorer" treatment and a compact "New Snippet" button.
- Search input inside a black bordered field.
- Quick filters for `All`, `Starred`, and `Archived`.
- Category chips generated from current category data.
- Tag chips generated from current snippets or tag endpoint data.
- Snippet count and total item count.
- Snippet rows/cards with title, description, category, tags, updated time, favorite/archive indicators.
- Inline actions for favorite, duplicate, archive/unarchive, and delete.
- Create modal with title, category, description, and tags, using the reference default starter snippet.

The sidebar should call existing mutations and invalidate relevant React Query keys.

### Editor Surface

The editor keeps CodeMirror but adopts the reference UX:

- Tabs named `index.html`, `styles.css`, `script.js`, and `metadata.json`.
- Compact dark tab bar with gold active underline.
- Dirty state indicator in the header.
- Save button with `Ctrl+S` / `Cmd+S` support.
- Metadata tab for title, category, tags, description, and favorite.
- Editor font size controlled by settings.
- Optional word wrap if the existing setting remains.

The editor should expose controlled props so `WorkspacePage` can manage draft state without duplicating editor internals across routes.

### Preview

The preview should adopt the reference visual treatment:

- Header labeled as sandboxed viewport.
- Run and reset controls.
- Full-height black preview container.
- Clear loading/error/ready states.
- Sandboxed iframe remains the execution boundary.

The current server-side preview builder can continue to generate the document. If Tailwind-in-preview is needed to match the reference defaults, add it in the preview builder or iframe document generation in a small, explicit change.

### Console

The console should match the reference behavior:

- Collapsible panel.
- Message count.
- Filter buttons for all/log/warn/error.
- Clear action.
- Timestamped entries.
- Distinct styles for info, warnings, and errors.
- Auto-scroll to the newest entry.

The existing console capture remains message-based from the iframe to the parent window.

### Settings And Tools

Settings should be expanded to cover the reference feature set:

- Theme option, initially dark as the fully supported mode.
- Editor font size.
- Autorun toggle.
- Autosave interval, including manual-only mode.
- Word wrap if still supported.
- Backend health status.
- Local database status summary using available health/category/tag/snippet data.
- Import/export controls with JSON payload area and clear status/error messages.

If the backend does not expose exact file size/path, the UI should display available verified data and avoid fake values.

### Agent Guide

Add a module for an API-first agent integration guide:

- Route: `/agent-guide`.
- Visual style follows the reference AgentGuide.
- Endpoint list should reflect the target app API, including `/api/health`, `/api/snippets`, `/api/search`, `/api/run`, `/api/export`, `/api/import`, and `/api/docs`.
- Include copy buttons for a system prompt and a sample curl request.
- Do not claim unauthenticated external access or CORS behavior that is not true in the target backend.

## Data Flow

- Snippet list: `getSnippets(filters)` via TanStack Query.
- Snippet detail: `getSnippet(id)` via TanStack Query.
- Create/update/favorite/archive/duplicate/delete: mutations in `snippets-api.ts`.
- Categories/tags: existing endpoints where available; fallback derived tags from loaded snippets only when needed.
- Settings: local UI settings remain local storage unless persisted server settings are added deliberately.
- Preview: `buildPreview(html, css, javascript)` remains the preview document builder.
- Console: iframe `postMessage` events update workspace-local console entries.

## Error Handling

- API errors surface near the area that caused them.
- Mutating actions disable only the relevant control while pending.
- Delete actions require confirmation or an equivalent guarded UI state.
- Import validates JSON before mutation and displays parse errors.
- Preview generation errors render inside the preview pane without breaking the workspace shell.
- Empty library and no-selection states remain usable and provide a create action.

## Testing

Implementation should follow test-first changes where behavior changes:

- Component tests for workspace shell rendering, library filtering controls, and editor dirty/save behavior.
- Mutation-facing tests for action buttons calling the intended API functions or invalidating query keys.
- Tests for console filtering/collapse behavior.
- Existing server tests should remain green.
- Build verification must include root `npm run build` and targeted client tests.

Manual verification should include:

- Desktop workspace layout resembles the reference: icon rail, library sidebar, editor, preview, console.
- Mobile/narrow viewport stacks without overlapping controls.
- Creating, selecting, editing, saving, duplicating, archiving, deleting, importing, exporting, running, resetting preview, and reading console output.

## Self-Review

- No placeholder requirements remain.
- The design explicitly preserves the target architecture and rejects copying the reference state structure.
- The requested reference layout and theme are first-class goals, not incidental styling.
- Missing feature coverage is concrete: workspace shell, library actions, editor UX, preview controls, console filtering, settings/tools, and agent guide.
- Backend changes are intentionally limited to small DTO/use-case/API additions if verified data is not currently available.
