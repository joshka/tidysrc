---
title: >-
  Keep Async Boundaries Explicit
summary: >-
  Make awaits, tasks, callbacks, and cancellation points visible where ordering and ownership
  matter.
status: draft
tags:
  - "async"
  - "correctness"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "csharp"
  - "go"
  - "java"
  - "python"
  - "rust"
  - "ts"
problems:
  - "A function starts background work or crosses an async boundary without making ordering, cancellation, or ownership clear."
concepts:
  - "temporal-coupling"
  - "side-effect-visibility"
related:
  - "make-side-effects-visible"
  - "smallest-trustworthy-verification"
---

## Core Idea

Async code fails when a reader cannot tell what runs now, what runs later, and what can be
cancelled. A hidden task spawn or callback can detach ownership from the caller. Make the boundary
visible and name the ordering contract.

Reach for this pattern when a helper spawns background work, registers a callback, or starts a
goroutine/task that outlives the caller.

The main tradeoff is that framework handlers often impose async shape; keep the effect clear inside
the handler even when the framework owns scheduling.

## Use When

- A helper spawns background work, registers a callback, or starts a goroutine/task that outlives
  the caller.
- The caller needs to know whether work is complete before reading state or returning a response.
- Cancellation, timeout, or error propagation is part of the behavior being reviewed.

## Guidance

- Keep awaits and spawns visible at the call site that owns ordering.
- Return handles, results, or cancellation paths when work outlives the current function.
- Use names that reveal detached work, such as start, spawn, enqueue, subscribe, or schedule.

## Tradeoffs

- Framework handlers often impose async shape; keep the effect clear inside the handler even when
  the framework owns scheduling.
- Over-wrapping async calls can hide the same boundary under another name; expose the contract the
  caller needs.
- Rust forces more ownership choices at compile time, while JavaScript and Go need extra care around
  unawaited promises and goroutines.

## Agent Instruction

When adding async work, make the await, spawn, callback, cancellation, and error path visible. Do
not hide detached work in a helper that looks synchronous.

## Examples

### TypeScript names the detached work

The caller can see that indexing is scheduled, not completed, before the response returns.

```ts title="src/reindex.ts"
await repository.save(pattern);

await indexQueue.enqueueRebuild(pattern.id);

return { status: 'queued' };
```

### Go goroutine receives cancellation

The background worker is tied to context cancellation instead of leaking beyond the request
lifecycle.

```go title="worker.go"
go func() {
    if err := worker.Run(ctx, job); err != nil {
        logger.Error("worker failed", "err", err)
    }
}()
```

### Rust task returns a join handle

The caller receives a handle, making detached work and error handling visible instead of hiding the
spawn.

```rust title="src/indexer.rs"
pub fn spawn_reindex(job: ReindexJob) -> JoinHandle<Result<(), IndexError>> {
    tokio::spawn(async move {
        reindex(job).await
    })
}
```

### C# returns the task to the caller

The caller can await the work and observe failure.

```csharp title="Indexer.cs"
public Task ReindexAsync(Pattern pattern, CancellationToken cancellationToken)
{
    return indexer.RebuildAsync(pattern.Id, cancellationToken);
}
```

### Java names queued work

The method name makes it clear that indexing is scheduled, not complete.

```java title="IndexQueue.java"
CompletionStage<Void> enqueueReindex(PatternId id) {
    return queue.publish(new ReindexRequested(id));
}
```

### Python keeps task ownership visible

The caller receives the task instead of a helper silently detaching it.

```python title="indexer.py"
def schedule_reindex(pattern_id):
    return asyncio.create_task(reindex(pattern_id))
```

## References

- None yet.
