---
title: >-
  Unclear Async Ownership
status: reviewed
category: async
topics:
  - lifecycle
  - cancellation
  - errors
summary: >-
  Async work starts without a clear owner for ordering, cancellation, errors, or lifetime.
relatedPatterns:
  - name-async-ownership
  - keep-async-boundaries-explicit
  - make-side-effects-visible
  - test-observable-behavior
relatedConcepts:
  - temporal-coupling
  - side-effect-visibility
---

## Description

Async work starts without a clear owner for ordering, cancellation, errors, or lifetime.

The code starts a task, goroutine, promise, callback, queue job, or subscription, but the caller
cannot tell who owns completion. It is unclear whether the work must finish before the next read,
who can cancel it, and where errors are observed.

Detached work can be valid. Framework handlers, queues, telemetry, and best-effort notifications
often have their own lifecycle. The problem is detaching work without naming that lifecycle or the
failure policy.

## Why It Matters

Work can outlive the request, fail silently, race with subsequent reads, or leak resources.

Reviewers need to know whether scheduling is enough or completion matters. If the ownership is not
visible, a caller may read stale state, return before required work finishes, drop errors, or keep
work running after cancellation.

## Code Impact

Unclear async ownership hides ordering and lifetime in control flow. A helper that looks like a
normal call may start background work, mutate state later, or log a failure the caller needed to
handle.

The code becomes hard to test because the observable behavior is not at the call boundary. Tests
either wait and hope, ignore the background path, or assert implementation details instead of
completion, cancellation, or failure behavior.

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

- [Name async ownership](/patterns/name-async-ownership/) at the boundary that starts background
  work.
- [Keep async boundaries explicit](/patterns/keep-async-boundaries-explicit/) where ordering,
  cancellation, and failure can change behavior.
- Return a result, handle, or queued status when work continues after the current function.
- Pass cancellation or context through detached work.
- [Make side effects visible](/patterns/make-side-effects-visible/) when async work mutates state or
  touches external systems later.
- [Test observable behavior](/patterns/test-observable-behavior/) for ordering, cancellation, or
  failure behavior instead of only the happy path.

## Examples

### Problem: background work has no owner

Errors and cancellation are detached from the caller.

```csharp title="Reports/Publisher.cs"
public void PublishLater(Report report)
{
    _ = Task.Run(() => queue.Publish(report));
}
```

### Better: returns the queued work

The caller can decide whether to await or track it. This applies
[Name Async Ownership](/patterns/name-async-ownership/).

```csharp title="Reports/Publisher.cs"
public Task PublishLater(Report report, CancellationToken cancellation)
{
    return queue.Publish(report, cancellation);
}
```

### Problem: future is started and dropped

The caller cannot observe completion or failure.

```java title="src/main/java/example/Reports.java"
void publishLater(Report report) {
    executor.submit(() -> queue.publish(report));
}
```

### Better: returns ownership of the future

The caller receives a handle for ordering and errors. This applies
[Keep Async Boundaries Explicit](/patterns/keep-async-boundaries-explicit/).

```java title="src/main/java/example/Reports.java"
CompletableFuture<Void> publishLater(Report report) {
    return CompletableFuture.runAsync(() -> queue.publish(report), executor);
}
```

### Problem: task is created and forgotten

Cancellation and exceptions have no visible owner.

```python title="reports/publish.py"
def publish_later(report):
    asyncio.create_task(queue.publish(report))
```

### Better: returns the task handle

The caller owns whether to await, cancel, or track it. This applies
[Name Async Ownership](/patterns/name-async-ownership/).

```python title="reports/publish.py"
def publish_later(report):
    return asyncio.create_task(queue.publish(report))
```

### Problem: task drops cancellation context

The spawned work can outlive the request silently.

```rust title="src/reports.rs"
pub fn publish_later(report: Report) {
    tokio::spawn(async move { queue::publish(report).await });
}
```

### Better: returns the join handle

The boundary makes detached work explicit. This applies
[Keep Async Boundaries Explicit](/patterns/keep-async-boundaries-explicit/).

```rust title="src/reports.rs"
pub fn publish_later(report: Report) -> JoinHandle<Result<(), PublishError>> {
    tokio::spawn(async move { queue::publish(report).await })
}
```

### Problem: promise is not awaited or returned

The caller assumes scheduling means completion.

```ts title="src/reports/publish.ts"
export function publishLater(report: Report) {
  queue.publish(report);
}
```

### Better: returns ownership of the promise

The caller can await or handle failure. This applies
[Keep Async Boundaries Explicit](/patterns/keep-async-boundaries-explicit/).

```ts title="src/reports/publish.ts"
export function publishLater(report: Report) {
  return queue.publish(report);
}
```

### Problem: callback outlives its owner

The callback can run after the request owner has gone away.

```c title="src/example.c"
void publish_later(struct report *report) {
    event_loop_schedule(publish_report, report);
}
```

### Better: return scheduled work ownership

The caller receives the scheduled work id and can cancel or track it. This applies
[Name Async Ownership](/patterns/name-async-ownership/).

```c title="src/example.c"
scheduled_task publish_later(struct report *report) {
    return event_loop_schedule(publish_report, report);
}
```

### Problem: detached thread hides failure

The caller cannot join the work or observe errors.

```cpp title="src/example.cpp"
void publish_later(Report report) {
    std::thread([report] {
        queue.publish(report);
    }).detach();
}
```

### Better: return a future

The caller owns completion and failure observation. This applies
[Keep Async Boundaries Explicit](/patterns/keep-async-boundaries-explicit/).

```cpp title="src/example.cpp"
std::future<void> publish_later(Report report) {
    return std::async(std::launch::async, [report] {
        queue.publish(report);
    });
}
```

### Problem: goroutine ignores cancellation

The background publish can outlive the request context.

```go title="internal/example/service.go"
func PublishLater(report Report) {
    go publisher.Publish(context.Background(), report)
}
```

### Better: pass context through the worker

The worker shares the caller's cancellation boundary. This applies
[Keep Async Boundaries Explicit](/patterns/keep-async-boundaries-explicit/).

```go title="internal/example/service.go"
func PublishLater(ctx context.Context, report Report) {
    go publisher.Publish(ctx, report)
}
```

### Problem: promise is started and forgotten

The caller cannot observe completion or failure.

```js title="src/example.js"
export function publishLater(report) {
  queue.publish(report);
}
```

### Better: return the promise

The caller can await, chain, or report failure. This applies
[Keep Async Boundaries Explicit](/patterns/keep-async-boundaries-explicit/).

```js title="src/example.js"
export function publishLater(report) {
  return queue.publish(report);
}
```
