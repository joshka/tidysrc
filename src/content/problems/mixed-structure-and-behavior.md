---
title: Mixed Structure and Behavior
status: reviewed
category: change-risk
topics:
  - review
  - structure-vs-behavior
  - verification
summary: >-
  A single change mixes cleanup, movement, renaming, and behavior so reviewers cannot tell what
  changed the program.
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

A single change mixes cleanup, movement, renaming, and behavior so reviewers cannot tell what
changed the program.

Structure changes alter code shape: names, files, formatting, helper boundaries, and statement
order. Behavior changes alter what callers can observe. When both kinds of change land together,
the review has to answer two questions at once.

## Why It Matters

Mixed diffs make reviewers compare too many possible causes at once. A failing test may come from
the intended rule change, an accidental behavior change during extraction, or a mechanical move that
was not actually neutral.

Reviewers care because mixed diffs hide rollback and verification boundaries. If the behavior
change is wrong, the team should be able to keep useful cleanup without also keeping the bad rule.

## Code Impact

The code impact is ambiguity. Renames and moves make it harder to see which lines changed meaning.
Formatting churn can bury a condition change. Test updates can accidentally approve both a new
behavior and an unrelated cleanup.

The final code may be fine, but the diff loses its proof. Future maintainers cannot tell whether a
helper was extracted to preserve behavior, to change behavior, or to make room for a later change.

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

- [Separate structure from behavior](/patterns/separate-structure-from-behavior/) when cleanup can
  be verified without the new rule.
- [Untangle before changing](/patterns/untangle-before-changing/) when the behavior change needs a
  clearer place to land.
- [Choose change batch size](/patterns/choose-change-batch-size/) so each review unit has one
  purpose and one verification story.
- Run the [smallest trustworthy verification](/patterns/smallest-trustworthy-verification/) after
  the structural step before changing behavior.
- [Characterize before changing](/patterns/characterize-before-changing/) when legacy behavior is
  too risky to preserve by inspection alone.

## Examples

### Problem: rename and discount rule land together

The diff shows the final code after both changes. The reviewer has to infer that the function was
renamed and the large-order discount was removed.

```csharp title="Billing/Discounts.cs"
// Before: original name and original rule.
decimal CustomerDiscount(Order order)
{
    return order.Customer.IsVip || order.Total > 500 ? 0.10m : 0m;
}

// Mixed diff: rename CustomerDiscount -> LoyaltyDiscount
// and remove the large-order discount in the same review.
decimal LoyaltyDiscount(Order order)
{
    return order.Customer.IsVip ? 0.10m : 0m;
}
```

### Better: split rename from discount rule

The first change preserves behavior. The second change removes the large-order rule.

```csharp title="Billing/Discounts.cs"
// Change 1: rename only, behavior preserved.
decimal LoyaltyDiscount(Order order)
{
    return order.Customer.IsVip || order.Total > 500 ? 0.10m : 0m;
}

// Change 2: behavior change only.
decimal LoyaltyDiscount(Order order)
{
    return order.Customer.IsVip ? 0.10m : 0m;
}
```

### Problem: move hides a condition change

The extracted helper also drops the large-order condition.

```java title="src/main/java/example/Discounts.java"
// Before: inline rule includes VIP and large-order discounts.
BigDecimal discount(Order order) {
    return order.customer().isVip() || order.total().compareTo(LARGE_ORDER) > 0
        ? TEN_PERCENT
        : BigDecimal.ZERO;
}

// Mixed diff: extract helper and change the rule.
BigDecimal discount(Order order) {
    return loyaltyDiscount(order);
}

BigDecimal loyaltyDiscount(Order order) {
    return order.customer().isVip() ? TEN_PERCENT : BigDecimal.ZERO;
}
```

### Better: structure changes before behavior

The extraction keeps the old behavior first. The rule change lands in a later review.

