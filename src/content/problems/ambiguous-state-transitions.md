---
title: >-
  Ambiguous State Transitions
status: reviewed
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
  - make-side-effects-visible
  - characterize-before-changing
relatedConcepts:
  - state-space
  - temporal-coupling
  - time-of-check-to-time-of-use
  - cognitive-burden
  - observable-behavior
---

## Description

Ambiguous state transitions happen when lifecycle movement looks like ordinary field assignment. The
code may set a status string, flip a boolean, update a timestamp, or mutate several nullable fields
without naming the transition those changes represent.

The same problem appears when field combinations quietly expand the [state
space](/concepts/state-space/). A later branch depends on "started but not finished and has an
error," or "active but not cancelled and not paused," but no type or transition function names that
state.

There are two common fixes. When the problem is impossible field combinations, name the valid states
with an enum, variant, sealed type, or typed constant. When the problem is lifecycle movement, put
the legal transition, invariant checks, timestamps, and events behind a named transition function.

## Why It Matters

Reviewers cannot tell whether a write is safe by reading the assignment. They have to reconstruct
the allowed states, [side effects](/concepts/side-effect-visibility/), and invariants from scattered
call sites, then guess whether the current change skipped one of them. The [cognitive
burden](/concepts/cognitive-burden/) comes from having to consider all the ways state could have
changed before this line runs.

## Code Impact

Direct state writes create [temporal coupling](/concepts/temporal-coupling/): callers must remember
the timestamp, event, validation, cleanup, and illegal-transition checks that belong with the
lifecycle move. Tests can also start building impossible state combinations because the easiest way
to reach behavior is to assemble fields by hand.

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

- [Make state transitions explicit](/patterns/make-state-transitions-explicit/) by naming
  lifecycle moves and putting invariant checks inside them.
- [Make invalid states hard to express](/patterns/make-invalid-states-hard-to-express/) with
  enums, sealed variants, or typed constants for mutually exclusive states.
- Use named states when field combinations carry lifecycle meaning.
- Use named transition functions when movement must also update timestamps, emit events, or reject
  illegal state changes.
- [Make side effects visible](/patterns/make-side-effects-visible/) by keeping timestamps and
  events beside the state change.
- Make illegal transitions impossible or noisy instead of relying on caller discipline.
- [Characterize current behavior](/patterns/characterize-before-changing/) before changing legacy
  lifecycles.

## Examples

### Problem: flags hide the upload lifecycle

The upload state is spread across independent fields. Callers can set combinations that do not make
sense, such as done-without-started or failed-without-error.

```c title="src/upload.c"
struct upload {
    bool started;
    bool done;
    bool failed;
    const char *error;
};

bool should_retry(const struct upload *upload) {
    return upload->started
        && !upload->done
        && upload->failed
        && upload->error != NULL;
}
```

### Better: named states carry the upload meaning

The state enum [makes the lifecycle explicit](/patterns/make-state-transitions-explicit/), so retry
logic no longer reconstructs a hidden state machine from independent flags.

```c title="src/upload.c"
enum upload_state {
    UPLOAD_QUEUED,
    UPLOAD_RUNNING,
    UPLOAD_FAILED,
    UPLOAD_DONE,
};

struct upload {
    enum upload_state state;
    const char *error;
};

bool should_retry(const struct upload *upload) {
    return upload->state == UPLOAD_FAILED && upload->error != NULL;
}
```

### Problem: nullable fields become lifecycle states

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

### Better: named states carry billing meaning

Each state carries only the fields that make sense for that state, making invalid combinations
harder to express before billing code sees them.

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

### Problem: status strings and timestamps drift apart

The job has one lifecycle, but callers can update status and timestamps independently.

```cpp title="src/job.cpp"
struct Job {
    std::string status = "queued";
    std::optional<TimePoint> started_at;
    std::optional<TimePoint> finished_at;
    std::optional<std::string> error;
};

bool should_retry(const Job& job) {
    return job.status == "failed"
        && job.started_at.has_value()
        && !job.finished_at.has_value()
        && job.error.has_value();
}
```

### Better: variants name the valid combinations

The variant states keep each lifecycle shape separate, so retry checks read the [state
space](/concepts/state-space/) directly.

```cpp title="src/job.cpp"
struct Queued {};
struct Running { TimePoint started_at; };
struct Failed { TimePoint started_at; std::string error; };
struct Finished { TimePoint finished_at; };

using JobState = std::variant<Queued, Running, Failed, Finished>;

bool should_retry(const JobState& state) {
    return std::holds_alternative<Failed>(state);
}
```

### Problem: status fields drift apart

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

### Better: transitions own the allowed movement

Named methods [make the transition explicit](/patterns/make-state-transitions-explicit/) and reject
movement from the wrong state.

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

### Problem: loose strings drive UI state

The UI branch depends on string values and optional fields that any caller can combine.

```js title="src/uploadState.js"
export function canRetry(upload) {
  return upload.status === 'failed'
    && upload.error
    && upload.retryCount < 3
    && !upload.finishedAt;
}
```

### Better: transition helpers name the UI lifecycle

The upload can stay a plain object at the UI boundary, but lifecycle movement goes through named
helpers instead of ad hoc field edits.

```js title="src/uploadState.js"
export function failUpload(upload, error) {
  if (upload.status !== 'running') {
    throw new Error(`cannot fail upload from ${upload.status}`);
  }

  return { ...upload, status: 'failed', error, finishedAt: null };
}

export function canRetry(upload) {
  return upload.status === 'failed' && upload.error && upload.retryCount < 3;
}
```

### Problem: direct assignment skips transition behavior

The state, timestamp, and event all describe one transition, but every caller has to remember the
same sequence.

```go title="internal/orders/order.go"
func Ship(order *Order, events EventBus, now time.Time) error {
    if order.Status != Paid {
        return ErrInvalidTransition
    }

    order.Status = Shipped
    order.ShippedAt = &now
    return events.Publish(OrderShipped{OrderID: order.ID})
}
```

### Better: named transition owns the invariant

The order owns the legal movement and returns the event that must accompany the state change, so the
side effect stays visible.

```go title="internal/orders/order.go"
func (o *Order) MarkShipped(now time.Time) (OrderShipped, error) {
    if o.Status != Paid {
        return OrderShipped{}, ErrInvalidTransition
    }

    o.Status = Shipped
    o.ShippedAt = &now
    return OrderShipped{OrderID: o.ID}, nil
}
```

### Problem: dictionaries make the lifecycle implicit

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

### Better: dict transitions name the lifecycle move

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

### Problem: independent fields hide the state machine

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

### Better: named states carry the valid combinations

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

### Problem: shipping an order is scattered across assignments

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

### Better: a named transition owns the invariant

The caller can ask for the transition, but the order owns the legal movement and required
[observable behavior](/concepts/observable-behavior/).

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
