# Findings

## Repo context
- `PreviewFrame.tsx` already isolates preview compilation and message handling, which makes multi-viewport rendering a client-side change.
- `WorkspacePage.tsx` already owns the preview stack, so it is the right place to coordinate viewport selection and layout.
- `build-preview-document.ts` is a thin use case wrapper, so the server preview pipeline does not need to change for the first pass.

## Product decision
- The viewport feature should start with three fixed presets: `Mobile`, `Tablet`, and `Desktop`.
- Free-form viewport input is deferred.
