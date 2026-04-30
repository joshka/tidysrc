---
title: >-
  Digging Past Evidence
status: seed
category: change-risk
topics:
  - "debugging"
  - "review"
  - "agent-workflow"
summary: >-
  More patches are added after the evidence already shows the current explanation is wrong.
relatedPatterns:
  - "stop-and-reframe"
  - "debug-from-evidence"
  - "smallest-trustworthy-verification"
relatedConcepts:
  - "cognitive-burden"
  - "review-batch-size"
---

## Impact

The diff grows into a pile of guesses. Even if it eventually passes, reviewers cannot tell which
change mattered or whether the underlying model is now correct.

## Signals

- Each fix produces a different failure.
- The patch changes areas not proven to affect the failure.
- The original requirement disappears behind cleanup and workaround code.

## Diagnostic Questions

- What evidence contradicts the current approach?
- What is the smallest check that separates the competing explanations?
- Should this stop for a new plan or maintainer input?

## Approach

- Stop after repeated contradictory failures.
- Summarize evidence and current assumptions.
- Reframe the plan before editing another area.
