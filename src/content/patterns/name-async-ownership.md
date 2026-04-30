---
title: >-
  Name Async Ownership
summary: >-
  Make it clear who owns background work, cancellation, and error observation.
status: seed
tags:
  - "async"
  - "side-effects"
  - "correctness"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A task, callback, or worker outlives the caller without a named owner."
concepts:
  - "temporal-coupling"
  - "side-effect-visibility"
related:
  - "keep-async-boundaries-explicit"
  - "make-failures-observable"
---

## Core Idea

Async
ownership
answers
who
is
responsible
for
completion,
cancellation,
and
failure.
Without
that
owner,
work
can
outlive
requests,
lose
errors,
or
mutate
state
after
readers
think
the
flow
is
done.

Name
ownership
at
the
boundary
where
work
is
spawned,
queued,
subscribed,
or
detached.
Return
a
handle
when
the
caller
owns
observation.

The
tradeoff
is
ceremony.
Some
framework-managed
work
has
an
implicit
owner,
but
that
owner
should
still
be
visible
in
the
surrounding
code.

## Use When

- A promise, task, goroutine, or callback is started and not awaited.
- Cancellation is possible but not connected to the owner.
- Failure can happen after the caller returns.

## Guidance

- Return a handle or result when the caller owns completion.
- Pass cancellation through the lifecycle owner.
- Use names like enqueue, spawn, subscribe, and detach honestly.

## Tradeoffs

- Frameworks may own task lifecycle.
- Best-effort background work still needs failure policy.
- Too much wrapping can hide the async boundary again.

## Agent Instruction

When starting async work, name who owns cancellation and failure observation. Do not detach work
silently.

## Examples

### Return the scheduled task

The caller can decide whether to await, cancel, or observe failure.

```ts title="src/example.ts"
export function scheduleReindex(patternId: PatternId) {
  return reindexQueue.enqueue({ patternId });
}
```

## References

- Tidy First? chapter themes: use as inspiration, not a direct content source.
