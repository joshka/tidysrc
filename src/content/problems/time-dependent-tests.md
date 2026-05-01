---
title: >-
  Time-Dependent Tests
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

## Description

Tests sleep, wait, or depend on the wall clock because time is hidden inside the code under test.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

The suite becomes slow and flaky, and failures are hard to diagnose. The test is checking scheduler

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

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

### Problem: code depends on wall-clock time

The behavior can change depending on when the test runs.

```csharp title="Billing/Invoice.cs"
public bool IsOverdue() => DueAt < DateTimeOffset.UtcNow;
```

### Better: policy receives a clock value

The test can pass a fixed instant.

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

The behavior is deterministic in tests.

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

The same behavior is checked without sleeping.

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

The caller decides where ambient time enters.

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

The test checks expiration policy directly.

```ts title="src/session.test.ts"
const now = addSeconds(session.createdAt, 1);
expect(session.isExpired(now)).toBe(true);
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
