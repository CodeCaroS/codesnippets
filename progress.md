# Progress

## 2026-07-10
- Restored repository context for the multi-viewport preview idea.
- Confirmed the current preview flow is single-build, single-iframe.
- Logged the initial plan and locked the first product decision to three fixed presets.
## Phase 2: Multi-Viewport Preview

- Implemented fixed `Mobile` (390px), `Tablet` (768px), and `Desktop` (1440px) viewport cards in `PreviewFrame`.
- One `buildPreview` response now feeds all three iframe `srcDoc` values.
- Added active viewport selection and console routing to the selected iframe.
- Added regression coverage for shared build output and stale execution filtering.
- Verified with the focused client test and client production build.
