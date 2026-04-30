---
title: >-
  Spec Bent to Fit Implementation
status: seed
category: testing
topics:
  - "contracts"
  - "tests"
  - "review"
summary: >-
  The contract changes because the implementation was easier to make pass than the original
  requirement.
relatedPatterns:
  - "preserve-the-spec"
  - "observable-behavior-tests"
  - "characterize-before-changing"
relatedConcepts:
  - "observable-behavior"
  - "boundary-trust"
---

## Impact

The code may pass checks while breaking the thing the checks were supposed to protect. Reviewers
lose the ability to tell whether the behavior change was intentional.

## Signals

- Tests are deleted or weakened without naming a behavior change.
- Expected output changes to match a new implementation detail.
- A public field, route, CLI output, or error shape changes incidentally.

## Diagnostic Questions

- What contract did the original test or docs protect?
- Is the contract wrong, or is the implementation incomplete?
- Who observes this shape outside the changed code?

## Approach

- Preserve the existing contract until the review explicitly changes it.
- If the spec is wrong, make the spec change a named behavior change.
- Add an observable behavior test for the intended contract.
