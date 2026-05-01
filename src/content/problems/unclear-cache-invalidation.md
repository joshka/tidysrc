---
title: >-
  Unclear Cache Invalidation
status: seed
category: state
topics:
  - caching
  - temporal-coupling
  - correctness
summary: >-
  The code updates cached data without naming freshness rules, invalidation triggers, or stale-read
  behavior.
relatedPatterns:
  - make-cache-ownership-explicit
  - make-state-transitions-explicit
  - parse-dont-validate
  - keep-async-boundaries-explicit
relatedConcepts:
  - temporal-coupling
  - state-space
  - observable-behavior
---

## Description

Unclear cache invalidation appears when a write changes source data but the cache effect is left for
callers to infer. The code may refresh, delete, ignore, or asynchronously rebuild cached data, but
the ownership of that freshness policy is not visible at the mutation boundary.

The problem is not that every cache must be perfectly fresh. Some caches intentionally tolerate
stale reads. The problem is that the reader cannot tell which stale states are allowed, which writes
make cached values invalid, or which operation owns the invalidation path.

## Why It Matters

Reviewers have to reconstruct ordering from scattered reads, writes, cache keys, background jobs,
and tests. A missed invalidation often survives ordinary review because each local line looks
reasonable: the write updates storage, the read uses a cache, and the stale value only appears after
a particular sequence.

This raises [cognitive burden](/concepts/cognitive-burden/) because every cache read carries hidden
questions about freshness and [observable behavior](/concepts/observable-behavior/). A reviewer
cannot judge whether stale data is a bug unless the code names the allowed stale-read policy.

## Code Impact

Unclear invalidation creates [temporal coupling](/concepts/temporal-coupling/): callers must
remember that storage writes, cache keys, refresh jobs, and read-after-write behavior belong
together. Cache keys also drift when they are loose strings or partial request objects, so one path
can invalidate `user:42` while another reads `profile:42`.

Tests tend to assert fresh values without covering the stale-read policy. That leaves the code with
passing tests for the common path and no executable contract for the ordering path that actually
breaks.

## Signals

- A write path updates storage but not the cache, with no stated freshness contract.
- Several callers clear the same cache for different reasons.
- Tests assert current values without covering stale-read policy.
- A cache key is built from loose strings or partial request data.
- Background refresh or async invalidation exists, but callers cannot see when stale reads are
  allowed.

## Diagnostic Questions

- What freshness guarantee does this caller need?
- Which operation owns invalidation?
- Is stale data a valid state or a failure?
- Which cache key does this write make stale?
- Can the cache key be represented as a parsed value?
- Does async invalidation need a visible done signal or retry path?

## Approach

- [Make cache ownership explicit](/patterns/make-cache-ownership-explicit/) by naming the boundary
  that owns freshness, invalidation, and stale-read behavior.
- Represent cache keys as precise values when loose strings cause drift.
- Keep invalidation beside the write or [state transition](/patterns/make-state-transitions-explicit/)
  that makes cached data stale.
- Test the [observable stale-read behavior](/concepts/observable-behavior/) at the boundary callers
  use.
- Keep background refreshes and [async boundaries](/patterns/keep-async-boundaries-explicit/)
  explicit when invalidation is queued or delayed.

## Examples

### Problem: write path returns stale cached data

The repository updates storage, but the cache policy is invisible at the mutation site.

```csharp title="Users/ProfileService.cs"
public async Task<UserProfile> UpdateProfile(Guid userId, ProfilePatch patch)
{
    await users.UpdateProfile(userId, patch);
    return await cache.Get<UserProfile>($"user:{userId}");
}
```

### Better: write path owns the cache key

The mutation [makes cache ownership explicit](/patterns/make-cache-ownership-explicit/) by removing
the stale entry before returning the current profile.

```csharp title="Users/ProfileService.cs"
public async Task<UserProfile> UpdateProfile(Guid userId, ProfilePatch patch)
{
    await users.UpdateProfile(userId, patch);
    await cache.Remove(ProfileCacheKey.ForUser(userId));
    return await users.GetProfile(userId);
}
```

### Problem: manual keys drift between write and read

The save path and read path build cache keys with different prefixes, so invalidation can miss the
entry readers use.

```c title="src/profile_cache.c"
void update_profile(UserId user_id, const ProfilePatch *patch) {
    db_update_profile(user_id, patch);

    char key[64];
    snprintf(key, sizeof key, "user:%lld", user_id.value);
    cache_delete(key);
}
```

### Better: key builder owns the cache shape

The write path uses one typed key builder, so storage updates and cache invalidation agree on the
same cache entry.

```c title="src/profile_cache.c"
void update_profile(UserId user_id, const ProfilePatch *patch) {
    db_update_profile(user_id, patch);

    ProfileCacheKey key = profile_cache_key_for_user(user_id);
    cache_delete_profile(key);
}
```

### Problem: invalidation is split from the mutation

