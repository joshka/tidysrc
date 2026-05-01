---
title: >-
  Coupling
summary: >-
  The degree to which two pieces must change, run, or be understood together.
status: seed
tags:
  - "architecture"
  - "change-radius"
  - "review"
relatedPatterns:
  - "name-coupling"
  - "cap-change-radius"
  - "name-cross-layer-contracts"
---

## Why it matters

Coupling is a relationship, not an insult. The review question is whether that relationship helps
the code express the domain or accidentally makes unrelated changes move together.

Visible beneficial coupling is often better than hidden accidental coupling. A direct dependency can
be easier to understand than a vague abstraction that still requires coordinated change.

## How to apply it

Ask what would have to change if one side changed. If the answer is a surprising set of files,
protocols, tests, or timing assumptions, the coupling needs a name or a boundary.

## Examples

### Hidden coupling: caller knows storage field names

The UI has to change when the storage shape changes.

```ts title="src/profile/view-model.ts"
export function profileName(row: UserRow) {
  return `${row.first_name} ${row.last_name}`;
}
```

### Better: boundary names the relationship

The mapping boundary owns the storage-to-domain coupling.

```ts title="src/profile/user-profile.ts"
export function profileName(profile: UserProfile) {
  return profile.displayName;
}
```
