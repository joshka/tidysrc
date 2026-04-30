---
title: >-
  Inject Time and Randomness
summary: >-
  Pass clocks, timers, and random sources through boundaries when ambient access makes behavior
  hard to test.
status: draft
tags:
  - "testing"
  - "determinism"
  - "side-effects"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "csharp"
  - "go"
  - "java"
  - "python"
  - "rust"
  - "ts"
problems:
  - "Tests are flaky or awkward because code reads ambient time, timers, or randomness inside business logic."
concepts:
  - "side-effect-visibility"
  - "temporal-coupling"
related:
  - "make-side-effects-visible"
  - "observable-behavior-tests"
---

## Core Idea

Time and randomness are inputs even when the code reads them from globals. Hiding them makes tests
flaky, makes retries hard to reason about, and makes behavior depend on process state. Pass them
explicitly at the boundary that owns the policy.

Reach for this pattern when business logic calls system time, sleeps, timers, UUID generation, or
random number generators directly.

The main tradeoff is that do not thread a clock through every function when only one boundary needs
the current instant.

## Use When

- Business logic calls system time, sleeps, timers, UUID generation, or random number generators
  directly.
- Tests need waits, sleeps, or broad timing tolerances to pass.
- Retry, expiration, scheduling, or ordering behavior depends on time policy that should be visible.

## Guidance

- Pass a clock, random source, or id generator into the boundary that owns the time-dependent
  decision.
- Keep framework-level time access at the edge and pass ordinary values inward when a full clock
  abstraction would be unnecessary.
- Write tests with fixed clocks or deterministic generators to protect the behavior without
  sleeping.

## Tradeoffs

- Do not thread a clock through every function when only one boundary needs the current instant.
- Very low-level performance code may need direct time reads; isolate the effect and benchmark the
  real path.
- Go and Java commonly use interfaces for clocks; Rust can pass traits or concrete test clocks
  depending on ownership needs.

## Agent Instruction

If business behavior depends on time or randomness, make that dependency explicit at the boundary
and test with deterministic inputs. Do not add sleeps as verification.

## Examples

### Go expiration check takes a clock

Tests can pass a fixed clock instead of sleeping until a token expires.

```go title="session.go"
func (s Session) IsExpired(clock Clock) bool {
    return !clock.Now().Before(s.ExpiresAt)
}
```

### Java constructor receives the generated id

The service owns id generation policy, while Order construction stays deterministic.

```java title="OrderService.java"
var orderId = idGenerator.nextOrderId();
var order = Order.create(orderId, request.items());
```

### Rust fixed clock makes expiry deterministic

The test passes the instant directly, so expiration behavior does not depend on wall-clock timing.

```rust title="src/session.rs"
pub fn is_expired(&self, now: Instant) -> bool {
    now >= self.expires_at
}
```

### C# passes the clock into policy

The test can pass a fixed clock without waiting.

```csharp title="Session.cs"
public bool IsExpired(TimeProvider clock)
{
    return clock.GetUtcNow() >= ExpiresAt;
}
```

### Python passes the current time

The expiration check is deterministic because now is an input.

```python title="session.py"
def is_expired(session, now):
    return now >= session.expires_at
```

### TypeScript injects the id generator

Order construction is deterministic in tests while the boundary owns id generation.

```ts title="src/orders.ts"
export function createOrder(request: OrderRequest, ids: IdGenerator) {
  return new Order(ids.next(), request.items);
}
```

## References

- None yet.
