---
title: >-
  Ambiguous state transitions
status: draft
category: state
topics:
  - lifecycle
  - invariants
  - correctness
summary: >-
  Lifecycle state changes happen through direct field writes, loose status strings, or scattered
  flag updates.
relatedPatterns:
  - make-state-transitions-explicit
  - make-invalid-states-hard-to-express
  - characterize-before-changing
relatedConcepts:
  - state-space
  - temporal-coupling
  - observable-behavior
---

## Impact

No single place owns the invariants of the transition. Callers can skip timestamps, events,
validation, or cleanup because changing state looks like ordinary assignment.

## Signals

- Several modules assign status fields directly.
- A state change should emit an event or timestamp, but that side effect is optional at call sites.
- Tests build impossible state combinations to reach common behavior.
- The code has multiple booleans that describe one lifecycle.

## Diagnostic Questions

- What states can this value occupy?
- Which transitions are legal, and which should be rejected?
- What side effects must happen with the transition?
- Can the type system or a named transition function reject invalid movement?

## Approach

- Name lifecycle transitions and put invariant checks inside them.
- Use enums, sealed variants, or typed constants for mutually exclusive states.
- Keep transition side effects, timestamps, and events beside the state change.
- Characterize current transition behavior before changing legacy lifecycles.
