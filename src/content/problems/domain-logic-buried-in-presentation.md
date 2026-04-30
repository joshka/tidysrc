---
title: Domain Logic Buried in Presentation
status: draft
category: boundaries
topics:
  - ui
  - domain-rules
  - testing
summary: >-
  A business rule lives inside component rendering, presenters, serializers, or controllers where
  other callers cannot reuse or verify it.
relatedPatterns:
  - name-cross-layer-contracts
  - cap-change-radius
  - observable-behavior-tests
relatedConcepts:
  - boundary-trust
  - change-radius
  - observable-behavior
---

## Impact

The rule becomes easy to miss and hard to test without rendering the presentation path. Other
surfaces may implement a different version because the actual policy has no named boundary.

## Signals

- A component filters, authorizes, validates, or prices data inline.
- The same rule appears in an API handler and a UI component.
- Tests need a browser or component harness to check a domain decision.
- Changing presentation layout risks changing business behavior.

## Diagnostic Questions

- Is this branch a presentation choice or a domain decision?
- Which non-UI caller also needs the rule?
- Can the component receive a view model or policy result instead?
- What observable behavior should protect the rule?

## Approach

- Move domain decisions to a policy, parser, or view-model boundary before rendering.
- Keep presentation-specific formatting in the presentation layer.
- Test the rule at the boundary that owns it, then smoke test the rendered path if needed.
- Name cross-layer contracts so the UI receives the shape it needs.

## Examples

### Problem: C# controller owns an approval rule

The API response path decides who can approve, so other callers can drift.

```csharp title="Approvals/ApprovalController.cs"
public IActionResult Show(Request request, User user)
{
    var canApprove = request.Total < 5000 || user.IsManager;
    return Ok(new { request.Id, canApprove });
}
```

### Better: C# controller receives policy output

The controller presents the decision instead of owning it.

```csharp title="Approvals/ApprovalController.cs"
public IActionResult Show(Request request, User user)
{
    var canApprove = approvalPolicy.CanApprove(user, request);
    return Ok(new ApprovalView(request.Id, canApprove));
}
```

### Problem: Java presenter owns a shipping rule

The view model hides domain behavior inside presentation assembly.

```java title="src/main/java/example/OrderPresenter.java"
OrderView toView(Order order) {
    var canShip = order.status() == Status.PAID && order.address().isVerified();
    return new OrderView(order.id(), canShip);
}
```

### Better: Java presenter receives domain policy

The policy can be tested without the presenter.

```java title="src/main/java/example/OrderPresenter.java"
OrderView toView(Order order) {
    return new OrderView(order.id(), shippingPolicy.canShip(order));
}
```

### Problem: Python serializer owns a business rule

The API serializer decides eligibility while other callers need the same rule.

```python title="orders/serializers.py"
def serialize_order(order):
    return {
        "id": order.id,
        "can_ship": order.status == "paid" and order.address_verified,
    }
```

### Better: Python serializer receives a policy result

The serializer only shapes output.

```python title="orders/serializers.py"
def serialize_order(order, shipping_policy):
    return {
        "id": order.id,
        "can_ship": shipping_policy.can_ship(order),
    }
```

### Problem: Rust response mapping owns a domain decision

The HTTP layer decides whether an order can ship.

```rust title="src/orders/response.rs"
pub fn order_response(order: &Order) -> OrderResponse {
    OrderResponse {
        id: order.id,
        can_ship: order.status == Status::Paid && order.address_verified,
    }
}
```

### Better: Rust response mapping receives domain policy

The response layer presents the decision made by the domain boundary.

```rust title="src/orders/response.rs"
pub fn order_response(order: &Order, policy: &ShippingPolicy) -> OrderResponse {
    OrderResponse {
        id: order.id,
        can_ship: policy.can_ship(order),
    }
}
```

### Problem: The component owns a pricing rule

The discount rule is trapped in rendering code, so API callers can disagree.

```tsx title="src/cart/CartSummary.tsx"
export function CartSummary({ cart }: { cart: Cart }) {
  const discount = cart.items.length >= 10 ? cart.total * 0.1 : 0;

  return <span>Total: {formatMoney(cart.total - discount)}</span>;
}
```

### Better: The UI receives a view model

Pricing happens before rendering, and the component only displays the result.

```tsx title="src/cart/CartSummary.tsx"
export function CartSummary({ summary }: { summary: CartSummaryView }) {
  return <span>Total: {formatMoney(summary.totalAfterDiscount)}</span>;
}
```
