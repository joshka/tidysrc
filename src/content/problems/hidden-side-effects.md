---
title: >-
  Hidden side effects
status: draft
category: side-effects
topics:
  - mutation
  - io
  - review
summary: >-
  A call reads like a calculation but mutates state, performs I/O, reads time, or starts external
  work.
relatedPatterns:
  - make-side-effects-visible
  - inject-time-and-randomness
  - keep-async-boundaries-explicit
relatedConcepts:
  - side-effect-visibility
  - temporal-coupling
  - observable-behavior
---

## Impact

Hidden effects make review depend on implementation inspection. A maintainer cannot judge ordering,
retries, or failure behavior from the call site, and tests often become broad because the real input
or output is invisible.

## Signals

- A helper named like a formatter, mapper, or calculator writes to storage or mutates its arguments.
- A code path reads the clock, random source, process environment, or global state from inside
  business logic.
- A review comment asks whether a call is safe to move, repeat, or skip.
- Tests need extensive setup because a pure-looking function depends on process state.

## Diagnostic Questions

- What does this call change outside its return value?
- Can the effect be seen from the function name, receiver, return type, or statement shape?
- Should the effect be passed in as a dependency or moved to a boundary?
- What verification would catch the effect happening at the wrong time?

## Approach

- Separate calculation from mutation or I/O when the ordering matters.
- Rename or reshape effectful boundaries so the side effect is visible at the call site.
- Pass time, randomness, clients, stores, or publishers explicitly when ambient access hides
  behavior.
- Test the observable effect at the smallest boundary that can catch ordering or failure
  regressions.
