---
title: >-
  Wide change radius
status: draft
category: change-risk
topics:
  - change-radius
  - review
  - ownership
summary: >-
  A small rule change spreads across files, tests, and callers that do not own the rule.
relatedPatterns:
  - cap-change-radius
  - separate-structure-from-behavior
  - smallest-trustworthy-verification
relatedConcepts:
  - change-radius
  - structure-vs-behavior
---

## Impact

The review becomes larger than the behavior. More files mean more merge risk, more verification
burden, and more chances for an agent to modify unrelated code.

## Signals

- One condition is copied across views, handlers, tests, and helpers.
- A small wording or policy change touches many unrelated files.
- Reviewers cannot find the one file that owns the behavior.
- A type or config change creates mechanical edits mixed with behavior edits.

## Diagnostic Questions

- Which boundary should own this rule?
- Which touched files are mechanical fallout?
- Can structural changes be stacked before the behavior change?
- Would a precise type or policy object reduce future edit sites?

## Approach

- Move the rule to the boundary that owns it before updating every caller.
- Separate mechanical radius from behavior radius when both are needed.
- Use targeted verification after each unit of the change.
- Avoid centralizing unrelated rules only to reduce file count.
