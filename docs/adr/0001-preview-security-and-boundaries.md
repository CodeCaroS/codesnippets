# ADR 0001: Preview Security and Runtime Boundaries

## Status
Accepted

## Context

The workspace runs untrusted snippet code locally. The review surfaced three boundary risks:

- the server could be exposed beyond loopback if `HOST` was overridden,
- preview messages from the sandbox needed stronger origin and execution scoping,
- client API responses and imported backups were trusted too early.

The target app already has a local-only workflow, a sandboxed preview iframe, and separate client/server/shared packages. The goal is to keep those boundaries explicit instead of relying on TypeScript types alone.

## Decision

- The server must stay on loopback. `HOST` is accepted only for `127.0.0.1`, `localhost`, or `::1`.
- The preview iframe stays sandboxed with `allow-scripts` only, and parent/child messages are scoped by `executionId`, `event.source`, and a fixed message tag.
- Client API responses are validated at runtime before use.
- Import/export payloads are validated against the shared backup shape before the import mutation runs.

## Consequences

- The local app is safer to run by default, but external exposure now requires an explicit future decision instead of an accidental environment override.
- Preview execution is more robust against stale messages and cross-run leakage.
- API and backup parsing have a little more code, but the trust boundaries are now visible and testable.
- If the product later needs remote access, auth and rate limiting will be a separate design decision, not an implicit side effect.

## References

- [server/src/host-policy.ts](../../server/src/host-policy.ts)
- [client/src/modules/runner/ui/PreviewFrame.tsx](../../client/src/modules/runner/ui/PreviewFrame.tsx)
- [client/src/modules/snippets/api/snippets-api.ts](../../client/src/modules/snippets/api/snippets-api.ts)
- [shared/src/index.ts](../../shared/src/index.ts)