```java title="src/main/java/example/Discounts.java"
// Change 1: extract helper, behavior preserved.
BigDecimal discount(Order order) {
    return loyaltyDiscount(order);
}

BigDecimal loyaltyDiscount(Order order) {
    return order.customer().isVip() || order.total().compareTo(LARGE_ORDER) > 0
        ? TEN_PERCENT
        : BigDecimal.ZERO;
}

// Change 2: behavior change only.
BigDecimal loyaltyDiscount(Order order) {
    return order.customer().isVip()
        ? TEN_PERCENT
        : BigDecimal.ZERO;
}
```

### Problem: rename and branch change land together

The final code hides that one edit renamed the function while another changed eligibility.

```python title="orders/discounts.py"
# Before: original name and original rule.
def customer_discount(order):
    if order.customer.is_vip or order.total > 500:
        return Decimal("0.10")
    return Decimal("0")

# Mixed diff: rename customer_discount -> loyalty_discount
# and remove the large-order branch.
def loyalty_discount(order):
    if order.customer.is_vip:
        return Decimal("0.10")
    return Decimal("0")
```

### Better: split rename from branch change

The rename can be checked as behavior-preserving before the branch changes.

```python title="orders/discounts.py"
# Change 1: rename only, behavior preserved.
def loyalty_discount(order):
    if order.customer.is_vip or order.total > 500:
        return Decimal("0.10")
    return Decimal("0")

# Change 2: behavior change only.
def loyalty_discount(order):
    if order.customer.is_vip:
        return Decimal("0.10")
    return Decimal("0")
```

### Problem: cleanup and behavior change mix risks

The guard rewrite also drops the large-order branch.

```rust title="src/discounts.rs"
// Before: nested form includes VIP and large-order discounts.
pub fn discount(order: &Order) -> Decimal {
    if order.customer.is_vip() || order.total > dec!(500) {
        dec!(0.10)
    } else {
        dec!(0)
    }
}

// Mixed diff: guard-style cleanup and rule change.
pub fn discount(order: &Order) -> Decimal {
    if !order.customer.is_vip() {
        return dec!(0);
    }

    dec!(0.10)
}
```

### Better: structure-only step keeps behavior stable

The guard rewrite keeps the old behavior. The rule change can follow separately.

```rust title="src/discounts.rs"
// Change 1: guard rewrite, behavior preserved.
pub fn discount(order: &Order) -> Decimal {
    if !order.customer.is_vip() && order.total <= dec!(500) {
        return dec!(0);
    }

    dec!(0.10)
}

// Change 2: behavior change only.
pub fn discount(order: &Order) -> Decimal {
    if !order.customer.is_vip() {
        return dec!(0);
    }

    dec!(0.10)
}
```

### Problem: formatting churn hides behavior

The final code hides that formatting churn and rule removal happened together.

```ts title="src/discounts.ts"
// Before: compact expression includes VIP and large-order discounts.
export function discount(order: Order) {
  return order.customer.isVip || order.total > 500 ? 0.1 : 0;
}

// Mixed diff: formatting churn and behavior change.
export function discount(order: Order) {
  return order.customer.isVip
    ? 0.1
    : 0;
}
```

### Better: change asks one question

The formatting step preserves behavior before the rule changes.

```ts title="src/discounts.ts"
// Change 1: formatting only, behavior preserved.
export function discount(order: Order) {
  return order.customer.isVip || order.total > 500
    ? 0.1
    : 0;
}

// Change 2: behavior change only.
export function discount(order: Order) {
  return order.customer.isVip ? 0.1 : 0;
}
```

### Problem: rename and rule change share a diff

The final function name is clearer, but the behavior changed at the same time.

```c title="src/discounts.c"
/* Before: original name and original rule. */
Money customer_discount(const Order *order) {
    if (order->customer.is_vip || order->total_cents > 50000) {
        return money_from_cents(1000);
    }
    return money_zero();
}

/* Mixed diff: rename customer_discount -> loyalty_discount
   and remove the large-order discount. */
Money loyalty_discount(const Order *order) {
    if (order->customer.is_vip) {
        return money_from_cents(1000);
    }
    return money_zero();
}
```

