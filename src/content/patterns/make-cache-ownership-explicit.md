---
title: >-
  Make Cache Ownership Explicit
summary: >-
  Name the code path that owns freshness, invalidation, and stale-read behavior for cached data.
status: seed
tags:
  - "caching"
  - "state"
  - "correctness"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "Readers cannot tell which write path invalidates cached data or whether stale reads are allowed."
concepts:
  - "state-space"
  - "temporal-coupling"
related:
  - "make-state-transitions-explicit"
  - "centralize-configuration-policy"
  - "test-observable-behavior"
---

## Core Idea

A cache is shared state with a freshness policy. The code should make clear who owns invalidation,
which writes affect the cache, and what stale-read behavior is acceptable.

Use this pattern when cache updates are scattered, best-effort, or implied by naming. The reader
should not have to inspect every caller to learn whether a write path refreshes, clears, or
tolerates stale data.

The tradeoff is that some caches are intentionally approximate. That is fine when the stale-read
policy is named and tested where callers depend on it.

## Use When

- Multiple paths clear or refresh the same cache.
- A write path changes storage but does not state the cache effect.
- Tests cover fresh reads but not stale-read policy.

## Guidance

- Put invalidation behind the boundary that owns the cached data.
- Name stale-read policy when it is acceptable.
- Test the write path and the read-after-write behavior together.

## Tradeoffs

- Centralized invalidation can become a bottleneck if every caller must know too much.
- Some caches should be rebuilt asynchronously; make queued freshness visible.
- A cache key parser may be needed before ownership can be trusted.

## Agent Instruction

When changing cached data, identify the owner of freshness and invalidation. Do not scatter cache
clears or leave stale-read behavior implicit.

## Examples

### TypeScript routes writes through the cache owner

The write path updates storage and invalidates through one boundary.

```ts title="src/patternStore.ts"
export async function savePattern(pattern: Pattern) {
  await repository.save(pattern);
  patternCache.invalidate(pattern.slug);
}
```

## References

- None yet.
