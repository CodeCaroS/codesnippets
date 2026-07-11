# Multi-Viewport Preview Plan

## Goal
Add a multi-viewport preview mode to the workspace so one snippet can be compared at a few fixed breakpoints without rebuilding the preview for each frame.

## Confirmed
- The preview is currently built once in `PreviewFrame` and rendered into one sandboxed iframe.
- `WorkspacePage` already owns the preview stack, console, and workspace-level settings.
- The initial product decision is fixed presets, not free-form viewport input.

## Decision
- Start with three presets: `Mobile`, `Tablet`, `Desktop`.
- Keep the first version local to the client UI.
- Reuse the existing preview build pipeline; do not add a second server-side rendering path.

## Assumptions
- The comparison use case is primarily visual, not interactive testing.
- The first version does not need synchronized scrolling across frames.
- Console events should remain understandable in a multi-frame layout.

## Risks
- Too many viewport options would make the UI noisy.
- Multiple frames can duplicate console output if event routing is not constrained.
- A grid that works on desktop may be cramped on smaller screens unless it collapses cleanly.

## Phases

### Phase 1 - Product decision
- Define the preset list and the interaction model.
- Completion: the viewport set and scope are explicit and approved.

### Phase 2 - Multi-frame preview rendering
- Update `PreviewFrame` to render the same built document into three viewport containers.
- Keep preview compilation single-shot per run.
- Completion: all presets show the same preview document. **Complete**

### Phase 3 - Active viewport behavior
- Decide how focus and console messages work across frames.
- Recommended default: one active viewport, console messages routed from the active frame only.
- Completion: interaction is predictable and logs stay readable. **Complete**

### Phase 4 - Workspace integration
- Surface the multi-viewport mode in `WorkspacePage`.
- Add a simple toggle or persistent preference only if the base layout feels too busy.
- Completion: the feature fits the existing workspace without extra friction. **Complete**

### Phase 5 - Verification
- Add tests for preview build count, rendered viewport count, and stale console filtering.
- Manually verify the layout on narrow and wide widths.
- Completion: the UI works across the three target breakpoints and tests cover the main behavior. **Complete**

## Definition of Done
- Three fixed presets are available.
- One preview build feeds all frames.
- The active viewport model is documented in the UI.
- Tests pass and no obvious responsive regressions remain.
