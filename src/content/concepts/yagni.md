---
title: >-
  YAGNI
summary: >-
  "You aren't gonna need it": avoid adding structure for futures that are not yet real enough to
  justify the cost.
status: seed
tags:
  - "architecture"
  - "change-economics"
  - "review"
relatedPatterns:
  - "keep-structure-reversible"
  - "preparatory-refactor"
  - "choose-change-batch-size"
---

## Mental model

YAGNI asks whether a structure change is paying for a future that the code has not actually shown.
In source-change review, this often means questioning a provider, registry, strategy, interface, or
configuration layer that exists because it might help later.

The rule is not "never abstract." It is "wait until the repeated pressure is real enough to name."
When the future change becomes concrete, the abstraction can be reviewed against evidence instead of
anxiety.

## Review heuristic

Ask what current change this structure makes simpler. If the answer is mostly hypothetical, keep the
local code direct and make the next extraction cheaper with reversible structure.
