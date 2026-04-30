---
title: >-
  Concurrency assumptions hidden
status: draft
category: async
topics:
  - concurrency
  - ownership
  - correctness
summary: >-
  Shared state, ordering, locks, or idempotency assumptions are implicit in code that may run
  concurrently.
relatedPatterns:
  - make-side-effects-visible
  - keep-async-boundaries-explicit
  - make-state-transitions-explicit
relatedConcepts:
  - temporal-coupling
  - side-effect-visibility
  - state-space
---

## Impact

The code can pass local tests while failing under real scheduling. Reviewers cannot tell which data
is protected, which operations can repeat, or which order must be preserved.

## Signals

- Shared mutable state is updated without an obvious lock or ownership boundary.
- Retry code is added without making the operation idempotent.
- A background task reads data that another path mutates.
- Tests rely on a single-threaded execution order that production does not guarantee.

## Diagnostic Questions

- What owns this shared state?
- Can this operation run twice or out of order?
- Where is cancellation or retry handled?
- What test or review evidence would catch the likely race?

## Approach

- Make ownership, locking, and async boundaries visible.
- Name idempotency and transition rules where retries happen.
- Keep mutation in one place when possible, and expose the effect in the return value or state
  transition.
- Use focused tests for ordering-sensitive behavior, but do not pretend they prove all scheduler
  interleavings.

## Examples

### Problem: C# shared state is updated without ownership

Concurrent requests can interleave the read and write.

```csharp title="RetryBudget.cs"
public sealed class RetryBudget
{
    private int remaining = 3;

    public bool TryTake()
    {
        if (remaining <= 0) return false;
        remaining -= 1;
        return true;
    }
}
```

### Better: C# mutation has one synchronized owner

The shared counter is still local, but callers cannot bypass the lock.

```csharp title="RetryBudget.cs"
public sealed class RetryBudget
{
    private readonly object gate = new();
    private int remaining = 3;

    public bool TryTake()
    {
        lock (gate)
        {
            if (remaining <= 0) return false;
            remaining -= 1;
            return true;
        }
    }
}
```

### Problem: Shared state is updated without ownership

The counter looks local, but concurrent callers can interleave the read and write.

```java title="src/main/java/example/RetryBudget.java"
final class RetryBudget {
    private int remaining = 3;

    boolean tryTake() {
        if (remaining <= 0) {
            return false;
        }

        remaining -= 1;
        return true;
    }
}
```

### Problem: Python shared state relies on one-threaded execution

The budget looks safe in tests but can race when worker threads share it.

```python title="workers/retry_budget.py"
class RetryBudget:
    def __init__(self):
        self.remaining = 3

    def try_take(self):
        if self.remaining <= 0:
            return False
        self.remaining -= 1
        return True
```

### Better: Python mutation owns its lock

The concurrency assumption is visible in the type.

```python title="workers/retry_budget.py"
class RetryBudget:
    def __init__(self):
        self._lock = threading.Lock()
        self._remaining = 3

    def try_take(self):
        with self._lock:
            if self._remaining <= 0:
                return False
            self._remaining -= 1
            return True
```

### Problem: Rust shared state is split from the lock

Callers can update the count without going through the intended concurrency boundary.

```rust title="src/retry_budget.rs"
pub struct RetryBudget {
    pub remaining: usize,
}

pub fn try_take(budget: &mut RetryBudget) -> bool {
    if budget.remaining == 0 {
        return false;
    }
    budget.remaining -= 1;
    true
}
```

### Better: Rust type owns the atomic transition

The operation exposes the concurrency rule instead of the field.

```rust title="src/retry_budget.rs"
pub struct RetryBudget {
    remaining: AtomicUsize,
}

impl RetryBudget {
    pub fn try_take(&self) -> bool {
        self.remaining
            .fetch_update(Ordering::AcqRel, Ordering::Acquire, |value| value.checked_sub(1))
            .is_ok()
    }
}
```

### Problem: TypeScript fire-and-forget updates race

Two calls can read the same count before either write completes.

```ts title="src/retryBudget.ts"
export async function tryTake(userId: string) {
  const budget = await store.get(userId);
  if (budget.remaining <= 0) return false;
  await store.set(userId, { remaining: budget.remaining - 1 });
  return true;
}
```

### Better: TypeScript boundary names the atomic operation

The store owns the compare-and-set or transaction semantics.

```ts title="src/retryBudget.ts"
export async function tryTake(userId: string) {
  return store.decrementIfPositive(retryBudgetKey(userId));
}
```

### Better: The mutation boundary owns synchronization

The caller can still ask for a retry, but the shared state has one synchronized owner.

```java title="src/main/java/example/RetryBudget.java"
final class RetryBudget {
    private int remaining = 3;

    synchronized boolean tryTake() {
        if (remaining <= 0) {
            return false;
        }

        remaining -= 1;
        return true;
    }
}
```
