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

## Mental model

A
review
batch
should
be
coherent
enough
to
explain
and
small
enough
to
verify.
A
batch
that
mixes
unrelated
purposes
creates
review
debt
even
if
every
line
is
correct.

Good
batch
size
depends
on
risk.
A
mechanical
rename
can
be
broad
and
still
reviewable.
A
behavior
change
may
need
to
be
narrow
because
the
failure
mode
is
semantic.

## Review heuristic

Ask
whether
the
batch
has
one
reason
to
exist
and
one
credible
verification
story.
If
not,
split
it
or
restate
the
change
until
the
unit
is
clear.
