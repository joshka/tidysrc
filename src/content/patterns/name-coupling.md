---
title: >-
  Name Coupling
summary: >-
  Make the dependency between two pieces explicit before deciding whether to keep or reduce it.
status: seed
tags:
  - "architecture"
  - "coupling"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "Two parts change together, but the reason is implicit."
concepts:
  - "coupling"
  - "change-radius"
related:
  - "name-cross-layer-contracts"
  - "cap-change-radius"
---

## Core Idea

Coupling
is
not
automatically
bad.
It
is
a
relationship.
The
review
question
is
whether
the
relationship
is
beneficial,
accidental,
or
hidden.

Name
the
coupling
before
decoupling
it.
Sometimes
the
right
move
is
to
make
the
relationship
more
direct;
sometimes
it
is
to
introduce
a
boundary.

The
tradeoff
is
abstraction
cost.
Decoupling
too
early
can
replace
a
clear
dependency
with
an
unclear
protocol.

## Use When

- Two modules must change together.
- A boundary hides a real ordering or data dependency.
- Reviewers debate decoupling without naming the relationship.

## Guidance

- Describe why the pieces change together.
- Keep beneficial coupling direct and visible.
- Decouple accidental coupling at a boundary that owns the contract.

## Tradeoffs

- Some coupling is the domain model.
- Decoupling adds protocols and names.
- Hidden coupling is worse than visible coupling.

## Agent Instruction

Before adding or removing abstraction, name the coupling and decide whether it is beneficial or
accidental.

## Examples

### Name the shared contract

The dependency is explicit: cards depend on the catalog view contract, not the database row.

```ts title="src/example.ts"
type PatternCard = {
  title: string;
  summary: string;
  href: string;
};
```

## References

- Tidy First? chapter themes: use as inspiration, not a direct content source.
