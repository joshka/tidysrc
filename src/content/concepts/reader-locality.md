---
title: >-
  Reader Locality
summary: >-
  Put related ideas where the reader needs them, especially when the abstraction is weak.
status: draft
tags:
  - "readability"
  - "organization"
relatedPatterns:
  - "reader-locality"
  - "chunk-statements"
  - "explaining-variable"
---
## Why it matters

Readers skim code under time pressure. Every jump to a weak helper, distant type, or generic
abstraction consumes part of the reader’s live mental stack.

Strong abstractions can live farther away because their contract carries meaning. Weak abstractions
should either stay near their caller or disappear.

## How to apply it

Open files with the central item when there is one. Arrange weak helpers in the order the reader
naturally encounters them. Keep related types and inherent methods close.

Prefer local names that explain the domain fact over generic names such as target, item, handler,
processor, or context unless nearby words make the boundary clear.

## Examples

### Low locality: weak facts split across files

The reader has to chase two weak abstractions before understanding one branch.

```ts title="src/process.ts"
// config.ts
export const APPROVAL_THRESHOLD = 42;

// score.ts
export function score(user: User) {
  return user.activity + user.reputation;
}

// process.ts
import { APPROVAL_THRESHOLD } from './config';
import { score } from './score';

export function process(user: User) {
  if (score(user) > APPROVAL_THRESHOLD) {
    approve(user);
  }
}
```

### High locality: name the decision near use

The helper carries the domain decision and keeps the weak facts near the caller.

```ts title="src/process.ts"
export function process(user: User) {
  if (isEligibleForApproval(user)) {
    approve(user);
  }
}

function isEligibleForApproval(user: User) {
  const approvalThreshold = 42;
  const score = user.activity + user.reputation;

  return score > approvalThreshold;
}
```

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
