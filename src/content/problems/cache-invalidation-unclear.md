---
title: >-
  Cache invalidation unclear
status: draft
category: state
topics:
  - caching
  - temporal-coupling
  - correctness
summary: >-
  The code updates cached data without naming freshness rules, invalidation triggers, or stale-read
  behavior.
relatedPatterns:
  - make-state-transitions-explicit
  - parse-dont-validate
  - keep-async-boundaries-explicit
relatedConcepts:
  - temporal-coupling
  - state-space
  - observable-behavior
---

## Impact

Readers cannot tell whether stale data is acceptable, whether writes update the cache, or which path
owns invalidation. Bugs often appear as rare ordering problems rather than obvious logic errors.

## Signals

- A write path updates storage but not the cache, with no stated freshness contract.
- Several callers clear the same cache for different reasons.
- Tests assert current values without covering stale-read policy.
- A cache key is built from loose strings or partial request data.

## Diagnostic Questions

- What freshness guarantee does this caller need?
- Which operation owns invalidation?
- Can the cache key be represented as a parsed value?
- Is stale data a valid state or a failure?

## Approach

- Name the freshness policy and keep invalidation beside the write or transition that requires it.
- Represent cache keys as precise values when loose strings cause drift.
- Test the observable stale-read behavior at the boundary callers use.
- Keep background refreshes and async invalidation explicit.
