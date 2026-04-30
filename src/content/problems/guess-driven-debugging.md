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

## Impact

A guess may make one symptom disappear while leaving the real fault in place. The final diff lacks a
clear reason, which makes future failures harder to diagnose.

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