### Better: rename lands before the rule change

The structure-only rename can be reviewed before the threshold changes.

```c title="src/discounts.c"
/* Change 1: rename only, behavior preserved. */
Money loyalty_discount(const Order *order) {
    if (order->customer.is_vip || order->total_cents > 50000) {
        return money_from_cents(1000);
    }
    return money_zero();
}

/* Change 2: behavior change only. */
Money loyalty_discount(const Order *order) {
    if (order->customer.is_vip) {
        return money_from_cents(1000);
    }
    return money_zero();
}
```

### Problem: extraction and rule change share a diff

The final code hides that the helper extraction also removed the large-order case.

```cpp title="src/discounts.cpp"
// Before: inline rule includes VIP and large-order discounts.
Money discount(const Order& order) {
    return order.customer().is_vip() || order.total() > Money::from_cents(50000)
        ? Money::from_cents(1000)
        : Money::zero();
}

// Mixed diff: extract helper and change the rule.
bool qualifies_for_discount(const Order& order) {
    return order.customer().is_vip();
}

Money discount(const Order& order) {
    return qualifies_for_discount(order) ? Money::from_cents(1000) : Money::zero();
}
```

### Better: extraction preserves behavior first

The structural step keeps the old condition so the extraction can be checked on its own.

```cpp title="src/discounts.cpp"
// Change 1: extract helper, behavior preserved.
bool qualifies_for_discount(const Order& order) {
    return order.customer().is_vip() || order.total() > Money::from_cents(50000);
}

Money discount(const Order& order) {
    return qualifies_for_discount(order) ? Money::from_cents(1000) : Money::zero();
}

// Change 2: behavior change only.
bool qualifies_for_discount(const Order& order) {
    return order.customer().is_vip();
}
```

### Problem: cleanup hides a changed branch

The guard rewrite also changes which orders receive a discount.

```go title="internal/discounts/discount.go"
// Before: direct condition includes VIP and large-order discounts.
func Discount(order Order) Money {
    if order.Customer.IsVIP || order.TotalCents > 50000 {
        return Money{Cents: 1000}
    }
    return Money{}
}

// Mixed diff: guard rewrite and rule change.
func Discount(order Order) Money {
    if !order.Customer.IsVIP {
        return Money{}
    }
    return Money{Cents: 1000}
}
```

### Better: structure change keeps behavior stable

The guard rewrite preserves behavior before the discount rule changes.

```go title="internal/discounts/discount.go"
// Change 1: guard rewrite, behavior preserved.
func Discount(order Order) Money {
    if !order.Customer.IsVIP && order.TotalCents <= 50000 {
        return Money{}
    }
    return Money{Cents: 1000}
}

// Change 2: behavior change only.
func Discount(order Order) Money {
    if !order.Customer.IsVIP {
        return Money{}
    }
    return Money{Cents: 1000}
}
```

### Problem: formatting hides behavior

The formatting change also removes the large-order discount.

```js title="src/discounts.js"
// Before: compact expression includes VIP and large-order discounts.
export function discount(order) {
  return order.customer.isVip || order.total > 500 ? 0.1 : 0;
}

// Mixed diff: formatting and rule change.
export function discount(order) {
  return order.customer.isVip
    ? 0.1
    : 0;
}
```

### Better: behavior change stands alone

The diff asks one review question.

```js title="src/discounts.js"
// Change 1: formatting only, behavior preserved.
export function discount(order) {
  return order.customer.isVip || order.total > 500
    ? 0.1
    : 0;
}

// Change 2: behavior change only.
export function discount(order) {
  return order.customer.isVip ? 0.1 : 0;
}
```

## References

- [Ed Page: PR Style, “Split out refactors (C-SPLIT)”](https://epage.github.io/dev/pr-style/#c-split)
- [Tidy First?: Separate Tidying](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch16.html)
