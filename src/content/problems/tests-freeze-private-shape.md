---
title: >-
  Tests freeze private shape
status: draft
category: testing
topics:
  - observable-behavior
  - refactoring
  - test-design
summary: >-
  A test fails when internals move even though the user-visible behavior has not changed.
relatedPatterns:
  - observable-behavior-tests
  - smallest-trustworthy-verification
relatedConcepts:
  - observable-behavior
---

## Impact

These tests make code harder to improve. They turn harmless refactors into test rewrites, train
developers to avoid cleanup, and give agents false confidence because the suite is sensitive to the
wrong thing.

## Signals

- Tests assert private helper calls, exact internal ordering, or intermediate data that users never
  observe.
- A pure extraction or rename requires widespread test changes.
- Mocks encode implementation details instead of collaborator behavior.
- The test suite is noisy during structural changes but misses real output regressions.

## Diagnostic Questions

- What behavior would a user, caller, or downstream system actually observe?
- Could the same behavior be produced by a different internal shape?
- Is the mock verifying a contract or only the current implementation path?
- Would this assertion survive a legitimate refactor?

## Approach

- Move assertions toward outputs, errors, side effects, persisted state, or collaborator contracts.
- Keep private-shape assertions only when the shape itself is the contract, such as ordering
  guarantees or performance-sensitive calls.
- When replacing brittle tests, keep enough coverage to protect the behavior before deleting the old
  assertions.
- For agents, make the verification target explicit so they do not satisfy the suite by preserving
  accidental internals.
