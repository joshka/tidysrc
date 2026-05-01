---
title: >-
  Raw Input Leaks Inward
status: reviewed
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
  - boundary-trust
  - observable-behavior
  - reader-locality
---

## Description

Strings, maps, nullable values, or unchecked data move through the system after the boundary should
have parsed them.

The boundary has enough context to reject, normalize, or convert the input, but it passes the raw
shape inward. Domain code then receives `string`, `map`, `null`, or request-shaped data when it
should receive an `OrderId`, parsed command, enum, or result-bearing value.

That weakens [boundary trust](/concepts/boundary-trust/). Callers cannot tell whether the value is
still uncertain or already safe to use.

## Why It Matters

Every caller has to remember the same validation rules. That spreads defensive code and makes
reviewers ask whether each branch is validating input, enforcing policy, or compensating for a
missing parsed type.

The risk is missed paths. One caller rejects an empty id, another accepts it, and a third discovers
the bad value after it has crossed several layers. The later the failure appears, the harder it is
to return a useful error or prove the behavior is consistent.

## Code Impact

Raw input leaking inward keeps uncertainty alive across the codebase. Function signatures stay too
broad, repeated guards accumulate, and business logic has to handle invalid states it should never
receive.

The code also loses a clear place for error shape. Instead of one parser returning a structured
failure, many callers create slightly different messages, defaults, and recovery paths.

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

- [Parse, don't validate](/patterns/parse-dont-validate/) at the boundary and pass domain values
  inward.
- Use [guard clauses](/patterns/guard-clause/) for local preconditions, but avoid repeated guards
  that signal a missing parsed type.
- [Make invalid states hard to express](/patterns/make-invalid-states-hard-to-express/) with
  constructors, enums, refined types, or result-bearing parsers.
- Keep error messages and failure modes [observable](/concepts/observable-behavior/) while improving
  the internal shape.

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

The service receives a domain value. This applies
[Parse, Don't Validate](/patterns/parse-dont-validate/).

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

Invalid input fails before it reaches domain logic. This applies
[Parse, Don't Validate](/patterns/parse-dont-validate/).

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

The route owns the raw payload and the service owns domain behavior. This applies
[Parse, Don't Validate](/patterns/parse-dont-validate/).

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

Downstream code cannot receive an unparsed id by accident. This applies
[Make Invalid States Hard to Express](/patterns/make-invalid-states-hard-to-express/).

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

The route converts raw input before calling domain code. This applies
[Make Invalid States Hard to Express](/patterns/make-invalid-states-hard-to-express/).

```ts title="src/orders/route.ts"
export function loadOrder(rawOrderId: string) {
  return orders.load(parseOrderId(rawOrderId));
}
```

### Problem: raw id crosses the C boundary

The service receives a string and has to trust that another caller checked it.

```c title="src/example.c"
Order *load_order(const char *order_id) {
    return repository_load(order_id);
}
```

### Better: parser creates a domain id

The repository receives an `OrderId` that was parsed at the boundary. This applies
[Parse, Don't Validate](/patterns/parse-dont-validate/).

```c title="src/example.c"
Order *load_order(const char *raw_order_id) {
    OrderId order_id;

    if (!parse_order_id(raw_order_id, &order_id)) {
        return NULL;
    }

    return repository_load(order_id);
}
```

### Problem: nullable request value moves inward

Domain code receives a pointer that may not hold a valid id.

```cpp title="src/example.cpp"
Order load_order(const Request& request) {
    return orders.load(request.query("order_id"));
}
```

### Better: boundary constructs a value object

The request parser owns uncertainty; the service receives an `OrderId`. This applies
[Make Invalid States Hard to Express](/patterns/make-invalid-states-hard-to-express/).

```cpp title="src/example.cpp"
Order load_order(const Request& request) {
    auto order_id = OrderId::parse(request.query("order_id"));

    return orders.load(order_id);
}
```

### Problem: handler passes raw path values inward

The service accepts the same raw string shape as the HTTP router.

```go title="internal/example/service.go"
func LoadOrder(rawOrderID string) (Order, error) {
    return repository.Load(rawOrderID)
}
```

### Better: handler parses before calling service

The service only accepts the parsed id. This applies
[Parse, Don't Validate](/patterns/parse-dont-validate/).

```go title="internal/example/service.go"
func LoadOrder(rawOrderID string) (Order, error) {
    orderID, err := ParseOrderID(rawOrderID)
    if err != nil {
        return Order{}, err
    }

    return repository.Load(orderID)
}
```

### Problem: raw form data reaches application logic

Application code receives `FormData` instead of a parsed command.

```js title="src/example.js"
export function submitOrder(formData) {
  return orders.submit(formData.get('orderId'));
}
```

### Better: form parser returns a command

The application code receives a named command. This applies
[Parse, Don't Validate](/patterns/parse-dont-validate/).

```js title="src/example.js"
export function submitOrder(formData) {
  const command = parseSubmitOrder(formData);
  return orders.submit(command);
}
```
