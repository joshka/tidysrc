---
title: >-
  Hidden Concurrency Assumptions
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

## Description

Hidden concurrency assumptions appear when code depends on execution order, exclusive ownership, or
single-use operations without making that contract visible. The code may read and write shared
state, launch background work, retry a mutation, or update lifecycle state as if no other path can
interleave with it.

The shared theme is an implicit concurrency contract. A reader has to infer which data is protected,
which operation can repeat, which side effect must happen once, and which ordering the code relies
on. If that contract is not visible, review cannot tell whether the local change is safe under real
scheduling.

## Why It Matters

Concurrency bugs often pass ordinary unit tests because the test runs one path at a time. The
failure appears under overlapping requests, retries, background jobs, cancellation, or production
scheduler timing. Reviewers cannot reason about that risk from a bare field update or
fire-and-forget call.

The maintenance cost is the hidden [cognitive burden](/concepts/cognitive-burden/): every caller
must remember whether it owns a lock, whether a retry is idempotent, or whether a background task
can observe half-finished state.

## Code Impact

Hidden assumptions scatter locks, ownership, retry rules, and ordering across call sites. A later
change can add a second caller, retry path, or async boundary without noticing that the original
code depended on one-threaded execution.

The code also hides [side effects](/concepts/side-effect-visibility/) and [temporal
coupling](/concepts/temporal-coupling/). A mutation reads as a simple assignment, but the
correctness contract depends on when it runs, whether it can run twice, and who can observe the
state between steps.

## Signals

- Shared mutable state is updated without an obvious lock or ownership boundary.
- Retry code is added without making the operation idempotent.
- A background task reads data that another path mutates.
- Tests rely on a single-threaded execution order that production does not guarantee.
- Fire-and-forget work changes state without a visible completion, cancellation, or error path.

## Diagnostic Questions

- What owns this shared state?
- Can this operation run twice or out of order?
- Which state can another task observe between these two lines?
- Where is cancellation or retry handled?
- What test or review evidence would catch the likely race?

## Approach

- [Keep async boundaries explicit](/patterns/keep-async-boundaries-explicit/) when work crosses
  tasks, threads, queues, or background jobs.
- [Make side effects visible](/patterns/make-side-effects-visible/) by returning, publishing, or
  recording the state change callers depend on.
- Name idempotency and transition rules where retries happen.
- Keep mutation behind one owner when possible, and expose the effect in the return value or
  [state transition](/patterns/make-state-transitions-explicit/).
- Use focused tests for ordering-sensitive behavior, but do not claim they prove every scheduler
  interleaving.

## Examples

### Problem: shared counter has no owner

Concurrent callers can interleave the read and write, so two requests may both take the same retry
slot.

```c title="src/retry_budget.c"
bool retry_budget_try_take(struct retry_budget *budget) {
    if (budget->remaining <= 0) {
        return false;
    }

    budget->remaining -= 1;
    return true;
}
```

### Better: mutation owns the lock

The shared state has one synchronized mutation boundary, so callers cannot decrement the counter
without the lock.

```c title="src/retry_budget.c"
bool retry_budget_try_take(struct retry_budget *budget) {
    pthread_mutex_lock(&budget->lock);

    bool taken = false;
    if (budget->remaining > 0) {
        budget->remaining -= 1;
        taken = true;
    }

    pthread_mutex_unlock(&budget->lock);
    return taken;
}
```

### Problem: check and update are split

The code checks capacity and then updates it later. Another thread can observe the same value
between those operations.

```cpp title="src/retry_budget.cpp"
bool RetryBudget::try_take() {
    if (remaining <= 0) {
        return false;
    }

    remaining -= 1;
    return true;
}
```

### Better: critical section names the concurrency boundary

The lock is local to the operation that needs exclusive access.

```cpp title="src/retry_budget.cpp"
bool RetryBudget::try_take() {
    std::lock_guard<std::mutex> guard(mutex);

    if (remaining <= 0) {
        return false;
    }

    remaining -= 1;
    return true;
}
```

### Problem: request budget is updated without ownership

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

### Better: mutation has one synchronized owner

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

### Problem: method state is updated without ownership

The counter looks local, but concurrent callers can interleave the read and write.

```go title="internal/retry/budget.go"
type RetryBudget struct {
    remaining int
}

func (b *RetryBudget) TryTake() bool {
    if b.remaining <= 0 {
        return false
    }

    b.remaining--
    return true
}
```

### Better: owner protects the shared state

The method owns synchronization, so callers do not need to remember the locking rule.

```go title="internal/retry/budget.go"
type RetryBudget struct {
    mu        sync.Mutex
    remaining int
}

func (b *RetryBudget) TryTake() bool {
    b.mu.Lock()
    defer b.mu.Unlock()

    if b.remaining <= 0 {
        return false
    }

    b.remaining--
    return true
}
```

### Problem: shared state is updated without ownership

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

### Better: mutation boundary owns synchronization

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

### Problem: async store updates race

Two calls can read the same count before either write completes.

```js title="src/retryBudget.js"
export async function tryTake(userId) {
  const budget = await store.get(userId);
  if (budget.remaining <= 0) return false;

  await store.set(userId, { remaining: budget.remaining - 1 });
  return true;
}
```

### Better: store owns the atomic operation

The async boundary exposes one operation that owns the compare-and-update semantics.

```js title="src/retryBudget.js"
export async function tryTake(userId) {
  return store.decrementIfPositive(retryBudgetKey(userId));
}
```

### Problem: shared state relies on one-threaded execution

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

### Better: mutation owns its lock

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

### Problem: lock scopes split the decision

The borrow checker prevents unsynchronized shared mutation, but it cannot make two separate lock
scopes atomic. Another task can change the value between the check and the update.

```rust title="src/retry_budget.rs"
pub async fn try_take(budget: Arc<Mutex<RetryBudget>>) -> bool {
    if budget.lock().await.remaining == 0 {
        return false;
    }

    budget.lock().await.remaining -= 1;
    true
}
```

### Better: type owns the critical section

The mutation boundary holds one lock across the decision and update.

```rust title="src/retry_budget.rs"
pub struct RetryBudget {
    remaining: usize,
}

impl RetryBudget {
    pub async fn try_take(budget: &Mutex<Self>) -> bool {
        let mut budget = budget.lock().await;

        if budget.remaining == 0 {
            return false;
        }

        budget.remaining -= 1;
        true
    }
}
```

### Problem: typed async updates race

Two calls can read the same count before either write completes.

```ts title="src/retryBudget.ts"
export async function tryTake(userId: string) {
  const budget = await store.get(userId);
  if (budget.remaining <= 0) return false;
  await store.set(userId, { remaining: budget.remaining - 1 });
  return true;
}
```

### Better: boundary names the atomic operation

The store owns the compare-and-set or transaction semantics.

```ts title="src/retryBudget.ts"
export async function tryTake(userId: string) {
  return store.decrementIfPositive(retryBudgetKey(userId));
}
```
