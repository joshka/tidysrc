---
title: >-
  Data Migration Risk
status: draft
category: change-risk
topics:
  - data
  - compatibility
  - verification
summary: >-
  A schema or data-shape change alters stored meaning without clear compatibility, fallback, or
  verification.
relatedPatterns:
  - parse-dont-validate
  - characterize-before-changing
  - separate-structure-from-behavior
relatedConcepts:
  - boundary-trust
  - observable-behavior
  - change-radius
---

## Description

A schema or data-shape change alters stored meaning without clear compatibility, fallback, or
verification.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Data changes are hard to roll back and easy to under-test. The code may work for new records while

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

## Signals

- New code assumes every stored record already has the new shape.
- Migration, parser, and behavior changes land in one patch.
- Fallback behavior is implicit or differs by caller.
- Tests only use newly constructed records.

## Diagnostic Questions

- What old shapes can still exist when this code runs?
- Is the migration compatible with mixed versions or rollback?
- Which parser or boundary should normalize old and new data?
- What behavior proves old records still work?

## Approach

- Parse stored data at a boundary that can normalize old and new shapes.
- Separate migration mechanics from behavior changes when review would otherwise mix risks.
- Characterize behavior with representative old records before changing the shape.
- Return structured errors when incompatible data must be rejected.

## Examples

### Problem: code assumes migrated columns exist

Older rows can still exist during deploys, rollback, or background processing.

```csharp title="Users/ProfileReader.cs"
public string DisplayName(UserRow row)
{
    return row.DisplayName.Trim();
}
```

### Better: parser normalizes old and new rows

The compatibility rule is owned at the storage boundary.

```csharp title="Users/ProfileReader.cs"
public UserProfile ParseUser(UserRow row)
{
    return new UserProfile(
        row.Id,
        (row.DisplayName ?? row.FullName).Trim());
}
```

### Problem: code reads only the new field

The behavior works for newly constructed records but not for old stored data.

```java title="src/main/java/example/UserProfile.java"
String displayName(UserRow row) {
    return row.displayName().trim();
}
```

### Better: normalizes at the row boundary

Callers receive the current domain shape no matter which row version was stored.

```java title="src/main/java/example/UserProfile.java"
UserProfile parseUser(UserRow row) {
    var name = row.displayName() != null ? row.displayName() : row.fullName();
    return new UserProfile(row.id(), name.trim());
}
```

### Problem: assumes the new key is present

Records created before the migration fail at the behavior site.

```python title="users/profile.py"
def profile_name(row):
    return row["display_name"].strip()
```

### Better: normalizes stored shapes once

The parser accepts old and new records before the rest of the code uses them.

```python title="users/profile.py"
def parse_user(row):
    return {
        "id": row["id"],
        "display_name": (row.get("display_name") or row["full_name"]).strip(),
    }
```

### Problem: domain code unwraps new storage fields

The panic appears far from the migration boundary.

```rust title="src/users/profile.rs"
pub fn profile_name(row: UserRow) -> String {
    row.display_name.unwrap().trim().to_owned()
}
```

### Better: conversion owns compatibility

The conversion boundary returns a structured failure only when no compatible shape exists.

```rust title="src/users/profile.rs"
impl TryFrom<UserRow> for UserProfile {
    type Error = ProfileParseError;

    fn try_from(row: UserRow) -> Result<Self, Self::Error> {
        let display_name = row.display_name.or(row.full_name).ok_or(ProfileParseError::Name)?;
        Ok(UserProfile::new(row.id, display_name.trim()))
    }
}
```

### Problem: New code assumes only new records exist

Older rows without `display_name` fail after deployment or rollback.

```ts title="src/users/profile.ts"
export function profileName(row: UserRow): string {
  return row.display_name.trim();
}
```

### Better: The storage boundary normalizes old shapes

Callers receive the current domain shape while the parser owns compatibility.

```ts title="src/users/profile.ts"
export function parseUser(row: UserRow): User {
  return {
    id: row.id,
    displayName: row.display_name?.trim() || row.full_name.trim(),
  };
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
