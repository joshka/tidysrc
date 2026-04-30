---
title: >-
  Silent failure paths
status: draft
category: side-effects
topics:
  - errors
  - failure-modes
  - observability
summary: >-
  The code swallows errors, returns empty results, or logs and continues when callers need to know
  work failed.
relatedPatterns:
  - return-structured-errors
  - observable-behavior-tests
  - make-state-transitions-explicit
relatedConcepts:
  - observable-behavior
  - boundary-trust
---

## Impact

Failures become harder to diagnose and can corrupt downstream assumptions. The system appears to
succeed while skipping behavior that callers or users depend on.

## Signals

- Catch blocks log errors and return defaults without telling the caller.
- A failed write or publish produces the same return shape as success.
- Tests only cover the happy path and one generic failure.
- Operational logs show errors that user-visible state never reports.

## Diagnostic Questions

- Who needs to know that this work failed?
- Is an empty result a valid domain outcome or a hidden error?
- What context would help recovery or reporting?
- Should the failure be represented as a structured error, event, or state transition?

## Approach

- Return structured failures when callers can recover or report them.
- Use domain-specific empty states only when absence is valid behavior.
- Test failure behavior at the boundary where callers observe it.
- Keep logging as diagnostics, not as the only behavior signal.
