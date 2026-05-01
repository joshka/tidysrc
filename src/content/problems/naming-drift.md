---
title: >-
  Naming Drift
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

## Description

Names keep their old words after behavior, ownership, or domain meaning changes.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Stale names mislead readers and agents. The code compiles, but every review requires reconciling

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

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

### Problem: name preserves an old implementation

The helper now checks eligibility, but the name still talks about the old role flag.

```csharp title="Billing/Discounts.cs"
bool IsVip(Customer customer)
{
    return customer.Tier == Tier.Gold && customer.AccountAge.TotalDays > 365;
}
```

### Better: name says the current domain fact

The reviewer can discuss eligibility without remembering the old implementation.

```csharp title="Billing/Discounts.cs"
bool IsEligibleForLoyaltyDiscount(Customer customer)
{
    return customer.Tier == Tier.Gold && customer.AccountAge.TotalDays > 365;
}
```

### Problem: name describes mechanics

The method name says how the value used to be stored, not what it means.

```java title="src/main/java/example/AccountRules.java"
boolean hasFlag(Account account) {
    return account.tier() == Tier.GOLD && account.ageInDays() > 365;
}
```

### Better: name describes domain meaning

The name carries the rule's role at the call site.

```java title="src/main/java/example/AccountRules.java"
boolean qualifiesForLoyaltyDiscount(Account account) {
    return account.tier() == Tier.GOLD && account.ageInDays() > 365;
}
```

### Problem: name keeps stale vocabulary

The rule no longer means only VIP status.

```python title="billing/discounts.py"
def is_vip(customer):
    return customer.tier == "gold" and customer.account_age.days > 365
```

### Better: name follows current behavior

Tests and callers can use the same vocabulary.

```python title="billing/discounts.py"
def is_eligible_for_loyalty_discount(customer):
    return customer.tier == "gold" and customer.account_age.days > 365
```

### Problem: name hides the domain decision

The predicate name is too broad for the rule it carries.

```rust title="src/billing.rs"
pub fn is_active(customer: &Customer) -> bool {
    customer.tier == Tier::Gold && customer.account_age_days > 365
}
```

### Better: name narrows the meaning

The predicate says what future branches are deciding.

```rust title="src/billing.rs"
pub fn qualifies_for_loyalty_discount(customer: &Customer) -> bool {
    customer.tier == Tier::Gold && customer.account_age_days > 365
}
```

### Problem: name keeps old terminology

The name says VIP, but the rule now includes account age.

```ts title="src/billing/discounts.ts"
export function isVip(customer: Customer) {
  return customer.tier === 'gold' && customer.accountAgeDays > 365;
}
```

### Better: name matches the rule

The call site can talk about the actual domain decision.

```ts title="src/billing/discounts.ts"
export function isEligibleForLoyaltyDiscount(customer: Customer) {
  return customer.tier === 'gold' && customer.accountAgeDays > 365;
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
