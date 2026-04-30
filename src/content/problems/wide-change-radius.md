---
title: >-
  Wide change radius
status: draft
category: change-risk
topics:
  - change-radius
  - review
  - ownership
summary: >-
  A small rule change spreads across files, tests, and callers that do not own the rule.
relatedPatterns:
  - cap-change-radius
  - separate-structure-from-behavior
  - smallest-trustworthy-verification
relatedConcepts:
  - change-radius
  - structure-vs-behavior
---

## Impact

The review becomes larger than the behavior. More files mean more merge risk, more verification
burden, and more chances for an agent to modify unrelated code.

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

### Problem: C# rule is copied across callers

Changing the approval threshold touches every surface.

```csharp title="Approvals/Api.cs"
if (request.Total < 5000 || user.IsManager) Approve(request);
```

### Better: C# rule has one owner

Callers ask the policy instead of copying the condition.

```csharp title="Approvals/Api.cs"
if (approvalPolicy.CanApprove(user, request)) Approve(request);
```

### Problem: Java rule change spreads through handlers

Each caller owns a copy of the threshold.

```java title="src/main/java/example/Approvals.java"
if (request.total().compareTo(LIMIT) < 0 || user.isManager()) {
    approve(request);
}
```

### Better: Java boundary owns the rule

The change radius collapses to the policy and its tests.

```java title="src/main/java/example/Approvals.java"
if (approvalPolicy.canApprove(user, request)) {
    approve(request);
}
```

### Problem: Python condition is copied into views and jobs

One business rule creates several edit sites.

```python title="approvals/views.py"
if request.total < 5000 or user.is_manager:
    approve(request)
```

### Better: Python rule moves to the owning boundary

Callers share the policy without hiding the action.

```python title="approvals/views.py"
if approval_policy.can_approve(user, request):
    approve(request)
```

### Problem: Rust rule is duplicated across commands

The same threshold appears in multiple workflows.

```rust title="src/approvals.rs"
if request.total < MONEY_LIMIT || user.is_manager() {
    approve(request)?;
}
```

### Better: Rust policy owns the change point

The caller still names the action under review.

```rust title="src/approvals.rs"
if approval_policy.can_approve(user, request) {
    approve(request)?;
}
```

### Problem: TypeScript rule leaks into UI and API

A threshold change becomes a broad diff.

```ts title="src/approvals/actions.ts"
if (request.total < 5000 || user.isManager) {
  approve(request);
}
```

### Better: TypeScript policy narrows the radius

The policy owns the rule and callers keep the workflow visible.

```ts title="src/approvals/actions.ts"
if (approvalPolicy.canApprove(user, request)) {
  approve(request);
}
```
