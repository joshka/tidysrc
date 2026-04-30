---
title: >-
  Context Hygiene
summary: >-
  Keeping task facts, tool state, and handoff notes current enough that work does not follow stale
  assumptions.
status: seed
tags:
  - "agent-guidance"
  - "workflow"
  - "review"
relatedPatterns:
  - "prepare-the-workspace"
  - "state-requirements-before-solutions"
  - "repo-local-instructions-win"
---

## Mental model

Context
is
part
of
the
working
system.
A
task
can
fail
because
the
code
is
wrong,
but
it
can
also
fail
because
the
human
or
agent
is
acting
on
stale
constraints,
stale
tool
output,
or
an
old
plan.

This
is
not
only
an
agent
concern.
Long
human
debugging
sessions
also
drift
when
evidence
accumulates
faster
than
the
notes,
tests,
and
plan
are
updated.

## Review heuristic

Ask
what
facts
the
next
worker
would
need
to
resume
safely.
If
the
answer
lives
only
in
chat
history,
terminal
scrollback,
or
memory,
capture
the
current
constraints
before
making
another
change.
