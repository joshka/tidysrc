---
title: >-
  Silent Failure Paths
status: reviewed
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

The failure path exists, but it produces the same caller-visible shape as success. A failed publish
returns `ok`, a failed search returns an empty list, or a caught exception only writes a log line
that the caller cannot observe.

Some work is legitimately best-effort. The problem is silence: the code does not say whether the
failure is safe to ignore, should be retried, should move state, or should be reported.

## Why It Matters

Failures become harder to diagnose and can corrupt downstream assumptions. The system appears to
have completed work that did not actually happen.

Reviewers care because silence changes the contract. Callers cannot recover, users cannot be told
what failed, retries cannot be scheduled, and tests can pass while the side effect never occurred.

## Code Impact

Silent failure paths flatten distinct outcomes into one return shape. Empty data, success, skipped
work, and failed work become indistinguishable.

That forces later code to infer state from logs, missing records, or timing. It also makes failure
tests weak because there is no explicit result, event, or state transition to assert.

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

- [Make failures observable](/patterns/make-failures-observable/) when callers own recovery,
  reporting, or retry.
- Return [structured failures](/patterns/return-structured-errors/) when callers can recover or
  report them.
- Use domain-specific empty states only when absence is valid behavior.
- [Test observable behavior](/patterns/test-observable-behavior/) at the boundary where callers see
  the failed outcome.
- [Make state transitions explicit](/patterns/make-state-transitions-explicit/) when failed work
  should move a job, record, or request into a failed state.
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

The caller can report or retry the failed publish. This applies
[Make Failures Observable](/patterns/make-failures-observable/).

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

The caller can handle a real failure differently from no matches. This applies
[Return Structured Errors](/patterns/return-structured-errors/).

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

### Better: returns the publish failure

The boundary exposes the observable outcome. This applies
[Make Failures Observable](/patterns/make-failures-observable/).

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

Logging can remain diagnostic, but the caller receives the failure. This applies
[Make Failures Observable](/patterns/make-failures-observable/).

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

The caller can show the failure or retry. This applies
[Return Structured Errors](/patterns/return-structured-errors/).

```ts title="src/reports/publish.ts"
export async function publish(report: Report): Promise<PublishResult> {
  try { await queue.publish(report); return { status: 'published' }; }
  catch (error) { return { status: 'failed', reason: 'queue-unavailable' }; }
}
```

### Problem: failed write returns success

The caller cannot tell whether the report was saved.

```c title="src/example.c"
int save_report(struct report *report) {
    if (write_report(report) != 0) {
        log_error("save failed");
    }

    return 0;
}
```

### Better: return the write failure

The caller receives a failure it can report or retry. This applies
[Make Failures Observable](/patterns/make-failures-observable/).

```c title="src/example.c"
int save_report(struct report *report) {
    int result = write_report(report);
    if (result != 0) {
        log_error("save failed");
        return result;
    }

    return 0;
}
```

### Problem: export failure looks like success

The result says the export completed even when the file write failed.

```cpp title="src/example.cpp"
ExportResult export_report(const Report& report) {
    try {
        writer.write(report);
    } catch (const WriteError& error) {
        logger.error(error.what());
    }

    return ExportResult::completed();
}
```

### Better: result separates success from failure

The caller can branch on the export outcome. This applies
[Return Structured Errors](/patterns/return-structured-errors/).

```cpp title="src/example.cpp"
ExportResult export_report(const Report& report) {
    try {
        writer.write(report);
        return ExportResult::completed();
    } catch (const WriteError& error) {
        return ExportResult::failed(error.code());
    }
}
```

### Problem: failed publish is only logged

The caller receives nil even when the queue rejected the message.

```go title="internal/example/service.go"
func Publish(ctx context.Context, report Report) error {
    if err := queue.Publish(ctx, report); err != nil {
        slog.Error("publish failed", "error", err)
    }

    return nil
}
```

### Better: return the publish error

The caller can choose retry, failure state, or user feedback. This applies
[Make Failures Observable](/patterns/make-failures-observable/).

```go title="internal/example/service.go"
func Publish(ctx context.Context, report Report) error {
    if err := queue.Publish(ctx, report); err != nil {
        slog.Error("publish failed", "error", err)
        return err
    }

    return nil
}
```

### Problem: save failure returns ok

The UI receives success even when the request failed.

```js title="src/example.js"
export async function saveDraft(draft) {
  try {
    await api.saveDraft(draft);
  } catch (error) {
    console.error(error);
  }

  return { status: 'ok' };
}
```

### Better: return a visible failure state

The UI can render a retry path. This applies
[Make Failures Observable](/patterns/make-failures-observable/).

```js title="src/example.js"
export async function saveDraft(draft) {
  try {
    await api.saveDraft(draft);
    return { status: 'saved' };
  } catch (error) {
    return { status: 'failed', reason: 'save-failed' };
  }
}
```
