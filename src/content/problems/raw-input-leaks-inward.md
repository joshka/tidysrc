---
title: >-
  Raw input leaks inward
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

## Impact

Every caller has to remember the same validation rules. That spreads defensive code, creates
inconsistent edge handling, and makes invalid states look like normal application data.

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

### Problem: C# passes raw request strings inward

Every caller has to remember the same id parsing rule.

```csharp title="Orders/OrderController.cs"
public Order Load(string orderId)
{
    return orders.Load(orderId);
}
```

### Better: C# parses at the boundary

The service receives a domain value.

```csharp title="Orders/OrderController.cs"
public Order Load(string rawOrderId)
{
    var orderId = OrderId.Parse(rawOrderId);
    return orders.Load(orderId);
}
```

### Problem: Java raw strings cross the boundary

The service accepts values that may not be valid ids.

```java title="src/main/java/example/OrdersController.java"
Order load(String orderId) {
    return orders.load(orderId);
}
```

### Better: Java controller parses once

Invalid input fails before it reaches domain logic.

```java title="src/main/java/example/OrdersController.java"
Order load(String rawOrderId) {
    return orders.load(OrderId.parse(rawOrderId));
}
```

### Problem: Python raw payloads move inward

Business code receives unchecked JSON shape.

```python title="orders/routes.py"
def load_order(payload):
    return orders.load(payload["order_id"])
```

### Better: Python boundary passes a parsed value

The route owns the raw payload and the service owns domain behavior.

```python title="orders/routes.py"
def load_order(payload):
    order_id = parse_order_id(payload["order_id"])
    return orders.load(order_id)
```

### Problem: Rust raw strings reach domain code

The function signature does not say whether the id has been validated.

```rust title="src/orders.rs"
pub fn load_order(order_id: String) -> Result<Order, Error> {
    repository::load(order_id)
}
```

### Better: Rust type carries the parse boundary

Downstream code cannot receive an unparsed id by accident.

```rust title="src/orders.rs"
pub fn load_order(order_id: OrderId) -> Result<Order, Error> {
    repository::load(order_id)
}
```

### Problem: TypeScript raw ids leak past the route

Structural typing makes plain strings easy to pass everywhere.

```ts title="src/orders/route.ts"
export function loadOrder(orderId: string) {
  return orders.load(orderId);
}
```

### Better: TypeScript brands the parsed value

The route converts raw input before calling domain code.

```ts title="src/orders/route.ts"
export function loadOrder(rawOrderId: string) {
  return orders.load(parseOrderId(rawOrderId));
}
```
