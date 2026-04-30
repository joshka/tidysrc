---
title: >-
  Mixed diff risk
status: draft
category: change-risk
topics:
  - review
  - structure-vs-behavior
  - verification
summary: >-
  A single change mixes formatting, movement, renaming, behavior, tests, and cleanup until review
  cannot isolate the risk.
relatedPatterns:
  - separate-structure-from-behavior
  - smallest-trustworthy-verification
  - characterize-before-changing
relatedConcepts:
  - structure-vs-behavior
  - observable-behavior
---

## Impact

Mixed diffs make reviewers compare too many possible causes at once. Even when the final code is
better, the diff hides behavioral changes and makes regressions harder to blame.

## Signals

- A diff contains both pure movement and changed conditionals.
- Formatting churn surrounds a small behavior change.
- Test updates, renames, and production behavior changes are all needed to understand one patch.
- Reviewers cannot tell whether a failure came from cleanup or the intended behavior change.

## Diagnostic Questions

- Can the structural change be reviewed as behavior-preserving first?
- Which lines are supposed to alter observable behavior?
- Would a smaller verification pass prove the cleanup stayed neutral?
- Is this change easier to review as two stacked changes?

## Approach

- Make behavior-preserving structure changes separately from behavior changes.
- Keep renames, movement, and formatting narrow enough that review can recognize them as neutral.
- Run focused verification after the structural step before changing behavior.
- Use source control to keep the stack honest instead of asking a reviewer to mentally split the
  diff.
