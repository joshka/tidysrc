---
title: >-
  Change Radius
summary: >-
  The set of files, concepts, call sites, tests, and contracts that must move for one source
  change.
status: draft
tags:
  - "workflow"
  - "architecture"
  - "review"
relatedPatterns:
  - "cap-change-radius"
  - "separate-structure-from-behavior"
  - "reader-locality"
---
## What expands it

A change radius grows when one rule is copied across callers, when raw data leaks through
boundaries, or when tests assert private shape. Some radius is real compatibility cost; some is
accidental structure.

Large radius is not automatically wrong. It becomes a problem when many touched files do not own the
behavior being changed.

## How to reason about it

Find the boundary that should own the rule. If the radius is still large after that, split
mechanical movement from behavior so review can isolate the risk.

In Rust, type changes often reveal the radius at compile time. In TypeScript, JavaScript, Go, and
Java, tests and call-site search often reveal it later.

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