The write succeeds in the repository, but a controller has to remember which cache entry that write
makes stale.

```cpp title="src/profile_controller.cpp"
void update_profile(UserId user_id, const ProfilePatch& patch) {
    profiles.update(user_id, patch);
    cache.invalidate("profile:" + user_id.to_string());
}
```

### Better: cache owner handles the mutation boundary

The service owns the storage write and invalidation together, so callers cannot update the profile
without naming the freshness rule.

```cpp title="src/profile_service.cpp"
void ProfileService::update_profile(UserId user_id, const ProfilePatch& patch) {
    repository.update(user_id, patch);
    cache.invalidate(ProfileCacheKey::for_user(user_id));
}
```

### Problem: caller clears cache from a distant layer

The caller has to remember which cache entry the write makes stale.

```java title="src/main/java/example/ProfileController.java"
void updateProfile(UserId userId, ProfilePatch patch) {
    profiles.update(userId, patch);
    cache.invalidate("user:" + userId.value());
}
```

### Better: service owns invalidation

The write boundary owns both the storage update and the freshness rule.

```java title="src/main/java/example/ProfileService.java"
void updateProfile(UserId userId, ProfilePatch patch) {
    repository.update(userId, patch);
    cache.invalidate(ProfileCacheKey.forUser(userId));
}
```

### Problem: mutation returns stale query data

The API update succeeds, but the local query cache still serves the old profile.

```js title="src/profile/updateProfile.js"
export async function updateProfile(userId, patch, queryClient) {
  await api.patch(`/users/${userId}`, patch);
  return queryClient.getQueryData(['user', userId]);
}
```

### Better: mutation invalidates before reading

The mutation invalidates the observable read path before callers rely on it.

```js title="src/profile/updateProfile.js"
export async function updateProfile(userId, patch, queryClient) {
  await api.patch(`/users/${userId}`, patch);
  const queryKey = profileKey(userId);
  await queryClient.invalidateQueries({ queryKey });
  return queryClient.fetchQuery({ queryKey });
}
```

### Problem: write path forgets freshness

The profile changes, but the cache contract is invisible at the mutation site.

```python title="users/profile.py"
def update_profile(user_id, changes, db, cache):
    db.update_user(user_id, changes)
    return cache.get(f"user:{user_id}")
```

### Better: write path owns invalidation

The mutation names the cache key and removes stale data before callers can read it.

```python title="users/profile.py"
def update_profile(user_id, changes, db, cache):
    db.update_user(user_id, changes)
    cache.delete(UserCacheKey.profile(user_id))
    return db.get_user(user_id)
```

### Problem: storage update leaves stale derived state

The write path changes the user record, but the in-memory profile cache still points at the old
derived value.

```go title="internal/profile/service.go"
func (s *Service) UpdateProfile(
    ctx context.Context,
    id UserID,
    patch ProfilePatch,
) (*Profile, error) {
    if err := s.users.Update(ctx, id, patch); err != nil {
        return nil, err
    }
    return s.profileCache.Get(ctx, id)
}
```

### Better: mutation owns the stale-read contract

The service invalidates the typed key before reading through the normal boundary again.

```go title="internal/profile/service.go"
func (s *Service) UpdateProfile(
    ctx context.Context,
    id UserID,
    patch ProfilePatch,
) (*Profile, error) {
    if err := s.users.Update(ctx, id, patch); err != nil {
        return nil, err
    }
    s.profileCache.Delete(ProfileCacheKeyForUser(id))
    return s.users.Profile(ctx, id)
}
```

### Problem: cache keys drift as strings

The caller can update storage and cache with different key shapes.

```rust title="src/profile.rs"
pub fn update_profile(user_id: UserId, patch: ProfilePatch, db: &Db, cache: &Cache) {
    db.update_user(user_id, patch);
    cache.delete(&format!("profile:{user_id}"));
}
```

### Better: cache keys are named values

The cache boundary receives one parsed key type instead of loose strings.

```rust title="src/profile.rs"
pub fn update_profile(user_id: UserId, patch: ProfilePatch, db: &Db, cache: &Cache) {
    db.update_user(user_id, patch);
    cache.delete(ProfileCacheKey::for_user(user_id));
}
```

### Problem: mutation leaves query data stale

The API update succeeds, but the local query cache still serves the old profile.

```ts title="src/profile/updateProfile.ts"
export async function updateProfile(userId: string, patch: ProfilePatch) {
  await api.patch(`/users/${userId}`, patch);
  return queryClient.getQueryData(['user', userId]);
}
```

### Better: typed mutation names the stale query

The mutation invalidates the observable read path before callers rely on it.

```ts title="src/profile/updateProfile.ts"
export async function updateProfile(userId: UserId, patch: ProfilePatch) {
  await api.patch(`/users/${userId.value}`, patch);
  await queryClient.invalidateQueries({ queryKey: profileKey(userId) });
  return queryClient.fetchQuery({ queryKey: profileKey(userId) });
}
```
