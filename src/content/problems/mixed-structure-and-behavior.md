---
title: Mixed Structure and Behavior
status: draft
category: change-risk
topics:
  - review
  - structure-vs-behavior
  - verification
summary: >-
  A single change mixes formatting, movement, renaming, behavior, tests, and cleanup until review
  cannot isolate the risk.
relatedPatterns:
  - choose-change-batch-size
  - untangle-before-changing
  - separate-structure-from-behavior
  - smallest-trustworthy-verification
  - characterize-before-changing
relatedConcepts:
  - structure-vs-behavior
  - observable-behavior
---

## Description

A single change mixes formatting, movement, renaming, behavior, tests, and cleanup until review
cannot isolate the risk.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Mixed diffs make reviewers compare too many possible causes at once. Even when the final code is

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

## Signals

- A diff contains both pure movement and changed conditionals.
- Formatting churn surrounds a small behavior change.
- Test updates, renames, and production behavior changes are all needed to understand one patch.
- Reviewers cannot tell whether a failure came from cleanup or the intended behavior change.

## Diagnostic Questions

- Can the structural change be reviewed as behavior-preserving first?
- Which lines are supposed to alter observable behavior?
- Would a smaller verification pass prove the cleanup stayed neutral?
- Is this change easier to review as two stacked changes?

## Approach

- Make behavior-preserving structure changes separately from behavior changes.
- Keep renames, movement, and formatting narrow enough that review can recognize them as neutral.
- Run focused verification after the structural step before changing behavior.
- Use source control to keep the stack honest instead of asking a reviewer to mentally split the
  diff.

## Examples

### Problem: rename and rule change land together

The reviewer has to separate the vocabulary change from the discount change.

```csharp title="Billing/Discounts.cs"
decimal CustomerDiscount(Order order)
{
    return order.Customer.IsVip || order.Total > 500 ? 0.10m : 0m;
}
```

### Better: behavior change is isolated

The rename can land separately from the rule change.

```csharp title="Billing/Discounts.cs"
decimal LoyaltyDiscount(Order order)
{
    return order.Customer.IsVip ? 0.10m : 0m;
}
```

### Problem: move hides a condition change

A method extraction and behavior edit become one review question.

```java title="src/main/java/example/Discounts.java"
BigDecimal discount(Order order) {
    return order.customer().isVip() || order.total().compareTo(LARGE_ORDER) > 0
        ? TEN_PERCENT
        : BigDecimal.ZERO;
}
```

### Better: structure changes before behavior

This version keeps the old behavior so the extraction can be checked first.

```java title="src/main/java/example/Discounts.java"
BigDecimal loyaltyDiscount(Order order) {
    return order.customer().isVip() ? TEN_PERCENT : BigDecimal.ZERO;
}
```

### Problem: rename and behavior change land together

The reviewer cannot tell whether the new condition or the surrounding movement caused a regression.

```python title="orders/discounts.py"
def customer_discount(order):
    if order.customer.is_vip or order.total > 500:
        return Decimal("0.10")
    return Decimal("0")
```

### Better: behavior change is isolated (2)

The structural rename can land first; the rule change is a separate review question.

```python title="orders/discounts.py"
def loyalty_discount(order):
    if order.customer.is_vip:
        return Decimal("0.10")
    return Decimal("0")
```

### Problem: cleanup and behavior change mix risks

The guard rewrite and threshold change need different review evidence.

```rust title="src/discounts.rs"
pub fn discount(order: &Order) -> Decimal {
    if order.customer.is_vip() || order.total > dec!(500) {
        dec!(0.10)
    } else {
        dec!(0)
    }
}
```

### Better: structure-only step keeps behavior stable

The extraction can be verified before changing the rule.

```rust title="src/discounts.rs"
pub fn discount(order: &Order) -> Decimal {
    if qualifies_for_loyalty_discount(order) {
        return dec!(0.10);
    }
    dec!(0)
}
```

### Problem: formatting churn hides behavior

The condition changed while the surrounding diff also moved and reformatted code.

```ts title="src/discounts.ts"
export function discount(order: Order) {
  return order.customer.isVip || order.total > 500 ? 0.1 : 0;
}
```

### Better: change asks one question

The behavior under review is visible without surrounding churn.

```ts title="src/discounts.ts"
export function discount(order: Order) {
  return order.customer.isVip ? 0.1 : 0;
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
