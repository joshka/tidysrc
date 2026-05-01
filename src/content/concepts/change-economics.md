---
title: >-
  Change Economics
summary: >-
  The tradeoff between paying structure cost now and preserving options for later changes.
status: seed
tags:
  - "workflow"
  - "design"
  - "review"
relatedPatterns:
  - "keep-structure-reversible"
  - "choose-change-batch-size"
  - "separate-structure-from-behavior"
---

## Mental model

Every structure change spends attention now for possible benefit later. The question is not whether
tidying is good, but whether this tidy improves the next decision enough to justify its cost.

Small reversible structure changes preserve options. Large irreversible structure changes need
stronger evidence because they can create compatibility or migration cost.

## Review heuristic

Ask what option this change creates or removes. If the code becomes easier to change without
committing to a broad design, the economics are usually favorable.
