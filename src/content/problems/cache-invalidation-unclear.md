---
title: >-
  Cache invalidation unclear
status: draft
category: state
topics:
  - caching
  - temporal-coupling
  - correctness
summary: >-
  The code updates cached data without naming freshness rules, invalidation triggers, or stale-read
  behavior.
relatedPatterns:
  - make-state-transitions-explicit
  - parse-dont-validate
  - keep-async-boundaries-explicit
relatedConcepts:
  - temporal-coupling
  - state-space
  - observable-behavior
---

## Impact

Readers cannot tell whether stale data is acceptable, whether writes update the cache, or which path
owns invalidation. Bugs often appear as rare ordering problems rather than obvious logic errors.

## Signals

- A write path updates storage but not the cache, with no stated freshness contract.
- Several callers clear the same cache for different reasons.
- Tests assert current values without covering stale-read policy.
- A cache key is built from loose strings or partial request data.

## Diagnostic Questions

- What freshness guarantee does this caller need?
- Which operation owns invalidation?
- Can the cache key be represented as a parsed value?
- Is stale data a valid state or a failure?

## Approach

- Name the freshness policy and keep invalidation beside the write or transition that requires it.
- Represent cache keys as precise values when loose strings cause drift.
- Test the observable stale-read behavior at the boundary callers use.
- Keep background refreshes and async invalidation explicit.

## Examples

### Problem: C# write path returns stale cached data

The repository updates storage, but the cache policy is invisible at the mutation site.

```csharp title="Users/ProfileService.cs"
public async Task<UserProfile> UpdateProfile(Guid userId, ProfilePatch patch)
{
    await users.UpdateProfile(userId, patch);
    return await cache.Get<UserProfile>($"user:{userId}");
}
```

### Better: C# write path owns the cache key

The mutation removes the stale entry before returning the current profile.

```csharp title="Users/ProfileService.cs"
public async Task<UserProfile> UpdateProfile(Guid userId, ProfilePatch patch)
{
    await users.UpdateProfile(userId, patch);
    await cache.Remove(ProfileCacheKey.ForUser(userId));
    return await users.GetProfile(userId);
}
```

### Problem: Java clears cache from distant callers

The caller has to remember which cache entry the write makes stale.

```java title="src/main/java/example/ProfileController.java"
void updateProfile(UserId userId, ProfilePatch patch) {
    profiles.update(userId, patch);
    cache.invalidate("user:" + userId.value());
}
```

### Better: Java service owns invalidation

The write boundary owns both the storage update and the freshness rule.

```java title="src/main/java/example/ProfileService.java"
void updateProfile(UserId userId, ProfilePatch patch) {
    repository.update(userId, patch);
    cache.invalidate(ProfileCacheKey.forUser(userId));
}
```

### Problem: The write path forgets freshness

The profile changes, but the cache contract is invisible at the mutation site.

```python title="users/profile.py"
def update_profile(user_id, changes, db, cache):
    db.update_user(user_id, changes)
    return cache.get(f"user:{user_id}")
```

### Better: The write path owns invalidation

The mutation names the cache key and removes stale data before callers can read it.

```python title="users/profile.py"
def update_profile(user_id, changes, db, cache):
    db.update_user(user_id, changes)
    cache.delete(UserCacheKey.profile(user_id))
    return db.get_user(user_id)
```

### Problem: Rust cache keys drift as strings

The caller can update storage and cache with different key shapes.

```rust title="src/profile.rs"
pub fn update_profile(user_id: UserId, patch: ProfilePatch, db: &Db, cache: &Cache) {
    db.update_user(user_id, patch);
    cache.delete(&format!("profile:{user_id}"));
}
```

### Better: Rust cache keys are named values

The cache boundary receives one parsed key type instead of loose strings.

```rust title="src/profile.rs"
pub fn update_profile(user_id: UserId, patch: ProfilePatch, db: &Db, cache: &Cache) {
    db.update_user(user_id, patch);
    cache.delete(ProfileCacheKey::for_user(user_id));
}
```

### Problem: TypeScript mutation leaves query data stale

The API update succeeds, but the local query cache still serves the old profile.

```ts title="src/profile/updateProfile.ts"
export async function updateProfile(userId: string, patch: ProfilePatch) {
  await api.patch(`/users/${userId}`, patch);
  return queryClient.getQueryData(['user', userId]);
}
```

### Better: TypeScript mutation names the stale query

The mutation invalidates the observable read path before callers rely on it.

```ts title="src/profile/updateProfile.ts"
export async function updateProfile(userId: UserId, patch: ProfilePatch) {
  await api.patch(`/users/${userId.value}`, patch);
  await queryClient.invalidateQueries({ queryKey: profileKey(userId) });
  return queryClient.fetchQuery({ queryKey: profileKey(userId) });
}
```
