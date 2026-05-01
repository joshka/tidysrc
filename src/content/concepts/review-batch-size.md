---
title: >-
  Review Batch Size
summary: >-
  The amount of change a reviewer must understand as one unit.
status: seed
tags:
  - "workflow"
  - "review"
  - "change-radius"
relatedPatterns:
  - "choose-change-batch-size"
  - "separate-structure-from-behavior"
  - "smallest-trustworthy-verification"
---

## Why it matters

A review batch should be coherent enough to explain and small enough to verify. A batch that mixes
unrelated purposes creates review debt even if every line is correct.

Good batch size depends on risk. A mechanical rename can be broad and still reviewable. A behavior
change may need to be narrow because the failure mode is semantic.

## How to apply it

Ask whether the batch has one reason to exist and one credible verification story. If not, split it
or restate the change until the unit is clear.

## Examples

### Oversized batch: rename and behavior change share one diff

The reviewer has to inspect mechanical movement and semantic behavior at the same time.

```text title="review/summary.txt"
Rename report helpers, move export code, and hide draft reports from CSV output.
```

### Better: one review unit has one purpose

The behavior change can be reviewed against its own verification story.

```text title="review/summary.txt"
Hide draft reports from CSV output.
Verified with: pnpm test -- report-export
```
