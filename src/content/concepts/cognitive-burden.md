---
title: >-
  Cognitive Burden
summary: >-
  Parameters, fields, jumps, concepts, and hidden side effects all add to what the reader must
  hold at once.
status: draft
tags:
  - "readability"
  - "review"
relatedPatterns:
  - "explaining-variable"
  - "chunk-statements"
  - "reader-locality"
---
## Review heuristic

Ask whether the change reduces the number of live facts the next maintainer must remember. Line
count matters less than the shape of that mental stack.

An abstraction should remove facts from the reader’s head. If it adds a concept without removing
burden, it does not pay rent.

## How to apply it

Prefer changes that reduce jumps, hidden state, generic names, and mixed responsibilities. A smaller
diff is not automatically easier to understand if it forces the reader to remember more live facts.

When reviewing a proposed abstraction, ask what facts the abstraction lets the next reader forget.
If the answer is unclear, the abstraction probably needs a better name, a smaller scope, or more
time to prove itself through repeated pressure.

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
