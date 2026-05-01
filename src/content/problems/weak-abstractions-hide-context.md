---
title: >-
  Weak Abstractions Hide Context
status: reviewed
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
relatedConcepts:
  - reader-locality
  - cognitive-burden
  - yagni
---

## Description

A helper, provider, strategy, registry, or module boundary makes readers jump without carrying
enough meaning.

The abstraction adds a name, file, interface, or lookup path, but the reader still has to open the
implementation to understand the behavior. It moves code away from the context that explains it
without giving the new boundary a durable contract.

This is not an argument against abstraction. Strong abstractions reduce the facts a reader must hold
at once. Weak abstractions add concepts without reducing [cognitive burden](/concepts/cognitive-burden/)
or improving [reader locality](/concepts/reader-locality/).

## Why It Matters

The code looks more organized but is harder to understand locally. Each extra name and file adds a
navigation step, and each navigation step asks the reader to keep more context in working memory.

Reviewers also have to judge whether the abstraction is real or speculative. A premature provider,
registry, or strategy can make a small behavior change look like architecture work.

## Code Impact

Weak abstractions spread one behavior across names that do not explain it. Callers become short but
less informative, helpers depend on caller context, and tests often freeze the new boundary instead
of the behavior.

The code becomes harder to change because every future edit must decide whether to preserve the
abstraction, inline it, add a second weak caller, or turn it into the stronger concept it was
pretending to be.

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

- Keep weak helpers near the caller that gives them meaning; apply
  [reader locality](/patterns/reader-locality/) before extracting.
- Promote code only when the extracted concept has a clear contract beyond mechanical reuse.
- Prefer a small amount of repetition over a premature shared layer when the repetition is easier to
  read and test.
- Use [Extract Helper After Locality](/patterns/extract-helper-after-locality/) when the helper name
  lets the reader skip implementation detail.
- Treat one-caller providers, registries, and framework-shaped layers as speculative until the
  repeated concept is real.

## Examples

### Problem: provider hides a single C# rule

The provider is used once and its name does not carry the discount rule.

```csharp title="Billing/Discounts.cs"
decimal Discount(Order order) => discountProvider.AmountFor(order);
```

### Better: keep the condition beside the caller

The condition is visible where the behavior is reviewed. This applies
[Reader Locality](/patterns/reader-locality/).

```csharp title="Billing/Discounts.cs"
decimal Discount(Order order) =>
    order.Customer.IsVip ? 0.10m : 0m;
```

### Problem: strategy hides one branch

The strategy boundary makes readers open another type to learn one condition.

```java title="src/main/java/example/Discounts.java"
BigDecimal discount(Order order) {
    return discountStrategy.apply(order);
}
```

### Better: keep the branch beside the caller

The local branch is easier to review than the new abstraction. This applies
[Reader Locality](/patterns/reader-locality/).

```java title="src/main/java/example/Discounts.java"
BigDecimal discount(Order order) {
    return order.customer().isVip() ? TEN_PERCENT : BigDecimal.ZERO;
}
```

### Problem: generic helper hides the local rule

The reader has to open the helper to learn the rule.

```python title="billing/discounts.py"
def discount(order):
    return discount_rule.apply(order)
```

### Better: name the local decision

The variable carries the domain fact without a jump. This applies
[Reader Locality](/patterns/reader-locality/).

```python title="billing/discounts.py"
def discount(order):
    loyalty_discount_applies = order.customer.is_vip
    return Decimal("0.10") if loyalty_discount_applies else Decimal("0")
```

### Problem: trait hides one Rust policy

The trait has one implementation, so readers pay the indirection cost before there is a real
extension point.

```rust title="src/discounts.rs"
trait DiscountPolicy {
    fn discount(&self, order: &Order) -> Decimal;
}

struct VipDiscountPolicy;

impl DiscountPolicy for VipDiscountPolicy {
    fn discount(&self, order: &Order) -> Decimal {
        if order.customer.is_vip() { dec!(0.10) } else { dec!(0) }
    }
}

pub fn discount(order: &Order) -> Decimal {
    VipDiscountPolicy.discount(order)
}
```

### Better: keep the rule local until pressure repeats

The function has fewer concepts to hold. This applies
[Reader Locality](/patterns/reader-locality/).

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

### Better: keep the rule in the workflow

The code stays local until the domain concept earns a boundary. This applies
[Reader Locality](/patterns/reader-locality/).

```ts title="src/billing/discounts.ts"
export function discount(order: Order) {
  return order.customer.isVip ? 0.1 : 0;
}
```

### Problem: wrapper hides a local branch

The reader has to leave the workflow to learn one eligibility check.

```c title="src/example.c"
double discount_for_order(const struct order *order) {
    return discount_policy_apply(order);
}
```

### Better: keep the small rule local

The branch is visible where the discount behavior is reviewed. This applies
[Reader Locality](/patterns/reader-locality/).

```c title="src/example.c"
double discount_for_order(const struct order *order) {
    return order->customer.is_vip ? 0.10 : 0.0;
}
```

### Problem: strategy adds a jump for one rule

The strategy name does not carry enough meaning to avoid opening the implementation.

```cpp title="src/example.cpp"
Money discount_for(const Order& order) {
    return discount_strategy->apply(order);
}
```

### Better: keep the branch until the concept repeats

The local rule is easier to verify than the speculative strategy. This applies
[Reader Locality](/patterns/reader-locality/).

```cpp title="src/example.cpp"
Money discount_for(const Order& order) {
    return order.customer().is_vip() ? Money::percent(10) : Money::zero();
}
```

### Problem: provider hides a Go rule

The provider layer adds a concept before there is a second policy.

```go title="internal/example/service.go"
func Discount(order Order) float64 {
    return discountProvider.AmountFor(order)
}
```

### Better: keep the rule in the service

The service remains short and the rule is visible. This applies
[Reader Locality](/patterns/reader-locality/).

```go title="internal/example/service.go"
func Discount(order Order) float64 {
    if order.Customer.IsVIP {
        return 0.10
    }

    return 0
}
```

### Problem: helper hides the local rule

The helper is only used here and its name does not explain the branch.

```js title="src/example.js"
export function discount(order) {
  return applyDiscountRule(order);
}
```

### Better: keep the condition visible

The reader can verify the UI behavior without another jump. This applies
[Reader Locality](/patterns/reader-locality/).

```js title="src/example.js"
export function discount(order) {
  return order.customer.isVip ? 0.1 : 0;
}
```
