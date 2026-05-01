---
title: >-
  Silent Failure Paths
status: draft
category: side-effects
topics:
  - errors
  - failure-modes
  - observability
summary: >-
  The code swallows errors, returns empty results, or logs and continues when callers need to know
  work failed.
relatedPatterns:
  - make-failures-observable
  - return-structured-errors
  - test-observable-behavior
  - make-state-transitions-explicit
relatedConcepts:
  - observable-behavior
  - boundary-trust
---

## Description

The code swallows errors, returns empty results, or logs and continues when callers need to know
work failed.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Failures become harder to diagnose and can corrupt downstream assumptions. The system appears to

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

## Signals

- Catch blocks log errors and return defaults without telling the caller.
- A failed write or publish produces the same return shape as success.
- Tests only cover the happy path and one generic failure.
- Operational logs show errors that user-visible state never reports.

## Diagnostic Questions

- Who needs to know that this work failed?
- Is an empty result a valid domain outcome or a hidden error?
- What context would help recovery or reporting?
- Should the failure be represented as a structured error, event, or state transition?

## Approach

- Return structured failures when callers can recover or report them.
- Use domain-specific empty states only when absence is valid behavior.
- Test failure behavior at the boundary where callers observe it.
- Keep logging as diagnostics, not as the only behavior signal.

## Examples

### Problem: logs and continues after a failed write

The caller sees success even though the side effect failed.

```csharp title="Reports/Publisher.cs"
public async Task Publish(Report report)
{
    try { await queue.Publish(report); }
    catch (Exception error) { logger.LogError(error, "publish failed"); }
}
```

### Better: returns the failure

The caller can report or retry the failed publish.

```csharp title="Reports/Publisher.cs"
public async Task<Result> Publish(Report report)
{
    try { await queue.Publish(report); return Result.Ok(); }
    catch (Exception error) { return Result.Failed("publish_failed", error); }
}
```

### Problem: failure returns an empty result

Absence and failure look the same to callers.

```java title="src/main/java/example/Search.java"
List<Result> search(Query query) {
    try { return client.search(query); }
    catch (IOException error) { return List.of(); }
}
```

### Better: separates absence from failure

The caller can handle a real failure differently from no matches.

```java title="src/main/java/example/Search.java"
SearchResult search(Query query) {
    try { return SearchResult.matches(client.search(query)); }
    catch (IOException error) { return SearchResult.failed(error); }
}
```

### Problem: hides failed publish behind logging

The caller cannot know whether the message was sent.

```python title="reports/publish.py"
def publish(report):
    try:
        queue.publish(report)
    except QueueError:
        logger.exception("publish failed")
```

### Better: returns the failure (2)

The boundary exposes the observable outcome.

```python title="reports/publish.py"
def publish(report):
    try:
        queue.publish(report)
        return PublishResult.ok()
    except QueueError as error:
        return PublishResult.failed("queue_unavailable", error)
```

### Problem: drops the publish error

The caller receives success even when the queue failed.

```rust title="src/reports.rs"
pub fn publish(report: Report, queue: &Queue) {
    if let Err(error) = queue.publish(report) {
        tracing::error!(?error, "publish failed");
    }
}
```

### Better: returns the publish result

Logging can remain diagnostic, but the caller receives the failure.

```rust title="src/reports.rs"
pub fn publish(report: Report, queue: &Queue) -> Result<(), PublishError> {
    queue.publish(report).map_err(PublishError::Queue)
}
```

### Problem: returns success after a caught error

The UI cannot distinguish saved from failed.

```ts title="src/reports/publish.ts"
export async function publish(report: Report) {
  try { await queue.publish(report); }
  catch (error) { console.error(error); }
  return { status: 'ok' };
}
```

### Better: returns a structured outcome

The caller can show the failure or retry.

```ts title="src/reports/publish.ts"
export async function publish(report: Report): Promise<PublishResult> {
  try { await queue.publish(report); return { status: 'published' }; }
  catch (error) { return { status: 'failed', reason: 'queue-unavailable' }; }
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
