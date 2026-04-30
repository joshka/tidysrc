---
title: >-
  Silent failure paths
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
  - return-structured-errors
  - observable-behavior-tests
  - make-state-transitions-explicit
relatedConcepts:
  - observable-behavior
  - boundary-trust
---

## Impact

Failures become harder to diagnose and can corrupt downstream assumptions. The system appears to
succeed while skipping behavior that callers or users depend on.

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

### Problem: C# logs and continues after a failed write

The caller sees success even though the side effect failed.

```csharp title="Reports/Publisher.cs"
public async Task Publish(Report report)
{
    try { await queue.Publish(report); }
    catch (Exception error) { logger.LogError(error, "publish failed"); }
}
```

### Better: C# returns the failure

The caller can report or retry the failed publish.

```csharp title="Reports/Publisher.cs"
public async Task<Result> Publish(Report report)
{
    try { await queue.Publish(report); return Result.Ok(); }
    catch (Exception error) { return Result.Failed("publish_failed", error); }
}
```

### Problem: Java failure returns an empty result

Absence and failure look the same to callers.

```java title="src/main/java/example/Search.java"
List<Result> search(Query query) {
    try { return client.search(query); }
    catch (IOException error) { return List.of(); }
}
```

### Better: Java separates absence from failure

The caller can handle a real failure differently from no matches.

```java title="src/main/java/example/Search.java"
SearchResult search(Query query) {
    try { return SearchResult.matches(client.search(query)); }
    catch (IOException error) { return SearchResult.failed(error); }
}
```

### Problem: Python hides failed publish behind logging

The caller cannot know whether the message was sent.

```python title="reports/publish.py"
def publish(report):
    try:
        queue.publish(report)
    except QueueError:
        logger.exception("publish failed")
```

### Better: Python returns the failure

The boundary exposes the observable outcome.

```python title="reports/publish.py"
def publish(report):
    try:
        queue.publish(report)
        return PublishResult.ok()
    except QueueError as error:
        return PublishResult.failed("queue_unavailable", error)
```

### Problem: Rust drops the publish error

The caller receives success even when the queue failed.

```rust title="src/reports.rs"
pub fn publish(report: Report, queue: &Queue) {
    if let Err(error) = queue.publish(report) {
        tracing::error!(?error, "publish failed");
    }
}
```

### Better: Rust returns the publish result

Logging can remain diagnostic, but the caller receives the failure.

```rust title="src/reports.rs"
pub fn publish(report: Report, queue: &Queue) -> Result<(), PublishError> {
    queue.publish(report).map_err(PublishError::Queue)
}
```

### Problem: TypeScript returns success after a caught error

The UI cannot distinguish saved from failed.

```ts title="src/reports/publish.ts"
export async function publish(report: Report) {
  try { await queue.publish(report); }
  catch (error) { console.error(error); }
  return { status: 'ok' };
}
```

### Better: TypeScript returns a structured outcome

The caller can show the failure or retry.

```ts title="src/reports/publish.ts"
export async function publish(report: Report): Promise<PublishResult> {
  try { await queue.publish(report); return { status: 'published' }; }
  catch (error) { return { status: 'failed', reason: 'queue-unavailable' }; }
}
```
