---
title: >-
  Agent Guidance
summary: >-
  Coding agents need concise local rules, explicit precedence, and verification matched to the
  change.
status: draft
tags:
  - "agent-guidance"
  - "workflow"
relatedPatterns:
  - "follow-existing-conventions"
  - "avoid-premature-agent-architecture"
  - "constrain-agent-edit-surface"
  - "separate-exploration-from-editing"
  - "report-verification-honestly"
  - "preserve-human-changes"
  - "make-stop-conditions-explicit"
---
## Default posture

Agents should read local instructions first, make the smallest coherent change, and avoid broad
architecture that is not demanded by the current code.

They should state the verification they ran and avoid implying that unrun checks passed.

## Common failure modes

Frequent agent mistakes include hiding mutation inside pure-looking expressions, fragmenting code
into many weak files, over-extracting from one example, and ignoring repo-local style.

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
