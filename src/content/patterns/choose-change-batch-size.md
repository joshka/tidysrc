---
title: >-
  Choose Change Batch Size
summary: >-
  Group changes into review units that are small enough to understand and large enough to be
  coherent.
status: seed
tags:
  - "workflow"
  - "review"
  - "change-risk"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A review is either too large to reason about or too small to prove useful behavior."
concepts:
  - "change-radius"
  - "structure-vs-behavior"
related:
  - "separate-structure-from-behavior"
  - "smallest-trustworthy-verification"
---

## Core Idea

Batch
size
is
a
review
design
choice.
A
good
batch
has
one
reason
to
exist,
one
verification
story,
and
enough
context
to
understand
the
result.

Split
batches
when
structure
and
behavior
blur
together,
when
verification
differs,
or
when
rollback
should
be
independent.
Combine
tiny
edits
when
separating
them
would
hide
the
actual
move.

The
tradeoff
is
coordination.
Too
many
tiny
changes
create
process
noise;
one
broad
change
hides
risk.

## Use When

- A change mixes several purposes.
- The review cannot be verified with one clear check.
- Rollback should be possible for one part without losing another.

## Guidance

- Give each batch one purpose.
- Align each batch with its verification.
- Keep dependent batches ordered and described.

## Tradeoffs

- Tiny batches can obscure context.
- Large batches can hide accidental behavior changes.
- Some migrations need staged compatibility batches.

## Agent Instruction

Choose a batch size that gives reviewers one coherent purpose and one credible verification story.

## Examples

### Split rename from behavior

The rename and rule change deserve different batches because they fail differently.

```ts title="src/example.ts"
// Batch 1: rename activePatterns to visiblePatterns.
// Batch 2: change visiblePatterns to include reviewed patterns only.
```

## References

- Tidy First? chapter themes: use as inspiration, not a direct content source.
