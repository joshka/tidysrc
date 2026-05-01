---
title: >-
  Side Effect Visibility
summary: >-
  A reader should be able to see where code mutates state, touches I/O, reads time, or starts
  work.
status: draft
tags:
  - "side-effects"
  - "readability"
  - "testing"
relatedPatterns:
  - "make-side-effects-visible"
  - "inject-time-and-randomness"
  - "keep-async-boundaries-explicit"
---
## Why it matters

Side effects change the review question. Pure calculation can be checked locally, while mutation,
I/O, time, randomness, and background work require ordering and failure reasoning.

A pure-looking helper with hidden effects makes every caller suspicious. The reader has to inspect
implementation before trusting the call.

## Language pressure

Rust signatures expose some effects through ownership and mutability, but I/O, time, and task
spawning still need clear boundaries. Go, Java, TypeScript, and JavaScript rely more on names,
return types, and statement shape.

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
