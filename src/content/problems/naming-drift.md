---
title: >-
  Naming drift
status: draft
category: readability
topics:
  - naming
  - domain-language
  - review
summary: >-
  Names keep their old words after behavior, ownership, or domain meaning changes.
relatedPatterns:
  - keep-name-current
  - explaining-variable
  - separate-structure-from-behavior
  - reader-locality
relatedConcepts:
  - reader-locality
  - structure-vs-behavior
  - cognitive-burden
---

## Impact

Stale names mislead readers and agents. The code compiles, but every review requires reconciling
what the name claims with what the implementation actually does.

## Signals

- A helper name describes an old implementation instead of its current domain role.
- Two names refer to the same concept with slightly different wording.
- A variable called active, valid, enabled, or ready carries a narrower rule than its name suggests.
- Tests repeat stale vocabulary and hide the new behavior.

## Diagnostic Questions

- What domain fact should this name communicate now?
- Does the name describe mechanics or meaning?
- Are there nearby names for the same concept?
- Would renaming be a structure-only change or part of a behavior change?

## Approach

- Rename to the current domain fact before changing behavior when the rename is behavior-preserving.
- Use explaining variables for local decisions instead of generic condition names.
- Keep terminology consistent across tests, examples, and user-facing errors when they describe the
  same contract.
- Avoid broad vocabulary rewrites while a behavior change is in progress.

## Examples

### Problem: C# name preserves an old implementation

The helper now checks eligibility, but the name still talks about the old role flag.

```csharp title="Billing/Discounts.cs"
bool IsVip(Customer customer)
{
    return customer.Tier == Tier.Gold && customer.AccountAge.TotalDays > 365;
}
```

### Better: C# name says the current domain fact

The reviewer can discuss eligibility without remembering the old implementation.

```csharp title="Billing/Discounts.cs"
bool IsEligibleForLoyaltyDiscount(Customer customer)
{
    return customer.Tier == Tier.Gold && customer.AccountAge.TotalDays > 365;
}
```

### Problem: Java name describes mechanics

The method name says how the value used to be stored, not what it means.

```java title="src/main/java/example/AccountRules.java"
boolean hasFlag(Account account) {
    return account.tier() == Tier.GOLD && account.ageInDays() > 365;
}
```

### Better: Java name describes domain meaning

The name carries the rule's role at the call site.

```java title="src/main/java/example/AccountRules.java"
boolean qualifiesForLoyaltyDiscount(Account account) {
    return account.tier() == Tier.GOLD && account.ageInDays() > 365;
}
```

### Problem: Python name keeps stale vocabulary

The rule no longer means only VIP status.

```python title="billing/discounts.py"
def is_vip(customer):
    return customer.tier == "gold" and customer.account_age.days > 365
```

### Better: Python name follows current behavior

Tests and callers can use the same vocabulary.

```python title="billing/discounts.py"
def is_eligible_for_loyalty_discount(customer):
    return customer.tier == "gold" and customer.account_age.days > 365
```

### Problem: Rust name hides the domain decision

The predicate name is too broad for the rule it carries.

```rust title="src/billing.rs"
pub fn is_active(customer: &Customer) -> bool {
    customer.tier == Tier::Gold && customer.account_age_days > 365
}
```

### Better: Rust name narrows the meaning

The predicate says what future branches are deciding.

```rust title="src/billing.rs"
pub fn qualifies_for_loyalty_discount(customer: &Customer) -> bool {
    customer.tier == Tier::Gold && customer.account_age_days > 365
}
```

### Problem: TypeScript name keeps old terminology

The name says VIP, but the rule now includes account age.

```ts title="src/billing/discounts.ts"
export function isVip(customer: Customer) {
  return customer.tier === 'gold' && customer.accountAgeDays > 365;
}
```

### Better: TypeScript name matches the rule

The call site can talk about the actual domain decision.

```ts title="src/billing/discounts.ts"
export function isEligibleForLoyaltyDiscount(customer: Customer) {
  return customer.tier === 'gold' && customer.accountAgeDays > 365;
}
```
