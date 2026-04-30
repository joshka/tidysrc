---
title: >-
  Concurrency assumptions hidden
status: draft
category: async
topics:
  - concurrency
  - ownership
  - correctness
summary: >-
  Shared state, ordering, locks, or idempotency assumptions are implicit in code that may run
  concurrently.
relatedPatterns:
  - make-side-effects-visible
  - keep-async-boundaries-explicit
  - make-state-transitions-explicit
relatedConcepts:
  - temporal-coupling
  - side-effect-visibility
  - state-space
---

## Impact

The code can pass local tests while failing under real scheduling. Reviewers cannot tell which data
is protected, which operations can repeat, or which order must be preserved.

## Signals

- Shared mutable state is updated without an obvious lock or ownership boundary.
- Retry code is added without making the operation idempotent.
- A background task reads data that another path mutates.
- Tests rely on a single-threaded execution order that production does not guarantee.

## Diagnostic Questions

- What owns this shared state?
- Can this operation run twice or out of order?
- Where is cancellation or retry handled?
- What test or review evidence would catch the likely race?

## Approach

- Make ownership, locking, and async boundaries visible.
- Name idempotency and transition rules where retries happen.
- Keep mutation in one place when possible, and expose the effect in the return value or state
  transition.
- Use focused tests for ordering-sensitive behavior, but do not pretend they prove all scheduler
  interleavings.
