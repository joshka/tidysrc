---
title: >-
  State Space
summary: >-
  The set of states a program can represent, including impossible combinations the code
  accidentally permits.
status: draft
tags:
  - "correctness"
  - "api-design"
  - "state"
relatedPatterns:
  - "make-state-transitions-explicit"
  - "replace-boolean-flag-with-choice"
  - "make-invalid-states-hard-to-express"
---
## Review heuristic

Ask which states the code can represent, not only which states the developer intended. Invalid
combinations are bugs waiting for the right call path.

Independent booleans, nullable fields, and loose strings expand the state space. Enums, variants,
constructors, and transition functions can reduce it.

## Language pressure

Rust enums can encode mutually exclusive states directly. TypeScript discriminated unions can do the
same when callers preserve the tag. Java sealed types and enums help when the domain has named
states. Go often uses small typed constants plus constructors.

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
