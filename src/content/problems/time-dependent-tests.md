---
title: >-
  Time-Dependent Tests
status: reviewed
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

## Description

Tests sleep, wait, or depend on the wall clock because time is hidden inside the code under test.

The business rule depends on time, timers, random identifiers, or scheduling, but the dependency is
read from ambient process state. Tests then wait for time to pass instead of passing the time value
the rule should evaluate.

Direct wall-clock access can belong at framework or scheduling edges. The problem is letting that
edge leak into ordinary business logic, where a fixed `now`, clock, timer, or id generator would
make the behavior deterministic.

## Why It Matters

The suite becomes slower, flakier, and harder to diagnose. A one-second sleep in one test looks
small until dozens of tests repeat it; a broad timeout hides timing races while making every run
take longer.

The test is checking scheduler behavior, machine load, and timing tolerance along with the business
rule. When it fails, reviewers cannot tell whether the expiration policy broke or the test simply
lost a race against the clock.

## Code Impact

Time-dependent tests usually point back to hidden inputs in production code. Expiration, retry,
ordering, and id-generation rules depend on values the function signature does not show.

That hidden dependency spreads sleeps, polling loops, broad tolerances, and test-only delays across
the suite. The code becomes harder to refactor because the real policy boundary is not visible.

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

- [Inject time and randomness](/patterns/inject-time-and-randomness/) through the boundary that owns
  the policy.
- Use fixed clocks, deterministic id generators, or explicit instants in tests.
- Keep direct wall-clock access at edges that truly own scheduling, and pass ordinary values inward
  when a full clock abstraction would be too much.
- [Make side effects visible](/patterns/make-side-effects-visible/) when time, timers, randomness,
  or scheduling changes review risk.
- Use the [smallest trustworthy verification](/patterns/smallest-trustworthy-verification/) that can
  fail the time-dependent behavior without waiting.
- Avoid sleeps as verification unless the behavior being tested is the scheduler itself.

## Examples

### Problem: code depends on wall-clock time

The behavior can change depending on when the test runs.

```csharp title="Billing/Invoice.cs"
public bool IsOverdue() => DueAt < DateTimeOffset.UtcNow;
```

### Better: policy receives a clock value

The test can pass a fixed instant. This applies
[Inject Time and Randomness](/patterns/inject-time-and-randomness/).

```csharp title="Billing/Invoice.cs"
public bool IsOverdue(DateTimeOffset now) => DueAt < now;
```

### Problem: logic reads the clock directly

Tests need sleeps or wide tolerances.

```java title="src/main/java/example/Invoice.java"
boolean isOverdue() {
    return dueAt.isBefore(Instant.now());
}
```

### Better: logic receives time explicitly

The behavior is deterministic in tests. This applies
[Inject Time and Randomness](/patterns/inject-time-and-randomness/).

```java title="src/main/java/example/Invoice.java"
boolean isOverdue(Instant now) {
    return dueAt.isBefore(now);
}
```

### Problem: test waits for expiration

The test proves timing more than business behavior.

```python title="tests/test_sessions.py"
time.sleep(2)
assert session.is_expired()
```

### Better: test passes the instant

The same behavior is checked without sleeping. This applies
[Inject Time and Randomness](/patterns/inject-time-and-randomness/).

```python title="tests/test_sessions.py"
now = session.created_at + timedelta(seconds=2)
assert session.is_expired(now)
```

### Problem: code reads ambient time

The behavior cannot be tested without controlling the environment.

```rust title="src/session.rs"
pub fn is_expired(&self) -> bool {
    self.expires_at < Instant::now()
}
```

### Better: code receives the clock value

The caller decides where ambient time enters. This applies
[Make Side Effects Visible](/patterns/make-side-effects-visible/).

```rust title="src/session.rs"
pub fn is_expired(&self, now: Instant) -> bool {
    self.expires_at < now
}
```

### Problem: test waits for timers

The test has to wait for time to pass.

```ts title="src/session.test.ts"
await delay(1000);
expect(session.isExpired()).toBe(true);
```

### Better: test passes fixed time

The test checks expiration policy directly. This applies
[Inject Time and Randomness](/patterns/inject-time-and-randomness/).

```ts title="src/session.test.ts"
const now = addSeconds(session.createdAt, 1);
expect(session.isExpired(now)).toBe(true);
```

### Problem: test sleeps for token expiry

The test waits for real time and gets slower as the timeout grows.

```c title="src/example.c"
sleep(2);
assert_true(session_is_expired(&session));
```

### Better: pass the checked time

The test checks expiration without waiting. This applies
[Inject Time and Randomness](/patterns/inject-time-and-randomness/).

```c title="src/example.c"
time_t now = session.created_at + 2;
assert_true(session_is_expired_at(&session, now));
```

### Problem: test relies on real timer expiry

The test can fail under load or slow the suite while waiting for the timer.

```cpp title="src/example.cpp"
std::this_thread::sleep_for(2s);
EXPECT_TRUE(session.is_expired());
```

### Better: inject the current instant

The expiration rule is deterministic. This applies
[Inject Time and Randomness](/patterns/inject-time-and-randomness/).

```cpp title="src/example.cpp"
auto now = session.created_at() + 2s;
EXPECT_TRUE(session.is_expired(now));
```

### Problem: test waits for deadline

The test burns wall-clock time to check a retry policy.

```go title="internal/example/service.go"
time.Sleep(2 * time.Second)
require.True(t, job.RetryDue())
```

### Better: pass a fixed clock value

The same policy is checked without slowing the suite. This applies
[Inject Time and Randomness](/patterns/inject-time-and-randomness/).

```go title="internal/example/service.go"
now := job.CreatedAt.Add(2 * time.Second)
require.True(t, job.RetryDue(now))
```

### Problem: test waits for timeout

The test uses real time to prove a timeout branch.

```js title="src/example.js"
await delay(1000);
expect(session.isExpired()).toBe(true);
```

### Better: pass deterministic time

The test checks the timeout rule directly. This applies
[Inject Time and Randomness](/patterns/inject-time-and-randomness/).

```js title="src/example.js"
const now = addSeconds(session.createdAt, 1);
expect(session.isExpired(now)).toBe(true);
```
