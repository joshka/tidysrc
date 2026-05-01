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
  - move-domain-rules-inward
  - name-cross-layer-contracts
  - cap-change-radius
  - test-observable-behavior
relatedConcepts:
  - boundary-trust
  - change-radius
  - observable-behavior
---

## Description

A business rule lives inside component rendering, presenters, serializers, or controllers where
other callers cannot reuse or verify it.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

The rule becomes easy to miss and hard to test without rendering the presentation path. Other

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

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

### Problem: controller owns an approval rule

The API response path decides who can approve, so other callers can drift.

```csharp title="Approvals/ApprovalController.cs"
public IActionResult Show(Request request, User user)
{
    var canApprove = request.Total < 5000 || user.IsManager;
    return Ok(new { request.Id, canApprove });
}
```

### Better: controller receives policy output

The controller presents the decision instead of owning it.

```csharp title="Approvals/ApprovalController.cs"
public IActionResult Show(Request request, User user)
{
    var canApprove = approvalPolicy.CanApprove(user, request);
    return Ok(new ApprovalView(request.Id, canApprove));
}
```

### Problem: presenter owns a shipping rule

The view model hides domain behavior inside presentation assembly.

```java title="src/main/java/example/OrderPresenter.java"
OrderView toView(Order order) {
    var canShip = order.status() == Status.PAID && order.address().isVerified();
    return new OrderView(order.id(), canShip);
}
```

### Better: presenter receives domain policy

The policy can be tested without the presenter.

```java title="src/main/java/example/OrderPresenter.java"
OrderView toView(Order order) {
    return new OrderView(order.id(), shippingPolicy.canShip(order));
}
```

### Problem: serializer owns a business rule

The API serializer decides eligibility while other callers need the same rule.

```python title="orders/serializers.py"
def serialize_order(order):
    return {
        "id": order.id,
        "can_ship": order.status == "paid" and order.address_verified,
    }
```

### Better: serializer receives a policy result

The serializer only shapes output.

```python title="orders/serializers.py"
def serialize_order(order, shipping_policy):
    return {
        "id": order.id,
        "can_ship": shipping_policy.can_ship(order),
    }
```

### Problem: response mapping owns a domain decision

The HTTP layer decides whether an order can ship.

```rust title="src/orders/response.rs"
pub fn order_response(order: &Order) -> OrderResponse {
    OrderResponse {
        id: order.id,
        can_ship: order.status == Status::Paid && order.address_verified,
    }
}
```

### Better: response mapping receives domain policy

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
