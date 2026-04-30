---
title: >-
  Cohesion
summary: >-
  How strongly the parts of a module, type, or function belong to one concept.
status: seed
tags:
  - "architecture"
  - "readability"
  - "organization"
relatedPatterns:
  - "strengthen-cohesion"
  - "reader-locality"
  - "move-domain-rules-inward"
---

## Mental model

Cohesion
is
the
positive
side
of
locality.
Related
facts
and
behavior
should
live
together
when
that
lets
a
reader
understand
one
concept
without
assembling
it
from
fragments.

Low
cohesion
shows
up
as
modules
grouped
by
technical
category
rather
than
by
the
thing
that
changes
together.
High
cohesion
can
still
need
internal
structure,
but
the
outer
concept
is
clear.

## Review heuristic

Ask
whether
the
pieces
in
a
module
change
for
the
same
reason.
If
they
do,
strengthen
the
concept.
If
they
do
not,
split
the
responsibilities
before
the
file
becomes
a
bucket.
