---
title: >-
  Keep Structure Reversible
summary: >-
  Prefer tidying moves that can be undone cheaply while the design is still being discovered.
status: seed
tags:
  - "workflow"
  - "design"
  - "change-risk"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A tidy makes future direction harder to change before the design is proven."
concepts:
  - "reversibility"
  - "change-economics"
related:
  - "separate-structure-from-behavior"
  - "choose-change-batch-size"
---

## Core Idea

A reversible structure change preserves options. It makes the next change easier without committing
the codebase to a broad architecture too early.

Use reversible moves while evidence is still forming: rename, move, group, split, and clarify before
introducing hard compatibility boundaries.

The tradeoff is that public APIs and data migrations are often less reversible; those need stronger
evidence and review.

## Use When

- The design direction is still uncertain.
- A tidy helps the next change but should not create compatibility cost.
- Rollback should remain easy if the next change reveals a better shape.

## Guidance

- Prefer local movement before public API changes.
- Keep behavior-preserving changes small.
- Avoid premature compatibility promises.

## Tradeoffs

- Some decisions must become durable before release.
- Reversibility can conflict with stable APIs.
- Too much deferral can leave real design debt.

## Agent Instruction

When tidying toward an uncertain design, prefer reversible structure moves and avoid creating
durable contracts too early.

## Examples

### Prefer a local helper before a public API

The helper can move later without creating a public compatibility promise.

```ts title="src/example.ts"
function patternSearchText(pattern: Pattern) {
  return [pattern.title, pattern.summary, ...pattern.tags].join(' ');
}
```

## References

- [Tidy First?: Reversible Structure Changes](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch28.html)
