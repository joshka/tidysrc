---
title: >-
  Observability Noise
status: reviewed
category: side-effects
topics:
  - logs
  - metrics
  - contracts
summary: >-
  Logs, metrics, and events are emitted without a stable contract for what changed or who should
  act.
relatedPatterns:
  - contain-observability-policy
  - return-structured-errors
  - test-observable-behavior
  - make-side-effects-visible
relatedConcepts:
  - observable-behavior
  - side-effect-visibility
---

## Description

Logs, metrics, and events are emitted without a stable contract for what changed or who should act.
One path logs a message, another increments a branch-shaped metric, and a third emits an event with
different field names for the same outcome.

The source-change problem is not logging volume by itself. It is that diagnostics become relied-on
behavior without the same care as other [observable behavior](/concepts/observable-behavior/).
Operators, dashboards, tests, and support workflows start depending on signals that were added as
local debugging.

## Why It Matters

Noisy signals make real failures harder to find. Reviewers also have to decide whether a changed
log, metric, or event is harmless debug text or part of the contract another system relies on.

The cost appears during incidents and cleanup. A maintainer may remove a message that powers an
alert, rename a field a dashboard groups by, or add a metric that counts implementation branches
instead of user-visible outcomes.

## Code Impact

Observability noise spreads signal policy through ordinary code. Helpers log partial context,
callers choose their own field names, metrics mirror internal branches, and downstream tools parse
message text because no stable shape exists.

That makes diagnostics hard to change safely. The code no longer shows which signals are temporary
debugging and which are part of the system boundary, so cleanup and refactoring can break monitoring
without changing product behavior.

## Signals

- Several code paths log similar failures with different field names.
- Metrics count implementation branches rather than user-visible outcomes.
- Events lack stable identifiers or failure context.
- Tests ignore diagnostics even though callers or operators depend on them.

## Diagnostic Questions

- Who consumes this signal?
- Is the signal part of observable behavior or only local debugging?
- Which fields are stable enough to rely on?
- Does this signal identify the outcome, the cause, or both?

## Approach

- [Contain observability policy](/patterns/contain-observability-policy/) at the boundary that owns
  the outcome.
- Keep debug logs separate from signals that operators or callers depend on.
- Treat relied-on logs, metrics, and events as
  [observable behavior](/concepts/observable-behavior/) in tests.
- Use [structured errors](/patterns/return-structured-errors/) and events instead of parsing
  message text downstream.
- [Make side effects visible](/patterns/make-side-effects-visible/) when logging, metrics, or
  event publication changes review risk.

## Examples

### Problem: logs omit stable context

Operators cannot group failures by report id or outcome.

```csharp title="Reports/Publisher.cs"
logger.LogError("Publish failed");
```

### Better: log names the outcome and fields

The signal has stable fields for dashboards and support. This applies
[Contain Observability Policy](/patterns/contain-observability-policy/).

```csharp title="Reports/Publisher.cs"
logger.LogError(error, "report.publish.failed {ReportId}", report.Id);
```

### Problem: metrics count implementation branches

The metric name changes when code structure changes.

```java title="src/main/java/example/Publisher.java"
metrics.increment("publish.if_branch_failed");
```

### Better: metrics name the observable outcome

The metric remains stable when internals move. This applies
[Contain Observability Policy](/patterns/contain-observability-policy/).

```java title="src/main/java/example/Publisher.java"
metrics.increment("report_publish_failed", Tags.of("reason", reason.code()));
```

### Problem: event fields drift by caller

Each path emits a different shape for the same outcome.

```python title="reports/events.py"
logger.info("failed", extra={"id": report.id, "why": reason})
```

### Better: event uses a named shape

The event contract is stable enough to test. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```python title="reports/events.py"
logger.info(
    "report.publish.failed",
    extra={"report_id": report.id, "reason": reason.code},
)
```

### Problem: diagnostic message is the contract

Downstream tools have to parse text.

```rust title="src/reports.rs"
tracing::warn!("failed to publish {}", report.id);
```

### Better: event fields carry the contract

The message can change without breaking consumers. This applies
[Return Structured Errors](/patterns/return-structured-errors/) to the diagnostic shape.

```rust title="src/reports.rs"
tracing::warn!(
    event = "report.publish.failed",
    report_id = %report.id,
    reason = %reason.code(),
);
```

### Problem: logs lack a stable event name

The dashboard cannot distinguish debug text from relied-on signal.

```ts title="src/reports/publish.ts"
console.warn(`Failed to publish ${report.id}: ${reason}`);
```

### Better: emits a structured event

The event name and fields can be treated as observable behavior. This applies
[Contain Observability Policy](/patterns/contain-observability-policy/).

```ts title="src/reports/publish.ts"
events.emit('report.publish.failed', {
  reportId: report.id,
  reason: reason.code,
});
```

### Problem: message text carries the contract

The consumer has to parse words from a log line to group failures.

```c title="src/example.c"
fprintf(stderr, "publish failed for %s: %s\n", report_id, reason);
```

### Better: fields carry the contract

The event name and fields stay stable even when the message changes. This applies
[Contain Observability Policy](/patterns/contain-observability-policy/).

```c title="src/example.c"
emit_event("report.publish.failed",
           "report_id", report_id,
           "reason", reason_code(reason));
```

### Problem: metric names the implementation branch

The metric changes whenever the branch structure changes.

```cpp title="src/example.cpp"
metrics.increment("publish.retry_branch_failed");
```

### Better: metric names the outcome

The metric remains stable while implementation details move. This applies
[Contain Observability Policy](/patterns/contain-observability-policy/).

```cpp title="src/example.cpp"
metrics.increment("report_publish_failed", {{"reason", reason.code()}});
```

### Problem: log line omits grouping fields

Operators can see that something failed, but not which report or outcome to group.

```go title="internal/example/service.go"
slog.Error("publish failed")
```

### Better: log fields name the outcome

The event name and fields make the signal useful to dashboards and tests. This applies
[Contain Observability Policy](/patterns/contain-observability-policy/).

```go title="internal/example/service.go"
slog.Error("report.publish.failed",
    "report_id", report.ID,
    "reason", reason.Code(),
)
```

### Problem: debug text becomes the signal

The UI logs a string that support tooling later treats as a stable event.

```js title="src/example.js"
console.warn(`publish failed: ${report.id} ${reason}`);
```

### Better: emit a named event

The signal has an event name and stable fields. This applies
[Contain Observability Policy](/patterns/contain-observability-policy/).

```js title="src/example.js"
events.emit('report.publish.failed', {
  reportId: report.id,
  reason: reason.code,
});
```
