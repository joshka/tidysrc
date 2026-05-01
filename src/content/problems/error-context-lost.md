---
title: Error Context Is Lost
status: draft
category: boundaries
topics:
  - errors
  - observability
  - recovery
summary: >-
  Failures cross a boundary as strings, generic exceptions, or dropped causes that callers cannot
  inspect.
relatedPatterns:
  - preserve-error-context
  - return-structured-errors
  - test-observable-behavior
  - characterize-before-changing
relatedConcepts:
  - observable-behavior
  - boundary-trust
---

## Description

Failures cross a boundary as strings, generic exceptions, or dropped causes that callers cannot
inspect.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Callers cannot recover, retry, report, or test failure behavior without parsing text or relying on

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

## Signals

- Code checks error.message or string contents to choose behavior.
- A low-level error is wrapped without the field, id, status, or retry hint that explains recovery.
- Tests assert vague failure text instead of a stable error kind.
- The UI cannot show useful feedback without duplicating parser logic.

## Diagnostic Questions

- Which part of this error is stable program behavior?
- Which context would help the caller recover or report the failure?
- Does changing this error shape affect public behavior?
- Can the human message remain separate from the machine-readable kind?

## Approach

- Return structured errors with stable kinds and recovery context.
- Preserve causes when they matter for debugging, but do not force callers to parse cause text.
- Test public error shape when callers depend on it.
- Characterize legacy string errors before replacing them if callers may already parse them.

## Examples

### Problem: throws a generic exception

The caller loses the stable reason and the order id that failed.

```csharp title="Orders/LoadOrder.cs"
public Order LoadOrder(OrderId id)
{
    return repository.Find(id)
        ?? throw new Exception("Could not load order");
}
```

### Better: exposes a stable error result

Callers can branch on the error kind without parsing text.

```csharp title="Orders/LoadOrder.cs"
public Result<Order, LoadOrderError> LoadOrder(OrderId id)
{
    var order = repository.Find(id);
    return order is null
        ? LoadOrderError.NotFound(id)
        : order;
}
```

### Problem: wraps away the useful cause

The original status and recovery hint disappear behind a generic exception.

```java title="src/main/java/example/Orders.java"
Order loadOrder(OrderId id) {
    try {
        return client.fetchOrder(id);
    } catch (IOException error) {
        throw new RuntimeException("order load failed");
    }
}
```

### Better: error keeps the stable context

The exception records the id and cause for callers and diagnostics.

```java title="src/main/java/example/Orders.java"
Order loadOrder(OrderId id) {
    try {
        return client.fetchOrder(id);
    } catch (IOException error) {
        throw new OrderLoadFailed(id, error);
    }
}
```

### Problem: returns vague failure text

The UI cannot distinguish not-found from unavailable storage.

```python title="orders/load.py"
def load_order(order_id, repository):
    order = repository.find(order_id)
    if order is None:
        return None, "could not load order"
    return order, None
```

### Better: returns a typed failure shape

The message can change while the kind stays stable.

```python title="orders/load.py"
@dataclass(frozen=True)
class LoadOrderError:
    kind: Literal["not_found", "unavailable"]
    order_id: str

def load_order(order_id, repository):
    order = repository.find(order_id)
    if order is None:
        return None, LoadOrderError("not_found", order_id)
    return order, None
```

### Problem: A string loses recovery context

The caller cannot tell whether it should retry, ask for a different id, or report a permission
failure.

```rust title="src/orders/load.rs"
pub fn load_order(id: OrderId) -> Result<Order, String> {
    repository::find(id).map_err(|err| format!("could not load order: {err}"))
}
```

### Better: The error keeps a stable kind

The human message can change while callers still branch on the error kind.

```rust title="src/orders/load.rs"
pub enum LoadOrderError {
    NotFound { id: OrderId },
    PermissionDenied { id: OrderId },
    StorageUnavailable,
}

pub fn load_order(id: OrderId) -> Result<Order, LoadOrderError> {
    repository::find(id).map_err(|err| err.to_load_order_error(id))
}
```

### Problem: error text becomes control flow

The caller has to inspect a message instead of a stable kind.

```ts title="src/orders/loadOrder.ts"
export async function loadOrder(id: string) {
  try {
    return await api.getOrder(id);
  } catch {
    throw new Error(`Could not load order ${id}`);
  }
}
```

### Better: error carries a discriminant

The caller can recover without depending on message wording.

```ts title="src/orders/loadOrder.ts"
type LoadOrderError =
  | { kind: 'not-found'; id: string }
  | { kind: 'unavailable'; retryAfterMs?: number };

export async function loadOrder(id: string): Promise<Order | LoadOrderError> {
  return api.getOrder(id).catch((error) => toLoadOrderError(id, error));
}
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
