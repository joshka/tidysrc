---
title: >-
  Make Failures Observable
summary: >-
  Return, record, or publish failure state where callers can see it instead of logging and
  continuing as if work succeeded.
status: seed
tags:
  - "errors"
  - "side-effects"
  - "observability"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A failed write, publish, or external call produces the same caller-visible result as success."
concepts:
  - "observable-behavior"
  - "side-effect-visibility"
related:
  - "return-structured-errors"
  - "make-side-effects-visible"
  - "test-observable-behavior"
---

## Core Idea

A failure path should be visible at the boundary that depends on the work. Logging is useful, but a
log line is not a substitute for a return value, state transition, retry request, or event that
callers can observe.

Use this pattern when code swallows an error and returns a success-shaped value. The reader should
be able to tell what work failed and how the caller will react.

The tradeoff is that not every best-effort side effect deserves to fail the user request. When a
failure is intentionally non-blocking, make that policy explicit.

## Use When

- A catch block logs and continues even though callers need to know work failed.
- A failed side effect returns the same value as success.
- Tests cannot assert the failure path without reading logs.

## Guidance

- Return a result, status, or structured error when the caller owns recovery.
- Record durable failed state when retry or reconciliation owns recovery.
- Name best-effort behavior explicitly when failure should not block the main path.

## Tradeoffs

- Some telemetry failures should not break user behavior.
- Making every warning fatal can reduce resilience.
- Durable failure state adds cleanup and retry responsibilities.

## Agent Instruction

Do not hide failed side effects behind success-shaped returns. Make the failure observable through a
result, state transition, event, or explicit best-effort policy.

## Examples

### TypeScript returns publish failure

The caller can branch on the failed publish instead of relying on logs.

```ts title="src/publish.ts"
const result = await publisher.publish(pattern);
if (!result.ok) {
  return { status: 'publish-failed', reason: result.error.kind };
}
```

## References

- None yet.
