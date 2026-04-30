---
title: >-
  Cognitive Burden
summary: >-
  Parameters, fields, jumps, concepts, and hidden side effects all add to what the reader must
  hold at once.
status: draft
tags:
  - "readability"
  - "review"
relatedPatterns:
  - "explaining-variable"
  - "chunk-statements"
  - "reader-locality"
---
## Review heuristic

Ask whether the change reduces the number of live facts the next maintainer must remember. Line
count matters less than the shape of that mental stack.

An abstraction should remove facts from the reader’s head. If it adds a concept without removing
burden, it does not pay rent.

## How to apply it

Prefer changes that reduce jumps, hidden state, generic names, and mixed responsibilities. A smaller
diff is not automatically easier to understand if it forces the reader to remember more live facts.

When reviewing a proposed abstraction, ask what facts the abstraction lets the next reader forget.
If the answer is unclear, the abstraction probably needs a better name, a smaller scope, or more
time to prove itself through repeated pressure.
