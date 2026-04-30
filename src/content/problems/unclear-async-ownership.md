---
title: >-
  Unclear async ownership
status: draft
category: async
topics:
  - lifecycle
  - cancellation
  - errors
summary: >-
  Async work starts without a clear owner for ordering, cancellation, errors, or lifetime.
relatedPatterns:
  - keep-async-boundaries-explicit
  - make-side-effects-visible
  - observable-behavior-tests
relatedConcepts:
  - temporal-coupling
  - side-effect-visibility
---

## Impact

Work can outlive the request, fail silently, race with subsequent reads, or leak resources.
Reviewers cannot tell whether returning from a function means the work finished or was only
scheduled.

## Signals

- Promises are created without awaits or returned handles.
- Goroutines, tasks, callbacks, or subscriptions have no cancellation path.
- Errors from background work are logged inconsistently or lost.
- A caller reads state immediately after scheduling work and assumes it is complete.

## Diagnostic Questions

- Who owns this async work after the current function returns?
- What happens if the caller is cancelled or times out?
- Where do errors go?
- Does the caller need completion, scheduling, or a handle?

## Approach

- Make awaits, spawns, callbacks, and queues visible at the boundary that owns ordering.
- Return a result, handle, or queued status when work continues after the current function.
- Pass cancellation or context through detached work.
- Test the observable ordering or cancellation behavior instead of only the happy path.
