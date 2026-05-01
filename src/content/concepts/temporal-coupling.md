---
title: >-
  Temporal Coupling
summary: >-
  Code is temporally coupled when correctness depends on hidden ordering, timing, or lifecycle
  assumptions.
status: draft
tags:
  - "async"
  - "testing"
  - "state"
relatedPatterns:
  - "keep-async-boundaries-explicit"
  - "inject-time-and-randomness"
  - "make-state-transitions-explicit"
---

## What to look for

Hidden ordering appears as unawaited promises, goroutines without cancellation, callbacks that
outlive their owner, sleeps in tests, and state that must be written before another method is
called.

Temporal coupling is hard to review because the relevant facts are often outside the lines being
changed. That creates ordinary maintenance bugs, such as updating one transition path but missing
another, and timing bugs such as [time-of-check to
time-of-use](/concepts/time-of-check-to-time-of-use/) gaps.

It also raises cognitive load. The reader has to ask what could have happened earlier, what might
happen between the check and the use, and which other path can mutate the same state.

## How to reduce it

Name lifecycle transitions, make async boundaries visible, pass clocks explicitly, and return
handles or results when work continues after the current function. Keep checks close to the use they
authorize, or make the checked state explicit enough that stale assumptions are rejected.

## Examples

### Low-level example

The concept becomes visible when the caller uses a named boundary instead of repeating a hidden rule.

```c title="src/example.c"
if (approval_policy_can_approve(policy, user, request)) {
    approve_request(request);
}
```

### Object example

The object caller keeps the decision behind a named boundary.

```cpp title="src/example.cpp"
if (approval_policy.can_approve(user, request)) {
    approvals.approve(request);
}
```

### Service example

The service calls a named policy instead of rebuilding the rule.

```csharp title="Approvals/ApprovalService.cs"
if (approvalPolicy.CanApprove(user, request))
{
    approvals.Approve(request);
}
```

### Boundary example

The boundary owns the decision the caller depends on.

```go title="internal/approvals/service.go"
if approvalPolicy.CanApprove(user, request) {
    approvals.Approve(request)
}
```

### Policy example

The caller asks a named policy for the decision.

```java title="src/main/java/example/Approvals.java"
if (approvalPolicy.canApprove(user, request)) {
    approvals.approve(request);
}
```

### Client example

The client keeps the rule behind a named boundary.

```js title="src/approvals.js"
if (approvalPolicy.canApprove(user, request)) {
  approve(request);
}
```

### Function example

The function delegates the rule to a named boundary.

```python title="approvals.py"
if approval_policy.can_approve(user, request):
    approvals.approve(request)
```

### Type example

The caller asks a named policy instead of rebuilding the condition.

```rust title="src/approvals.rs"
if approval_policy.can_approve(user, request) {
    approvals.approve(request);
}
```

### Typed example

The typed caller uses the named policy boundary.

```ts title="src/approvals.ts"
if (approvalPolicy.canApprove(user, request)) {
  approvals.approve(request);
}
```
