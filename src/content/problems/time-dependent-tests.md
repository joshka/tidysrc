---
title: >-
  Time-dependent tests
status: draft
category: testing
topics:
  - time
  - flakiness
  - side-effects
summary: >-
  Tests sleep, wait, or depend on the wall clock because time is hidden inside the code under test.
relatedPatterns:
  - inject-time-and-randomness
  - make-side-effects-visible
  - smallest-trustworthy-verification
relatedConcepts:
  - temporal-coupling
  - side-effect-visibility
---

## Impact

The suite becomes slow and flaky, and failures are hard to diagnose. The test is checking scheduler
luck instead of the behavior that should change when time advances.

## Signals

- Tests call sleep or use wide timing tolerances.
- Business logic reads Date.now, Instant.now, time.Now, or random identifiers directly.
- Expiration, retry, or ordering behavior cannot be tested without waiting.
- A failure disappears when the timeout is increased.

## Diagnostic Questions

- What time value or random source is part of the behavior?
- Which boundary owns the policy that reads time?
- Can the test pass a fixed clock or generated id?
- Would a deterministic test catch the same regression without sleeping?

## Approach

- Pass time and randomness through the boundary that owns the policy.
- Use fixed clocks, deterministic id generators, or explicit instants in tests.
- Keep direct wall-clock access at edges that truly own scheduling.
- Avoid sleeps as verification unless the behavior being tested is the scheduler itself.
