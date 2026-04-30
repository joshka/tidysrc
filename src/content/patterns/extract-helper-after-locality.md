---
title: >-
  Extract Helper After Locality
summary: >-
  Extract a helper when the name removes burden, and keep it near the caller until it earns
  distance.
status: seed
tags:
  - "readability"
  - "organization"
  - "tidying"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A long function has a coherent subtask, but extraction may create a weak distant helper."
concepts:
  - "reader-locality"
  - "cognitive-burden"
related:
  - "reader-locality"
  - "explaining-variable"
  - "chunk-statements"
---

## Core Idea

Extracting
a
helper
is
useful
when
the
helper
name
lets
the
reader
skip
implementation
detail.
It
is
not
useful
when
it
only
moves
confusing
code
somewhere
else.

Start
with
locality.
If
the
helper
only
explains
one
caller,
keep
it
beside
that
caller.
Move
it
farther
away
only
when
the
concept
becomes
strong
enough
to
stand
alone.

The
tradeoff
is
fragmentation.
Too
many
tiny
helpers
can
turn
one
readable
flow
into
a
scavenger
hunt.

## Use When

- A local block has a name that makes later code easier to read.
- A helper would reduce the live facts in a larger workflow.
- The extracted concept has a clear input, output, and purpose.

## Guidance

- Name the helper for the domain step, not the mechanics.
- Keep weak helpers caller-local.
- Avoid extracting just to reduce line count.

## Tradeoffs

- Extraction can hide ordering and side effects.
- A local explaining variable may be enough.
- Shared helpers need stronger contracts than local helpers.

## Agent Instruction

Extract a helper only when its name reduces reader burden. Keep weak helpers near their caller.

## Examples

### Extract the named decision locally

The helper names the eligibility decision but stays close to the workflow that gives it meaning.

```ts title="src/example.ts"
function canPublish(pattern: Pattern) {
  return pattern.status === 'reviewed' && pattern.examples.length > 0;
}
```

## References

- Tidy First? chapter themes: use as inspiration, not a direct content source.
