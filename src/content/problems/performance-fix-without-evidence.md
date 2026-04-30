---
title: >-
  Performance fix without evidence
status: draft
category: change-risk
topics:
  - performance
  - measurement
  - complexity
summary: >-
  A change adds caching, concurrency, allocation tricks, or broad rewrites without a measured
  bottleneck.
relatedPatterns:
  - smallest-trustworthy-verification
  - make-side-effects-visible
  - cap-change-radius
relatedConcepts:
  - side-effect-visibility
  - change-radius
  - cognitive-burden
---

## Impact

Performance work can add state, invalidation, timing, and concurrency risks. Without evidence, the
code may get harder to change while the real bottleneck remains elsewhere.

## Signals

- A patch adds caching or parallelism without a benchmark, profile, or production signal.
- The optimization changes data shape or ownership before proving a bottleneck.
- A micro-optimization obscures the main path.
- Tests prove correctness but not the performance claim that justified the complexity.

## Diagnostic Questions

- What measurement shows this path is the bottleneck?
- What behavior or contract could the optimization change?
- Can the performance-sensitive boundary be isolated?
- What verification proves both correctness and the intended performance property?

## Approach

- Measure before adding complexity, and keep the measurement close to the claim.
- Prefer local improvements that preserve reader locality before adding cache or concurrency state.
- Treat cache, async, and allocation changes as behavior-risking when they alter ordering or
  ownership.
- Keep the fallback or original behavior easy to compare during review.
