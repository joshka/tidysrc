---
title: >-
  Measure Before Optimizing
summary: >-
  Tie performance complexity to a benchmark, profile, trace, or production signal before changing
  the code shape.
status: seed
tags:
  - "performance"
  - "measurement"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A change adds caching, concurrency, or allocation tricks without proving the bottleneck."
concepts:
  - "observable-behavior"
  - "cognitive-burden"
related:
  - "smallest-trustworthy-verification"
  - "make-side-effects-visible"
  - "cap-change-radius"
---

## Core Idea

Performance work should start with evidence. A benchmark, profile, trace, or production signal tells
reviewers which path is slow and gives them a way to check whether added complexity paid for itself.

Use this pattern before adding caches, concurrency, pooling, batching, allocation tricks, or broad
rewrites. The measurement does not have to be elaborate, but it should be capable of failing the
performance claim.

The tradeoff is that very small local improvements can be obvious enough to skip formal measurement.
The more state or complexity the change adds, the stronger the evidence should be.

## Use When

- The proposed fix adds cache state, concurrency, pooling, or broad rewrites.
- The bottleneck is guessed from code shape rather than measured behavior.
- Reviewers cannot tell whether the new complexity improved the user-visible path.

## Guidance

- State the measurement that motivated the change.
- Keep the performance check close enough to the changed path to catch regressions.
- Prefer simple evidence before broad rewrites.

## Tradeoffs

- Measurement can be noisy; record enough context to interpret it.
- Some correctness fixes also improve performance, but should still be reviewed as correctness
  changes.
- Microbenchmarks can mislead when the production bottleneck is elsewhere.

## Agent Instruction

Before adding performance complexity, identify the bottleneck and the check that could prove the
change helped. Do not add caching or concurrency from a guess alone.

## Examples

### TypeScript records the measured boundary

The performance claim has a route-level timing check before cache state is added.

```ts title="src/catalog.measure.ts"
const start = performance.now();
await renderCatalogPage(catalog);
console.log('catalog render ms', performance.now() - start);
```

## References

- None yet.
