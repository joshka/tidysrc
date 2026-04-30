---
title: >-
  Observability noise
status: draft
category: side-effects
topics:
  - logs
  - metrics
  - contracts
summary: >-
  Logs, metrics, and events are emitted without a stable contract for what changed or who should
  act.
relatedPatterns:
  - return-structured-errors
  - observable-behavior-tests
  - make-side-effects-visible
relatedConcepts:
  - observable-behavior
  - side-effect-visibility
---

## Impact

Noisy signals make real failures harder to find. They also become accidental behavior when
downstream dashboards, alerts, or support workflows depend on unstable names and fields.

## Signals

- Several code paths log similar failures with different field names.
- Metrics count implementation branches rather than user-visible outcomes.
- Events lack stable identifiers or failure context.
- Tests ignore diagnostics even though callers or operators depend on them.

## Diagnostic Questions

- Who consumes this signal?
- Is the signal part of observable behavior or only local debugging?
- Which fields are stable enough to rely on?
- Does this signal identify the outcome, the cause, or both?

## Approach

- Name diagnostic events around observable outcomes and stable context.
- Keep debug logs separate from signals that operators or callers depend on.
- Treat relied-on logs, metrics, and events as observable contracts in tests.
- Use structured errors and events instead of parsing message text downstream.
