---
title: >-
  Unclear Async Ownership
status: draft
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

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Work can outlive the request, fail silently, race with subsequent reads, or leak resources.

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

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

### Problem: background work has no owner

Errors and cancellation are detached from the caller.

```csharp title="Reports/Publisher.cs"
public void PublishLater(Report report)
{
    _ = Task.Run(() => queue.Publish(report));
}
```

### Better: returns the queued work

The caller can decide whether to await or track it.

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

The caller receives a handle for ordering and errors.

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

The caller owns whether to await, cancel, or track it.

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

The boundary makes detached work explicit.

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

The caller can await or handle failure.

```ts title="src/reports/publish.ts"
export function publishLater(report: Report) {
  return queue.publish(report);
}
```

### Problem: low-level caller repeats the rule

The low-level path updates state without naming the boundary that owns the rule.

```c title="src/example.c"
if (request_total < 5000 || user_is_manager(user)) {
    approve_request(request);
}
```

### Better: low-level boundary owns the rule

The caller asks a named boundary instead of repeating the condition.

```c title="src/example.c"
if (approval_policy_can_approve(policy, user, request)) {
    approve_request(request);
}
```

### Problem: object path repeats the rule

The object caller owns a rule that should have a named boundary.

```cpp title="src/example.cpp"
if (request.total() < Money::from_cents(500000) || user.is_manager()) {
    approvals.approve(request);
}
```

### Better: object boundary owns the rule

The policy names the rule and narrows the future change radius.

```cpp title="src/example.cpp"
if (approval_policy.can_approve(user, request)) {
    approvals.approve(request);
}
```

### Problem: service path repeats the rule

The service path makes the rule local to one caller, so another caller can drift.

```go title="internal/example/service.go"
if request.Total < 5000 || user.IsManager {
    approvals.Approve(request)
}
```

### Better: service boundary owns the rule

The caller uses a named policy boundary.

```go title="internal/example/service.go"
if approvalPolicy.CanApprove(user, request) {
    approvals.Approve(request)
}
```

### Problem: client path repeats the rule

The client path repeats a rule that should have a named boundary.

```js title="src/example.js"
if (request.total < 5000 || user.role === 'manager') {
  approve(request);
}
```

### Better: client boundary owns the rule

The caller asks the named policy instead of rebuilding the condition.

```js title="src/example.js"
if (approvalPolicy.canApprove(user, request)) {
  approve(request);
}
```
