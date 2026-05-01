---
title: >-
  Guess-Driven Debugging
status: seed
category: testing
topics:
  - "debugging"
  - "evidence"
  - "verification"
summary: >-
  Fixes are applied from plausible guesses instead of evidence about the failing path.
relatedPatterns:
  - "debug-from-evidence"
  - "smallest-trustworthy-verification"
  - "characterize-before-changing"
relatedConcepts:
  - "observable-behavior"
  - "cognitive-burden"
---

## Description

A guess may make one symptom disappear while leaving the real fault in place. The final diff lacks a
clear reason, which makes future failures harder to diagnose.

Guess-driven debugging starts from a plausible edit instead of a falsifiable explanation. The
developer changes code before proving that the failing path reaches that code or that the changed
condition is the one that matters.

## Why It Matters

Debugging without evidence turns the codebase into the experiment log. Reviewers cannot tell which
line fixed the bug, and future maintainers inherit defensive code whose original failure is no
longer visible.

## Code Impact

The patch tends to add broad conditionals, vague error handling, and noisy logging. Tests may be
updated to match the new behavior without showing the observation that justified the change.

## Signals

- The patch changes code before reproducing the failure.
- Assertions are updated without explaining the old expectation.
- Temporary logs turn into permanent noise.

## Diagnostic Questions

- What hypothesis does this edit test?
- What observation would disprove it?
- Is the failing path actually reaching this code?

## Approach

- Reproduce or characterize the failure.
- Name one hypothesis at a time.
- Use the smallest check that can disprove it before changing more code.

## Examples

### Problem: fix lands before the failing case is isolated

The code adds a fallback because it sounds related to the failure, but the patch does not prove that
empty input is the failing path.

```typescript title="src/search/query.ts"
export function normalizeQuery(input: string | undefined): string {
  if (!input) {
    return "*";
  }

  return input.trim().toLowerCase();
}
```

### Better: evidence names the failed path

The test captures the observed failure before the behavior changes.

```typescript title="src/search/query.test.ts"
it("rejects missing query text", () => {
  expect(() => normalizeQuery(undefined)).toThrow("query is required");
});
```
