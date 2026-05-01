---
title: >-
  Raw Input Leaks Inward
status: draft
category: boundaries
topics:
  - validation
  - parsing
  - domain-shape
summary: >-
  Strings, maps, nullable values, or unchecked data move through the system after the boundary
  should have parsed them.
relatedPatterns:
  - parse-dont-validate
  - make-invalid-states-hard-to-express
  - guard-clause
relatedConcepts:
  - observable-behavior
  - reader-locality
---

## Description

Strings, maps, nullable values, or unchecked data move through the system after the boundary should
have parsed them.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Every caller has to remember the same validation rules. That spreads defensive code, creates

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

## Signals

- The same null, empty, format, or enum checks appear in multiple places.
- A type says string or boolean when the domain has a narrower set of valid states.
- Errors are discovered far from the input boundary that introduced them.
- A function accepts raw data even though every successful caller already validated it.

## Diagnostic Questions

- Where is the first point that has enough context to parse this input?
- What type would make the invalid state impossible or at least uncommon?
- Which checks are boundary validation and which are real business rules?
- Can callers receive a parsed value instead of being trusted to repeat the rule?

## Approach

- Parse raw input at the boundary and pass domain values inward.
- Use guard clauses for local preconditions, but avoid repeated guards that signal a missing parsed
  type.
- Prefer constructors, enums, refined types, or result-bearing parsers that encode the successful
  state.
- Keep error messages and failure modes observable while improving the internal shape.

## Examples

### Problem: passes raw request strings inward

Every caller has to remember the same id parsing rule.

```csharp title="Orders/OrderController.cs"
public Order Load(string orderId)
{
    return orders.Load(orderId);
}
```

### Better: parses at the boundary

The service receives a domain value.

```csharp title="Orders/OrderController.cs"
public Order Load(string rawOrderId)
{
    var orderId = OrderId.Parse(rawOrderId);
    return orders.Load(orderId);
}
```

### Problem: raw strings cross the boundary

The service accepts values that may not be valid ids.

```java title="src/main/java/example/OrdersController.java"
Order load(String orderId) {
    return orders.load(orderId);
}
```

### Better: controller parses once

Invalid input fails before it reaches domain logic.

```java title="src/main/java/example/OrdersController.java"
Order load(String rawOrderId) {
    return orders.load(OrderId.parse(rawOrderId));
}
```

### Problem: raw payloads move inward

Business code receives unchecked JSON shape.

```python title="orders/routes.py"
def load_order(payload):
    return orders.load(payload["order_id"])
```

### Better: boundary passes a parsed value

The route owns the raw payload and the service owns domain behavior.

```python title="orders/routes.py"
def load_order(payload):
    order_id = parse_order_id(payload["order_id"])
    return orders.load(order_id)
```

### Problem: raw strings reach domain code

The function signature does not say whether the id has been validated.

```rust title="src/orders.rs"
pub fn load_order(order_id: String) -> Result<Order, Error> {
    repository::load(order_id)
}
```

### Better: type carries the parse boundary

Downstream code cannot receive an unparsed id by accident.

```rust title="src/orders.rs"
pub fn load_order(order_id: OrderId) -> Result<Order, Error> {
    repository::load(order_id)
}
```

### Problem: raw ids leak past the route

Structural typing makes plain strings easy to pass everywhere.

```ts title="src/orders/route.ts"
export function loadOrder(orderId: string) {
  return orders.load(orderId);
}
```

### Better: brands the parsed value

The route converts raw input before calling domain code.

```ts title="src/orders/route.ts"
export function loadOrder(rawOrderId: string) {
  return orders.load(parseOrderId(rawOrderId));
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
