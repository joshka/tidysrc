---
title: >-
  Time-dependent tests
status: draft
category: testing
topics:
  - time
  - flakiness
  - side-effects
summary: >-
  Tests sleep, wait, or depend on the wall clock because time is hidden inside the code under test.
relatedPatterns:
  - inject-time-and-randomness
  - make-side-effects-visible
  - smallest-trustworthy-verification
relatedConcepts:
  - temporal-coupling
  - side-effect-visibility
---

## Impact

The suite becomes slow and flaky, and failures are hard to diagnose. The test is checking scheduler
luck instead of the behavior that should change when time advances.

## Signals

- Tests call sleep or use wide timing tolerances.
- Business logic reads Date.now, Instant.now, time.Now, or random identifiers directly.
- Expiration, retry, or ordering behavior cannot be tested without waiting.
- A failure disappears when the timeout is increased.

## Diagnostic Questions

- What time value or random source is part of the behavior?
- Which boundary owns the policy that reads time?
- Can the test pass a fixed clock or generated id?
- Would a deterministic test catch the same regression without sleeping?

## Approach

- Pass time and randomness through the boundary that owns the policy.
- Use fixed clocks, deterministic id generators, or explicit instants in tests.
- Keep direct wall-clock access at edges that truly own scheduling.
- Avoid sleeps as verification unless the behavior being tested is the scheduler itself.

## Examples

### Problem: C# code depends on wall-clock time

The behavior can change depending on when the test runs.

```csharp title="Billing/Invoice.cs"
public bool IsOverdue() => DueAt < DateTimeOffset.UtcNow;
```

### Better: C# policy receives a clock value

The test can pass a fixed instant.

```csharp title="Billing/Invoice.cs"
public bool IsOverdue(DateTimeOffset now) => DueAt < now;
```

### Problem: Java logic reads the clock directly

Tests need sleeps or wide tolerances.

```java title="src/main/java/example/Invoice.java"
boolean isOverdue() {
    return dueAt.isBefore(Instant.now());
}
```

### Better: Java logic receives time explicitly

The behavior is deterministic in tests.

```java title="src/main/java/example/Invoice.java"
boolean isOverdue(Instant now) {
    return dueAt.isBefore(now);
}
```

### Problem: Python test waits for expiration

The test proves timing more than business behavior.

```python title="tests/test_sessions.py"
time.sleep(2)
assert session.is_expired()
```

### Better: Python test passes the instant

The same behavior is checked without sleeping.

```python title="tests/test_sessions.py"
now = session.created_at + timedelta(seconds=2)
assert session.is_expired(now)
```

### Problem: Rust code reads ambient time

The behavior cannot be tested without controlling the environment.

```rust title="src/session.rs"
pub fn is_expired(&self) -> bool {
    self.expires_at < Instant::now()
}
```

### Better: Rust code receives the clock value

The caller decides where ambient time enters.

```rust title="src/session.rs"
pub fn is_expired(&self, now: Instant) -> bool {
    self.expires_at < now
}
```

### Problem: TypeScript test waits for timers

The test has to wait for time to pass.

```ts title="src/session.test.ts"
await delay(1000);
expect(session.isExpired()).toBe(true);
```

### Better: TypeScript test passes fixed time

The test checks expiration policy directly.

```ts title="src/session.test.ts"
const now = addSeconds(session.createdAt, 1);
expect(session.isExpired(now)).toBe(true);
```
