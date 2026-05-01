---
title: >-
  Make Side Effects Visible
summary: >-
  Keep mutation, external calls, time, and background work obvious at the point where a reader evaluates
  behavior.
status: draft
tags:
  - "correctness"
  - "readability"
  - "side-effects"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "c"
  - "cpp"
  - "csharp"
  - "go"
  - "java"
  - "js"
  - "python"
  - "rust"
  - "ts"
problems:
  - "A call that looks like a calculation also mutates state, touches external systems, or depends on ambient time."
concepts:
  - "side-effect-visibility"
  - "cognitive-burden"
related:
  - "chunk-statements"
  - "smallest-trustworthy-verification"
  - "reader-locality"
---

## Core Idea

Hidden side effects make code look easier to reason about than it is. A function that reads like a
pure calculation but writes state, sends events, mutates arguments, or reads time forces the reader
to distrust every call. Make the effect visible in the name, return type, boundary, or surrounding
statement shape.

Reach for this pattern when a reader cannot tell whether a call mutates input, writes global state,
sends a message, reads the clock, or touches storage.

The main tradeoff is that some frameworks hide effects behind callbacks or lifecycle hooks; follow
the local idiom but keep the hook name and boundary clear.

## Use When

- A reader cannot tell whether a call mutates input, writes global state, sends a message, reads the
  clock, or touches storage.
- A review depends on knowing when an external call happens, but that call is buried inside a helper
  or expression.
- Tests need awkward setup because behavior depends on ambient process state instead of explicit
  inputs.

## Guidance

- Move side effects into their own statement or named boundary so the reader can see when the world
  changes.
- Name effectful functions with verbs that reveal the effect, such as save, publish, refresh,
  persist, lock, or notify.
- Pass clocks, random sources, clients, or stores explicitly when ambient access hides a behavior
  dependency.

## Tradeoffs

- Some frameworks hide effects behind callbacks or lifecycle hooks; follow the local idiom but keep
  the hook name and boundary clear.
- Do not split every tiny assignment into ceremonial wrappers; the goal is to reveal behavior that
  changes review risk.
- Rust ownership can make mutation visible through signatures, while JavaScript and Go often need
  naming and statement structure to carry the same signal.

## Agent Instruction

When a change adds mutation, time, randomness, background work, or external calls, make the effect
visible in the name, boundary, or statement shape. Do not hide it inside a pure-looking helper.

## Examples

### Name the effectful boundary

The write is visible in the function name and isolated after the decision, so the reader can
separate calculation from persistence.

```ts title="src/session.ts"
export async function refreshSession(session: Session, store: SessionStore) {
  const refreshed = session.extend(clock.now());

  await store.saveSession(refreshed);

  return refreshed;
}
```

### Rust return value exposes mutation

The mutable receiver and returned status make the cache update visible at the call boundary.

```rust title="src/cache.rs"
pub fn refresh_entry(&mut self, key: CacheKey, value: Value) -> RefreshStatus {
    let replaced = self.entries.insert(key, value).is_some();

    RefreshStatus { replaced }
}
```

### Go separates calculation from publish

The event publish is not hidden inside CompleteOrder, so retry and failure behavior are reviewable.

```go title="internal/orders/complete.go"
order := CompleteOrder(command, clock.Now())

if err := repository.Save(ctx, order); err != nil {
    return err
}

return events.Publish(ctx, OrderCompleted{ID: order.ID})
```

### C# names the write

The method name tells the caller that state is persisted, not merely calculated.

```csharp title="PatternRepository.cs"
public Task SavePatternAsync(Pattern pattern)
{
    return database.Patterns.UpsertAsync(pattern);
}
```

### Java separates calculation from publish

The publish call is visible after the new state is computed.

```java title="PatternPublisher.java"
var published = pattern.publish(clock.instant());

repository.save(published);
events.publish(new PatternPublished(published.slug()));
```

### Python marks the external call

The email send is not hidden inside a formatting helper.

```python title="notifications.py"
message = render_review_message(pattern)

email_gateway.send(author.email, message)
```

## References

- None yet.

### Low-level boundary names the rule

The caller delegates the rule to a named boundary instead of repeating mechanics inline.

```c title="src/example.c"
if (approval_policy_can_approve(policy, user, request)) {
    approve_request(request);
}
```

### Object boundary names the rule

The object caller asks a boundary that owns the rule.

```cpp title="src/example.cpp"
if (approval_policy.can_approve(user, request)) {
    approvals.approve(request);
}
```

### Client boundary names the rule

The client code uses a named boundary instead of rebuilding the rule.

```js title="src/example.js"
if (approvalPolicy.canApprove(user, request)) {
  approve(request);
}
```
