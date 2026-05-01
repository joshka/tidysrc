---
title: >-
  Strengthen Cohesion
summary: >-
  Move related data and behavior together when that makes one concept easier to understand
  locally.
status: seed
tags:
  - "architecture"
  - "cohesion"
  - "readability"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A concept is split across files or types that do not make sense independently."
concepts:
  - "cohesion"
  - "reader-locality"
related:
  - "reader-locality"
  - "move-domain-rules-inward"
---

## Core Idea

Cohesion is about what belongs together. A cohesive unit lets the reader understand one concept
without collecting fragments from unrelated places.

Use this when data, validation, state transitions, and behavior are repeatedly edited together.
Bring the concept together or give the boundary a better name.

The tradeoff is size. A cohesive module can become too large if it starts collecting unrelated
responsibilities.

## Use When

- Fields and functions change together.
- A rule is split between presentation, persistence, and domain code.
- A reader must open many files to understand one concept.

## Guidance

- Move behavior beside the data or state it depends on.
- Split responsibilities that do not change together.
- Name the cohesive concept directly.

## Tradeoffs

- Large cohesive modules can still need internal structure.
- Framework layout may separate files by type.
- Moving code can expand change radius temporarily.

## Agent Instruction

When related facts and behavior always change together, move them toward one named concept instead
of scattering them by technical category.

## Examples

### Put the transition beside the state

Publish behavior belongs with the state it changes.

```ts title="src/example.ts"
function publish(pattern: DraftPattern): PublishedPattern {
  return { ...pattern, status: 'published', publishedAt: new Date() };
}
```

## References

- [Tidy First?: Cohesion](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch32.html)
