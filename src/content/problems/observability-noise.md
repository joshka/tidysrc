---
title: >-
  Observability noise
status: draft
category: side-effects
topics:
  - logs
  - metrics
  - contracts
summary: >-
  Logs, metrics, and events are emitted without a stable contract for what changed or who should
  act.
relatedPatterns:
  - return-structured-errors
  - observable-behavior-tests
  - make-side-effects-visible
relatedConcepts:
  - observable-behavior
  - side-effect-visibility
---

## Impact

Noisy signals make real failures harder to find. They also become accidental behavior when
downstream dashboards, alerts, or support workflows depend on unstable names and fields.

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

- Name diagnostic events around observable outcomes and stable context.
- Keep debug logs separate from signals that operators or callers depend on.
- Treat relied-on logs, metrics, and events as observable contracts in tests.
- Use structured errors and events instead of parsing message text downstream.

## Examples

### Problem: C# logs omit stable context

Operators cannot group failures by report id or outcome.

```csharp title="Reports/Publisher.cs"
logger.LogError("Publish failed");
```

### Better: C# log names the outcome and fields

The signal has stable fields for dashboards and support.

```csharp title="Reports/Publisher.cs"
logger.LogError(error, "report.publish.failed {ReportId}", report.Id);
```

### Problem: Java metrics count implementation branches

The metric name changes when code structure changes.

```java title="src/main/java/example/Publisher.java"
metrics.increment("publish.if_branch_failed");
```

### Better: Java metrics name the observable outcome

The metric remains stable when internals move.

```java title="src/main/java/example/Publisher.java"
metrics.increment("report_publish_failed", Tags.of("reason", reason.code()));
```

### Problem: Python event fields drift by caller

Each path emits a different shape for the same outcome.

```python title="reports/events.py"
logger.info("failed", extra={"id": report.id, "why": reason})
```

### Better: Python event uses a named shape

The event contract is stable enough to test.

```python title="reports/events.py"
logger.info(
    "report.publish.failed",
    extra={"report_id": report.id, "reason": reason.code},
)
```

### Problem: Rust diagnostic message is the contract

Downstream tools have to parse text.

```rust title="src/reports.rs"
tracing::warn!("failed to publish {}", report.id);
```

### Better: Rust event fields carry the contract

The message can change without breaking consumers.

```rust title="src/reports.rs"
tracing::warn!(
    event = "report.publish.failed",
    report_id = %report.id,
    reason = %reason.code(),
);
```

### Problem: TypeScript logs lack a stable event name

The dashboard cannot distinguish debug text from relied-on signal.

```ts title="src/reports/publish.ts"
console.warn(`Failed to publish ${report.id}: ${reason}`);
```

### Better: TypeScript emits a structured event

The event name and fields can be treated as observable behavior.

```ts title="src/reports/publish.ts"
events.emit('report.publish.failed', {
  reportId: report.id,
  reason: reason.code,
});
```
