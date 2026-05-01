---
title: >-
  Naming Drift
status: reviewed
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

Names are often accurate when they are written and misleading after the code changes around them.
A helper called `is_vip`, `has_flag`, or `is_active` can keep compiling after the rule becomes
loyalty eligibility, paid access, or account readiness.

That drift matters because names are the first model readers use. When a name describes old
behavior, the reader has to inspect the implementation before trusting every call site, test name,
and error message that repeats it.

## Why It Matters

Stale names make review slower and less reliable. The code may be correct, but the vocabulary sends
reviewers toward the wrong mental model, so they spend time reconciling the name with the behavior
instead of reviewing the change.

The cost grows when the stale name spreads into tests and callers. A future maintainer may update
the implementation while preserving the old word, or update a caller based on the name and quietly
break the actual rule.

## Code Impact

Naming drift leaves old domain language attached to current behavior. Predicates become too broad,
helpers describe storage mechanics instead of meaning, and tests assert outdated concepts even when
the assertions still pass.

Once the wrong vocabulary reaches several files, a small behavior change turns into a terminology
audit. The code has to be checked for both the old name and the current rule before the reviewer can
tell what will actually change.

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

- [Keep names current](/patterns/keep-name-current/) before changing behavior when the rename is
  behavior-preserving.
- Use an [explaining variable](/patterns/explaining-variable/) for local decisions instead of a
  generic condition name.
- Keep terminology consistent across tests, examples, and user-facing errors when they describe the
  same contract.
- [Separate structure from behavior](/patterns/separate-structure-from-behavior/) when a rename is
  adjacent to a behavior change.
- Improve [reader locality](/patterns/reader-locality/) by keeping the name near the rule it
  explains.

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

The reviewer can discuss eligibility without remembering the old implementation. This applies
[Keep Names Current](/patterns/keep-name-current/).

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

The name carries the rule's role at the call site. This applies
[Keep Names Current](/patterns/keep-name-current/).

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

Tests and callers can use the same vocabulary. This applies
[Keep Names Current](/patterns/keep-name-current/).

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

The predicate says what future branches are deciding. This applies
[Keep Names Current](/patterns/keep-name-current/).

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

The call site can talk about the actual domain decision. This applies
[Keep Names Current](/patterns/keep-name-current/).

```typescript title="src/billing/discounts.ts"
export function isEligibleForLoyaltyDiscount(customer: Customer) {
  return customer.tier === 'gold' && customer.accountAgeDays > 365;
}
```

### Problem: name hides the access rule

The name says active account, but the rule is really current paid access.

```c title="src/example.c"
bool account_is_active(const Account *account, Date today) {
    return account->paid_until >= today && account->closed_at == NULL;
}
```

### Better: name says the domain fact

The caller can read the access decision without inspecting the predicate body. This applies
[Keep Names Current](/patterns/keep-name-current/).

```c title="src/example.c"
bool account_has_current_paid_access(const Account *account, Date today) {
    return account->paid_until >= today && account->closed_at == NULL;
}
```

### Problem: method name preserves storage vocabulary

The method name says flag, but the behavior is a loyalty discount decision.

```cpp title="src/example.cpp"
bool Customer::has_flag() const {
    return tier_ == Tier::Gold && account_age_days_ > 365;
}
```

### Better: method name says what callers need

The method names the decision at the call site. This applies
[Keep Names Current](/patterns/keep-name-current/).

```cpp title="src/example.cpp"
bool Customer::qualifies_for_loyalty_discount() const {
    return tier_ == Tier::Gold && account_age_days_ > 365;
}
```

### Problem: exported name stays too broad

`IsReady` is broad enough to mean several things, but this rule is only about starting a paid trial.

```go title="internal/example/service.go"
func IsReady(account Account) bool {
    return account.EmailVerified && account.PaymentMethodID != ""
}
```

### Better: exported name names the decision

Callers can now tell which kind of readiness the helper describes. This applies
[Keep Names Current](/patterns/keep-name-current/).

```go title="internal/example/service.go"
func CanStartPaidTrial(account Account) bool {
    return account.EmailVerified && account.PaymentMethodID != ""
}
```

### Problem: validation name is too vague

`isValid` hides the user action this rule gates.

```js title="src/example.js"
export function isValid(user) {
  return Boolean(user.email) && user.acceptedTerms && !user.deletedAt;
}
```

### Better: name matches the UI decision

The name gives the React component a readable branch. This applies
[Keep Names Current](/patterns/keep-name-current/).

```js title="src/example.js"
export function canCreateWorkspace(user) {
  return Boolean(user.email) && user.acceptedTerms && !user.deletedAt;
}
```
