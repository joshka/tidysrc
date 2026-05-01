---
title: >-
  Observability Noise
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

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Noisy signals make real failures harder to find. They also become accidental behavior when

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

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

### Problem: logs omit stable context

Operators cannot group failures by report id or outcome.

```csharp title="Reports/Publisher.cs"
logger.LogError("Publish failed");
```

### Better: log names the outcome and fields

The signal has stable fields for dashboards and support.

```csharp title="Reports/Publisher.cs"
logger.LogError(error, "report.publish.failed {ReportId}", report.Id);
```

### Problem: metrics count implementation branches

The metric name changes when code structure changes.

```java title="src/main/java/example/Publisher.java"
metrics.increment("publish.if_branch_failed");
```

### Better: metrics name the observable outcome

The metric remains stable when internals move.

```java title="src/main/java/example/Publisher.java"
metrics.increment("report_publish_failed", Tags.of("reason", reason.code()));
```

### Problem: event fields drift by caller

Each path emits a different shape for the same outcome.

```python title="reports/events.py"
logger.info("failed", extra={"id": report.id, "why": reason})
```

### Better: event uses a named shape

The event contract is stable enough to test.

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

The message can change without breaking consumers.

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

The event name and fields can be treated as observable behavior.

```ts title="src/reports/publish.ts"
events.emit('report.publish.failed', {
  reportId: report.id,
  reason: reason.code,
});
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
