---
title: >-
  Unclear async ownership
status: draft
category: async
topics:
  - lifecycle
  - cancellation
  - errors
summary: >-
  Async work starts without a clear owner for ordering, cancellation, errors, or lifetime.
relatedPatterns:
  - keep-async-boundaries-explicit
  - make-side-effects-visible
  - observable-behavior-tests
relatedConcepts:
  - temporal-coupling
  - side-effect-visibility
---

## Impact

Work can outlive the request, fail silently, race with subsequent reads, or leak resources.
Reviewers cannot tell whether returning from a function means the work finished or was only
scheduled.

## Signals

- Promises are created without awaits or returned handles.
- Goroutines, tasks, callbacks, or subscriptions have no cancellation path.
- Errors from background work are logged inconsistently or lost.
- A caller reads state immediately after scheduling work and assumes it is complete.

## Diagnostic Questions

- Who owns this async work after the current function returns?
- What happens if the caller is cancelled or times out?
- Where do errors go?
- Does the caller need completion, scheduling, or a handle?

## Approach

- Make awaits, spawns, callbacks, and queues visible at the boundary that owns ordering.
- Return a result, handle, or queued status when work continues after the current function.
- Pass cancellation or context through detached work.
- Test the observable ordering or cancellation behavior instead of only the happy path.

## Examples

### Problem: C# background work has no owner

Errors and cancellation are detached from the caller.

```csharp title="Reports/Publisher.cs"
public void PublishLater(Report report)
{
    _ = Task.Run(() => queue.Publish(report));
}
```

### Better: C# returns the queued work

The caller can decide whether to await or track it.

```csharp title="Reports/Publisher.cs"
public Task PublishLater(Report report, CancellationToken cancellation)
{
    return queue.Publish(report, cancellation);
}
```

### Problem: Java future is started and dropped

The caller cannot observe completion or failure.

```java title="src/main/java/example/Reports.java"
void publishLater(Report report) {
    executor.submit(() -> queue.publish(report));
}
```

### Better: Java returns ownership of the future

The caller receives a handle for ordering and errors.

```java title="src/main/java/example/Reports.java"
CompletableFuture<Void> publishLater(Report report) {
    return CompletableFuture.runAsync(() -> queue.publish(report), executor);
}
```

### Problem: Python task is created and forgotten

Cancellation and exceptions have no visible owner.

```python title="reports/publish.py"
def publish_later(report):
    asyncio.create_task(queue.publish(report))
```

### Better: Python returns the task handle

The caller owns whether to await, cancel, or track it.

```python title="reports/publish.py"
def publish_later(report):
    return asyncio.create_task(queue.publish(report))
```

### Problem: Rust task drops cancellation context

The spawned work can outlive the request silently.

```rust title="src/reports.rs"
pub fn publish_later(report: Report) {
    tokio::spawn(async move { queue::publish(report).await });
}
```

### Better: Rust returns the join handle

The boundary makes detached work explicit.

```rust title="src/reports.rs"
pub fn publish_later(report: Report) -> JoinHandle<Result<(), PublishError>> {
    tokio::spawn(async move { queue::publish(report).await })
}
```

### Problem: TypeScript promise is not awaited or returned

The caller assumes scheduling means completion.

```ts title="src/reports/publish.ts"
export function publishLater(report: Report) {
  queue.publish(report);
}
```

### Better: TypeScript returns ownership of the promise

The caller can await or handle failure.

```ts title="src/reports/publish.ts"
export function publishLater(report: Report) {
  return queue.publish(report);
}
```
