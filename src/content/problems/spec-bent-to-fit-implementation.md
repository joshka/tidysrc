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
  - "test-observable-behavior"
  - "characterize-before-changing"
relatedConcepts:
  - "observable-behavior"
  - "boundary-trust"
---

## Description

The code may pass checks while breaking the thing the checks were supposed to protect. Reviewers
lose the ability to tell whether the behavior change was intentional.

Spec bent to fit implementation happens when the easiest way to make the patch pass is to weaken
the contract. The test, docs, or public shape moves toward the new code instead of forcing the new
code to satisfy the existing behavior.

## Why It Matters

The changed spec may look like routine test maintenance, but it can erase the only visible record
of a user-facing promise. Reviewers need to see when the contract changes and why.

## Code Impact

Tests become less specific, public fields change names incidentally, and expected output starts
matching implementation details. The codebase loses executable evidence for the behavior that used
to matter.

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

## Examples

### Problem: test expectation follows the new implementation

The expected API shape changes because the implementation now emits a different field name.

```typescript title="src/api/user.test.ts"
expect(renderUser(user)).toEqual({
  displayName: "Ada Lovelace",
});
```

### Better: existing contract stays explicit

The test keeps the public field stable unless the review is intentionally changing the API.

```typescript title="src/api/user.test.ts"
expect(renderUser(user)).toEqual({
  name: "Ada Lovelace",
});
```
