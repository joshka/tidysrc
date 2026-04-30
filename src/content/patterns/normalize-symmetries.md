---
title: >-
  Normalize Symmetries
summary: >-
  Make similar code look similar so meaningful differences stand out during review.
status: seed
tags:
  - "readability"
  - "review"
  - "tidying"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "Two similar paths look different for accidental reasons."
concepts:
  - "cognitive-burden"
  - "reader-locality"
related:
  - "chunk-statements"
  - "separate-structure-from-behavior"
---

## Core Idea

Symmetry
lets
a
reader
compare
code
by
intent
instead
of
formatting,
naming,
or
ordering
accidents.
Similar
concepts
should
use
similar
names,
statement
order,
and
shape.

Use
this
before
changing
one
member
of
a
family.
Once
the
family
is
normalized,
the
behavior
change
becomes
easier
to
see.

The
risk
is
false
symmetry.
Do
not
force
code
to
match
when
the
differences
express
real
domain
distinctions.

## Use When

- Several handlers, tests, branches, or constructors perform parallel work.
- A planned behavior change touches one item in a family.
- Accidental naming or ordering makes comparison noisy.

## Guidance

- Align names and statement order before changing behavior.
- Keep the normalization behavior-preserving.
- Leave real differences visible and named.

## Tradeoffs

- False symmetry can hide important differences.
- Large normalization passes need careful review boundaries.
- Framework conventions can impose intentional asymmetry.

## Agent Instruction

Before changing one item in a similar group, normalize accidental differences so the real behavior
change stands out.

## Examples

### Align similar handlers before changing one

The two handlers now use the same order, so a later policy difference is visible.

```ts title="src/example.ts"
function renderPattern(pattern: Pattern) {
  const title = formatTitle(pattern.title);
  const summary = formatSummary(pattern.summary);
  return card(title, summary);
}

function renderProblem(problem: Problem) {
  const title = formatTitle(problem.title);
  const summary = formatSummary(problem.summary);
  return card(title, summary);
}
```

## References

- Tidy First? chapter themes: use as inspiration, not a direct content source.
