---
title: >-
  Risky legacy change
status: draft
category: change-risk
topics:
  - legacy-code
  - characterization
  - verification
summary: >-
  The existing behavior is unclear, under-tested, or coupled to callers that a small edit can break.
relatedPatterns:
  - characterize-before-changing
  - separate-structure-from-behavior
  - observable-behavior-tests
  - smallest-trustworthy-verification
relatedConcepts:
  - observable-behavior
  - structure-vs-behavior
---

## Impact

The danger comes from uncertainty about intentional behavior. Without characterization, a tidy can
silently become a product change.

## Signals

- The code has few tests or tests that only cover internal helpers.
- A small edit changes parsing, error handling, ordering, or public output at the same time.
- Callers rely on behavior that is not written down anywhere.
- The reviewer needs to ask “what changed?” and the diff does not make that question answerable.

## Diagnostic Questions

- What observable behavior would prove the current system still works?
- Which outputs, errors, logs, side effects, or calls are part of the public contract?
- Can the structure be improved without changing behavior first?
- What is the smallest verification that would catch the likely regression?

## Approach

- Characterize the current behavior before changing it, especially around edge cases and public
  boundaries.
- Separate structural cleanup from behavior changes so review can answer one question at a time.
- Protect observable behavior instead of private implementation shape.
- Use the smallest trustworthy verification loop before broadening tests or refactoring further.
