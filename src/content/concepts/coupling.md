---
title: >-
  Coupling
summary: >-
  The degree to which two pieces must change, run, or be understood together.
status: seed
tags:
  - "architecture"
  - "change-radius"
  - "review"
relatedPatterns:
  - "name-coupling"
  - "cap-change-radius"
  - "name-cross-layer-contracts"
---

## Mental model

Coupling
is
a
relationship,
not
an
insult.
The
review
question
is
whether
that
relationship
helps
the
code
express
the
domain
or
accidentally
makes
unrelated
changes
move
together.

Visible
beneficial
coupling
is
often
better
than
hidden
accidental
coupling.
A
direct
dependency
can
be
easier
to
understand
than
a
vague
abstraction
that
still
requires
coordinated
change.

## Review heuristic

Ask
what
would
have
to
change
if
one
side
changed.
If
the
answer
is
a
surprising
set
of
files,
protocols,
tests,
or
timing
assumptions,
the
coupling
needs
a
name
or
a
boundary.
