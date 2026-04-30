---
title: >-
  Ambiguous state transitions
status: draft
category: state
topics:
  - lifecycle
  - invariants
  - correctness
summary: >-
  Lifecycle state changes hide inside direct field writes, loose status strings, or field
  combinations that quietly act like a state machine.
relatedPatterns:
  - make-state-transitions-explicit
  - make-invalid-states-hard-to-express
  - characterize-before-changing
relatedConcepts:
  - state-space
  - temporal-coupling
  - observable-behavior
---

## Impact

No single place owns the invariants of the transition. Callers can skip timestamps, events,
validation, or cleanup because changing state looks like ordinary assignment. In larger structs,
several ordinary fields can also become an implicit state machine: a later branch depends on a
particular combination, but nothing names that combination as a state.

## Signals

- Several modules assign status fields directly.
- A state change should emit an event or timestamp, but that side effect is optional at call sites.
- Tests build impossible state combinations to reach common behavior.
- The code has multiple booleans that describe one lifecycle.
- Reviewers cannot tell whether `status = ...` is safe or whether it bypasses required behavior.
- A struct or object has several fields whose combinations control later behavior.

## Diagnostic Questions

- What states can this value occupy?
- Which field combinations are meaningful states, and which are impossible?
- Which transitions are legal, and which should be rejected?
- What side effects must happen with the transition?
- Can the type system or a named transition function reject invalid movement?

## Approach

- Name lifecycle transitions and put invariant checks inside them.
- Use enums, sealed variants, or typed constants for mutually exclusive states.
- Make hidden state machines explicit when field combinations carry lifecycle meaning.
- Keep transition side effects, timestamps, and events beside the state change.
- Make illegal transitions impossible or noisy instead of relying on caller discipline.
- Characterize current transition behavior before changing legacy lifecycles.

## Examples

These examples show the problem shape, not a complete domain model. The important distinction is
whether callers can mutate lifecycle state directly or must go through a named transition.

### Problem: Shipping an order is scattered across assignments

The state, timestamp, and event all describe one transition, but every caller has to remember the
same sequence.

```ts title="src/orders/shipOrder.ts"
export function shipOrder(order: Order, events: EventBus, clock: Clock) {
  if (order.status !== 'paid') {
    throw new Error('order must be paid before shipping');
  }

  order.status = 'shipped';
  order.shippedAt = clock.now();
  order.events.push({ type: 'order.shipped', orderId: order.id });
  events.publish('order.shipped', { orderId: order.id });
}
```

### Better: A named transition owns the invariant

The caller can ask for the transition, but the order owns the legal movement and required side
effects.

```ts title="src/orders/order.ts"
export class Order {
  markShipped(clock: Clock): DomainEvent {
    if (this.status !== 'paid') {
      throw new Error('order must be paid before shipping');
    }

    this.status = 'shipped';
    this.shippedAt = clock.now();

    return { type: 'order.shipped', orderId: this.id };
  }
}
```

### Problem: Independent fields hide the state machine

The fields look like normal data, but their combinations decide whether the job is queued, running,
failed, or retryable.

```rust title="src/job.rs"
pub struct Job {
    pub started_at: Option<Instant>,
    pub finished_at: Option<Instant>,
    pub failed_reason: Option<String>,
    pub retry_count: u32,
}

pub fn should_retry(job: &Job) -> bool {
    job.started_at.is_some()
        && job.finished_at.is_none()
        && job.failed_reason.is_some()
        && job.retry_count < 3
}
```

### Problem: C# nullable fields become lifecycle states

The subscription's future behavior depends on combinations of nullable dates and status text.

```csharp title="Billing/Subscription.cs"
public sealed class Subscription
{
    public string Status { get; set; } = "trial";
    public DateTimeOffset? TrialEndsAt { get; set; }
    public DateTimeOffset? PausedUntil { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }

    public bool CanBill(DateTimeOffset now)
    {
        return Status == "active"
            && CancelledAt is null
            && (PausedUntil is null || PausedUntil <= now)
            && (TrialEndsAt is null || TrialEndsAt <= now);
    }
}
```

### Better: C# named states carry billing meaning

Each state carries only the fields that make sense for that state, so billing no longer depends on
reconstructing nullable-field combinations.

```csharp title="Billing/SubscriptionState.cs"
public abstract record SubscriptionState
{
    public sealed record Trial(DateTimeOffset EndsAt) : SubscriptionState;
    public sealed record Active : SubscriptionState;
    public sealed record Paused(DateTimeOffset Until) : SubscriptionState;
    public sealed record Cancelled(DateTimeOffset At) : SubscriptionState;

    public bool CanBill(DateTimeOffset now) =>
        this is Active || this is Trial trial && trial.EndsAt <= now;
}
```

### Problem: Java status fields drift apart

The order has one lifecycle, but callers can create combinations such as cancelled-and-fulfilled
because the fields are updated independently.

```java title="src/main/java/example/Order.java"
final class Order {
    String status = "created";
    Instant paidAt;
    Instant fulfilledAt;
    Instant cancelledAt;

    boolean canFulfill() {
        return "paid".equals(status)
            && paidAt != null
            && fulfilledAt == null
            && cancelledAt == null;
    }
}
```

### Better: Java transitions own the allowed movement

Named methods make the lifecycle explicit and reject movement from the wrong state.

```java title="src/main/java/example/Order.java"
final class Order {
    private OrderStatus status = OrderStatus.CREATED;
    private Instant paidAt;

    void markPaid(Instant now) {
        if (status != OrderStatus.CREATED) {
            throw new InvalidTransition(status, OrderStatus.PAID);
        }

        status = OrderStatus.PAID;
        paidAt = now;
    }
}
```

### Problem: Python dictionaries make the lifecycle implicit

The state often starts as a job payload or API dictionary. Optional keys and status strings become a
state machine by convention.

```python title="tasks/state.py"
def should_retry(task: dict) -> bool:
    return (
        task.get("status") == "failed"
        and task.get("finished_at") is None
        and task.get("error") is not None
        and task.get("retry_count", 0) < 3
    )
```

### Better: Python dict transitions name the lifecycle move

The data can stay a dictionary when it is a queue payload or JSON boundary, but callers should use a
named transition instead of editing lifecycle keys directly.

```python title="tasks/state.py"
from enum import Enum


class TaskStatus(Enum):
    QUEUED = "queued"
    RUNNING = "running"
    FAILED = "failed"
    FINISHED = "finished"


def fail_task(task: dict, error: str) -> dict:
    if task.get("status") != TaskStatus.RUNNING.value:
        raise ValueError(f"cannot fail task from {task.get('status')}")

    return {
        **task,
        "status": TaskStatus.FAILED.value,
        "error": error,
        "finished_at": None,
    }


def should_retry(task: dict) -> bool:
    return (
        task.get("status") == TaskStatus.FAILED.value
        and task.get("error") is not None
        and task.get("retry_count", 0) < 3
    )
```

### Better: Named states carry the valid combinations

The lifecycle states become visible. A failed job can carry a reason and retry count without making
every reader reconstruct that combination from nullable fields.

```rust title="src/job.rs"
pub enum JobState {
    Queued,
    Running { started_at: Instant },
    Failed { reason: String, retry_count: u32 },
    Finished { finished_at: Instant },
}

pub fn should_retry(state: &JobState) -> bool {
    matches!(state, JobState::Failed { retry_count, .. } if *retry_count < 3)
}
```
