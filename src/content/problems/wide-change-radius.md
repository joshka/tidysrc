---
title: >-
  Wide Change Radius
status: draft
category: change-risk
topics:
  - change-radius
  - review
  - ownership
summary: >-
  A small rule change spreads across files, tests, and callers that do not own the rule.
relatedPatterns:
  - name-coupling
  - cap-change-radius
  - separate-structure-from-behavior
  - smallest-trustworthy-verification
relatedConcepts:
  - change-radius
  - structure-vs-behavior
---

## Description

A small rule change spreads across files, tests, and callers that do not own the rule.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

The review becomes larger than the behavior. More files mean more merge risk, more verification

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

## Signals

- One condition is copied across views, handlers, tests, and helpers.
- A small wording or policy change touches many unrelated files.
- Reviewers cannot find the one file that owns the behavior.
- A type or config change creates mechanical edits mixed with behavior edits.

## Diagnostic Questions

- Which boundary should own this rule?
- Which touched files are mechanical fallout?
- Can structural changes be stacked before the behavior change?
- Would a precise type or policy object reduce future edit sites?

## Approach

- Move the rule to the boundary that owns it before updating every caller.
- Separate mechanical radius from behavior radius when both are needed.
- Use targeted verification after each unit of the change.
- Avoid centralizing unrelated rules only to reduce file count.

## Examples

### Problem: rule is copied across callers

Changing the approval threshold touches every surface.

```csharp title="Approvals/Api.cs"
if (request.Total < 5000 || user.IsManager) Approve(request);
```

### Better: rule has one owner

Callers ask the policy instead of copying the condition.

```csharp title="Approvals/Api.cs"
if (approvalPolicy.CanApprove(user, request)) Approve(request);
```

### Problem: rule change spreads through handlers

Each caller owns a copy of the threshold.

```java title="src/main/java/example/Approvals.java"
if (request.total().compareTo(LIMIT) < 0 || user.isManager()) {
    approve(request);
}
```

### Better: boundary owns the rule

The change radius collapses to the policy and its tests.

```java title="src/main/java/example/Approvals.java"
if (approvalPolicy.canApprove(user, request)) {
    approve(request);
}
```

### Problem: condition is copied into views and jobs

One business rule creates several edit sites.

```python title="approvals/views.py"
if request.total < 5000 or user.is_manager:
    approve(request)
```

### Better: rule moves to the owning boundary

Callers share the policy without hiding the action.

```python title="approvals/views.py"
if approval_policy.can_approve(user, request):
    approve(request)
```

### Problem: rule is duplicated across commands

The same threshold appears in multiple workflows.

```rust title="src/approvals.rs"
if request.total < MONEY_LIMIT || user.is_manager() {
    approve(request)?;
}
```

### Better: policy owns the change point

The caller still names the action under review.

```rust title="src/approvals.rs"
if approval_policy.can_approve(user, request) {
    approve(request)?;
}
```

### Problem: rule leaks into UI and API

A threshold change becomes a broad diff.

```ts title="src/approvals/actions.ts"
if (request.total < 5000 || user.isManager) {
  approve(request);
}
```

### Better: policy narrows the radius

The policy owns the rule and callers keep the workflow visible.

```ts title="src/approvals/actions.ts"
if (approvalPolicy.canApprove(user, request)) {
  approve(request);
}
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
