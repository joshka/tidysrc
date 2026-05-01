---
title: >-
  Layer Language Leaks
status: draft
category: boundaries
topics:
  - contracts
  - translation
  - change-radius
summary: >-
  Database rows, API payloads, UI props, or framework objects become the shared language of
  unrelated layers.
relatedPatterns:
  - name-cross-layer-contracts
  - parse-dont-validate
  - cap-change-radius
relatedConcepts:
  - boundary-trust
  - change-radius
  - reader-locality
---

## Description

Database rows, API payloads, UI props, or framework objects become the shared language of unrelated
layers.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

A change in one layer forces distant code to change because the boundary never translated the shape.

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

## Signals

- Domain logic depends on database column names or HTTP payload fields.
- UI components receive persistence flags that should have been converted into view state.
- A storage migration changes application logic that does not own persistence.
- Mapping code exists, but it only copies fields without naming the contract change.

## Diagnostic Questions

- Which layer owns this field name and shape?
- What contract does the next layer need?
- Does mapping change meaning or only mirror fields?
- Would a named boundary type reduce future change radius?

## Approach

- Name the contract where data crosses layer language.
- Map persistence, transport, domain, and UI shapes only when the next layer needs a different
  contract.
- Keep raw external shape from leaking inward after the boundary has enough context to parse it.
- Avoid empty DTO churn that mirrors fields without changing meaning.

## Examples

### Problem: persistence language reaches the API

The response leaks database column names instead of naming the public contract.

```csharp title="Profiles/ProfileController.cs"
public object GetProfile(UserRow row)
{
    return new { row.display_name, row.full_name };
}
```

### Better: maps to an API contract

The API exposes the name it owns.

```csharp title="Profiles/ProfileController.cs"
public ProfileResponse GetProfile(UserRow row)
{
    return new ProfileResponse(DisplayName: row.DisplayName ?? row.FullName);
}
```

### Problem: domain logic depends on row language

The domain rule now knows persistence names.

```java title="src/main/java/example/ProfilePolicy.java"
boolean canShow(UserRow row) {
    return row.deleted_at() == null && row.display_name() != null;
}
```

### Better: converts before domain logic

The policy receives a domain value instead of a storage row.

```java title="src/main/java/example/ProfilePolicy.java"
boolean canShow(Profile profile) {
    return !profile.deleted() && profile.displayName().isPresent();
}
```

### Problem: API payload leaks inward

Business logic depends on external JSON field names.

```python title="profiles/policy.py"
def can_show_profile(payload):
    return payload.get("deleted_at") is None and payload.get("display_name")
```

### Better: boundary maps the payload

The policy receives local language.

```python title="profiles/policy.py"
def can_show_profile(profile):
    return not profile.deleted and bool(profile.display_name)
```

### Problem: wire fields reach domain code

The domain rule depends on serialized field names and optional wire shape.

```rust title="src/profile.rs"
pub fn can_show(row: UserRow) -> bool {
    row.deleted_at.is_none() && row.display_name.is_some()
}
```

### Better: maps into a domain contract

The domain rule receives a value with local meaning.

```rust title="src/profile.rs"
pub fn can_show(profile: &Profile) -> bool {
    !profile.is_deleted() && profile.display_name().is_some()
}
```

### Problem: Database language reaches the UI

The component now depends on storage names and persistence flags.

```ts title="src/profile/ProfileCard.tsx"
export function ProfileCard({ row }: { row: UserRow }) {
  return <h2>{row.display_name || row.full_name}</h2>;
}
```

### Better: The boundary names the view contract

The UI receives the language it needs, not the database shape.

```ts title="src/profile/ProfileCard.tsx"
export function ProfileCard({ profile }: { profile: ProfileView }) {
  return <h2>{profile.displayName}</h2>;
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
