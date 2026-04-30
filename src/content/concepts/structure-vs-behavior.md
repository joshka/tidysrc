---
title: >-
  Structure Versus Behavior
summary: >-
  Structure changes alter code shape; behavior changes alter what callers can observe.
status: draft
tags:
  - "workflow"
  - "review"
relatedPatterns:
  - "separate-structure-from-behavior"
  - "smallest-trustworthy-verification"
---
## Why it matters

A tidy can make behavior work easier to review, but mixing both in one diff hides the risk. Separate
them when review, rollback, or verification would be clearer.

Structure changes include renames, moves, extraction, formatting, and local simplification that
should preserve behavior.

## How to verify

After a structure-only change, run a check that would catch accidental behavior movement. After the
behavior change, run the check that targets the new rule.
