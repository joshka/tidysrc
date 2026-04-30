---
title: >-
  Weak abstractions hide context
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

## Impact

The code looks more organized but is harder to understand locally. Each extra name and file adds a
live fact the reader must remember, and agents often multiply these abstractions when repo-local
guidance is absent.

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

### Problem: C# helper hides the only useful context

The helper is used once and its name does not carry the rule.

```csharp title="Billing/Discounts.cs"
decimal Discount(Order order) => discountRules.Apply(order);
```

### Better: C# keeps the weak rule local

The condition is visible where the behavior is reviewed.

```csharp title="Billing/Discounts.cs"
decimal Discount(Order order) =>
    order.Customer.IsVip ? 0.10m : 0m;
```

### Problem: Java strategy adds a concept for one branch

The new interface makes readers jump without reducing complexity.

```java title="src/main/java/example/Discounts.java"
BigDecimal discount(Order order) {
    return discountStrategy.apply(order);
}
```

### Better: Java keeps the rule beside the caller

The local branch is easier to review than the new abstraction.

```java title="src/main/java/example/Discounts.java"
BigDecimal discount(Order order) {
    return order.customer().isVip() ? TEN_PERCENT : BigDecimal.ZERO;
}
```

### Problem: Python helper name does not explain enough

The reader has to open the helper to learn the rule.

```python title="billing/discounts.py"
def discount(order):
    return apply_rule(order)
```

### Better: Python names the local decision

The variable carries the domain fact without a jump.

```python title="billing/discounts.py"
def discount(order):
    loyalty_discount_applies = order.customer.is_vip
    return Decimal("0.10") if loyalty_discount_applies else Decimal("0")
```

### Problem: Rust trait exists for one implementation

The trait adds architecture before there is a second policy.

```rust title="src/discounts.rs"
pub fn discount(order: &Order, policy: &dyn DiscountPolicy) -> Decimal {
    policy.discount(order)
}
```

### Better: Rust keeps the rule local until pressure repeats

The function has fewer concepts to hold.

```rust title="src/discounts.rs"
pub fn discount(order: &Order) -> Decimal {
    if order.customer.is_vip() { dec!(0.10) } else { dec!(0) }
}
```

### Problem: TypeScript provider hides a local rule

The provider boundary makes one branch harder to inspect.

```ts title="src/billing/discounts.ts"
export function discount(order: Order) {
  return discountProvider.for(order).amount();
}
```

### Better: TypeScript keeps the rule in the workflow

The code stays local until the domain concept earns a boundary.

```ts title="src/billing/discounts.ts"
export function discount(order: Order) {
  return order.customer.isVip ? 0.1 : 0;
}
```
