---
title: >-
  Layer language leaks
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

## Impact

A change in one layer forces distant code to change because the boundary never translated the shape.
Readers must understand storage, transport, and UI details to review domain behavior.

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

### Problem: C# persistence language reaches the API

The response leaks database column names instead of naming the public contract.

```csharp title="Profiles/ProfileController.cs"
public object GetProfile(UserRow row)
{
    return new { row.display_name, row.full_name };
}
```

### Better: C# maps to an API contract

The API exposes the name it owns.

```csharp title="Profiles/ProfileController.cs"
public ProfileResponse GetProfile(UserRow row)
{
    return new ProfileResponse(DisplayName: row.DisplayName ?? row.FullName);
}
```

### Problem: Java domain logic depends on row language

The domain rule now knows persistence names.

```java title="src/main/java/example/ProfilePolicy.java"
boolean canShow(UserRow row) {
    return row.deleted_at() == null && row.display_name() != null;
}
```

### Better: Java converts before domain logic

The policy receives a domain value instead of a storage row.

```java title="src/main/java/example/ProfilePolicy.java"
boolean canShow(Profile profile) {
    return !profile.deleted() && profile.displayName().isPresent();
}
```

### Problem: Python API payload leaks inward

Business logic depends on external JSON field names.

```python title="profiles/policy.py"
def can_show_profile(payload):
    return payload.get("deleted_at") is None and payload.get("display_name")
```

### Better: Python boundary maps the payload

The policy receives local language.

```python title="profiles/policy.py"
def can_show_profile(profile):
    return not profile.deleted and bool(profile.display_name)
```

### Problem: Rust wire fields reach domain code

The domain rule depends on serialized field names and optional wire shape.

```rust title="src/profile.rs"
pub fn can_show(row: UserRow) -> bool {
    row.deleted_at.is_none() && row.display_name.is_some()
}
```

### Better: Rust maps into a domain contract

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
