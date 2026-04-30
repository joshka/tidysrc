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
  - separate-structure-from-behavior
  - smallest-trustworthy-verification
  - characterize-before-changing
relatedConcepts:
  - structure-vs-behavior
  - observable-behavior
---

## Impact

Mixed diffs make reviewers compare too many possible causes at once. Even when the final code is
better, the diff hides behavioral changes and makes regressions harder to blame.

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

### Problem: C# rename and rule change land together

The reviewer has to separate the vocabulary change from the discount change.

```csharp title="Billing/Discounts.cs"
decimal CustomerDiscount(Order order)
{
    return order.Customer.IsVip || order.Total > 500 ? 0.10m : 0m;
}
```

### Better: C# behavior change is isolated

The rename can land separately from the rule change.

```csharp title="Billing/Discounts.cs"
decimal LoyaltyDiscount(Order order)
{
    return order.Customer.IsVip ? 0.10m : 0m;
}
```

### Problem: Java move hides a condition change

A method extraction and behavior edit become one review question.

```java title="src/main/java/example/Discounts.java"
BigDecimal discount(Order order) {
    return order.customer().isVip() || order.total().compareTo(LARGE_ORDER) > 0
        ? TEN_PERCENT
        : BigDecimal.ZERO;
}
```

### Better: Java structure changes before behavior

This version keeps the old behavior so the extraction can be checked first.

```java title="src/main/java/example/Discounts.java"
BigDecimal loyaltyDiscount(Order order) {
    return order.customer().isVip() ? TEN_PERCENT : BigDecimal.ZERO;
}
```

### Problem: Python rename and behavior change land together

The reviewer cannot tell whether the new condition or the surrounding movement caused a regression.

```python title="orders/discounts.py"
def customer_discount(order):
    if order.customer.is_vip or order.total > 500:
        return Decimal("0.10")
    return Decimal("0")
```

### Better: Python behavior change is isolated

The structural rename can land first; the rule change is a separate review question.

```python title="orders/discounts.py"
def loyalty_discount(order):
    if order.customer.is_vip:
        return Decimal("0.10")
    return Decimal("0")
```

### Problem: Rust cleanup and behavior change mix risks

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

### Better: Rust structure-only step keeps behavior stable

The extraction can be verified before changing the rule.

```rust title="src/discounts.rs"
pub fn discount(order: &Order) -> Decimal {
    if qualifies_for_loyalty_discount(order) {
        return dec!(0.10);
    }
    dec!(0)
}
```

### Problem: TypeScript formatting churn hides behavior

The condition changed while the surrounding diff also moved and reformatted code.

```ts title="src/discounts.ts"
export function discount(order: Order) {
  return order.customer.isVip || order.total > 500 ? 0.1 : 0;
}
```

### Better: TypeScript change asks one question

The behavior under review is visible without surrounding churn.

```ts title="src/discounts.ts"
export function discount(order: Order) {
  return order.customer.isVip ? 0.1 : 0;
}
```
