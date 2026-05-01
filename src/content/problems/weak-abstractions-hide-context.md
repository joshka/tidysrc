---
title: >-
  Weak Abstractions Hide Context
status: draft
category: architecture
topics:
  - abstraction
  - reader-locality
  - agents
summary: >-
  A helper, provider, strategy, registry, or module boundary makes readers jump without carrying
  enough meaning.
relatedPatterns:
  - extract-helper-after-locality
  - reader-locality
  - avoid-premature-agent-architecture
relatedConcepts:
  - reader-locality
  - agent-guidance
  - cognitive-burden
---

## Description

A helper, provider, strategy, registry, or module boundary makes readers jump without carrying
enough meaning.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

The code looks more organized but is harder to understand locally. Each extra name and file adds a

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

## Signals

- A helper is used once and only makes sense beside its caller.
- The name describes mechanics, not a durable domain concept.
- A review requires opening several files to understand one small behavior.
- A proposed extraction reduces line count while increasing navigation and indirection.

## Diagnostic Questions

- Can the new name be understood from its signature and local module context?
- Does the abstraction remove a concept or add one?
- Is there a real second caller, or only a speculative one?
- Would keeping the code nearby make the workflow easier to verify?

## Approach

- Keep weak helpers near the caller that gives them meaning.
- Promote code only when the extracted concept has a clear contract beyond mechanical reuse.
- Prefer a small amount of repetition over a premature shared layer when the repetition is easier to
  read and test.
- For agent work, state the boundary explicitly: do not add framework-shaped architecture unless the
  current change needs it.

## Examples

### Problem: helper hides the only useful context

The helper is used once and its name does not carry the rule.

```csharp title="Billing/Discounts.cs"
decimal Discount(Order order) => discountRules.Apply(order);
```

### Better: keeps the weak rule local

The condition is visible where the behavior is reviewed.

```csharp title="Billing/Discounts.cs"
decimal Discount(Order order) =>
    order.Customer.IsVip ? 0.10m : 0m;
```

### Problem: strategy adds a concept for one branch

The new interface makes readers jump without reducing complexity.

```java title="src/main/java/example/Discounts.java"
BigDecimal discount(Order order) {
    return discountStrategy.apply(order);
}
```

### Better: keeps the rule beside the caller

The local branch is easier to review than the new abstraction.

```java title="src/main/java/example/Discounts.java"
BigDecimal discount(Order order) {
    return order.customer().isVip() ? TEN_PERCENT : BigDecimal.ZERO;
}
```

### Problem: helper name does not explain enough

The reader has to open the helper to learn the rule.

```python title="billing/discounts.py"
def discount(order):
    return apply_rule(order)
```

### Better: names the local decision

The variable carries the domain fact without a jump.

```python title="billing/discounts.py"
def discount(order):
    loyalty_discount_applies = order.customer.is_vip
    return Decimal("0.10") if loyalty_discount_applies else Decimal("0")
```

### Problem: trait exists for one implementation

The trait adds architecture before there is a second policy.

```rust title="src/discounts.rs"
pub fn discount(order: &Order, policy: &dyn DiscountPolicy) -> Decimal {
    policy.discount(order)
}
```

### Better: keeps the rule local until pressure repeats

The function has fewer concepts to hold.

```rust title="src/discounts.rs"
pub fn discount(order: &Order) -> Decimal {
    if order.customer.is_vip() { dec!(0.10) } else { dec!(0) }
}
```

### Problem: provider hides a local rule

The provider boundary makes one branch harder to inspect.

```ts title="src/billing/discounts.ts"
export function discount(order: Order) {
  return discountProvider.for(order).amount();
}
```

### Better: keeps the rule in the workflow

The code stays local until the domain concept earns a boundary.

```ts title="src/billing/discounts.ts"
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
