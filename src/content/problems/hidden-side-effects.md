---
title: >-
  Hidden Side Effects
status: reviewed
category: side-effects
topics:
  - mutation
  - io
  - review
summary: >-
  A call reads like a calculation but mutates state, touches external systems, reads time, or starts
  work.
relatedPatterns:
  - make-side-effects-visible
  - inject-time-and-randomness
  - keep-async-boundaries-explicit
  - preparatory-refactor
  - test-observable-behavior
relatedConcepts:
  - side-effect-visibility
  - temporal-coupling
  - observable-behavior
---

## Description

A call reads like a calculation but mutates state, touches external systems, reads time, or starts
work.

Effects are normal at system boundaries. The problem appears when the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Hidden effects make review depend on implementation inspection. A maintainer cannot judge whether a
call is safe to move, repeat, skip, or cache by reading the call site alone.

Reviewers care because the risk is hidden behind a harmless-looking name. They have to reconstruct
ordering, state changes, and external work from implementation details before they can tell whether
the change is safe.

Hidden effects also remove good sensing points for tests. If a method only changes collaborators,
UI state, or external systems, the test has no simple return value or state boundary to assert
against.

## Code Impact

Hidden side effects create accidental ordering constraints. A helper that mutates an argument,
records an audit event, reads the clock, or starts background work cannot be freely reordered even
when its name looks pure.

Tests often protect one successful call path while missing repeat calls, skipped calls, or moved
calls. That leaves the side effect as an implementation detail instead of an observable contract.

## Signals

- A helper named like a formatter, mapper, or calculator writes to storage or mutates its arguments.
- A code path reads the clock, random source, process environment, or global state from inside
  business logic.
- A review comment asks whether a call is safe to move, repeat, or skip.
- Tests need extensive setup because a pure-looking function depends on process state.

## Diagnostic Questions

- What does this call change outside its return value?
- Can the effect be seen from the function name, receiver, return type, or statement shape?
- Should the effect be passed in as a dependency or moved to a boundary?
- What verification would catch the effect happening at the wrong time?

## Approach

- [Make side effects visible](/patterns/make-side-effects-visible/) by moving mutation, external
  calls, and background work into a named statement or boundary.
- [Inject time and randomness](/patterns/inject-time-and-randomness/) when ambient clocks, timers,
  random sources, or generated IDs make behavior depend on process state.
- [Keep async boundaries explicit](/patterns/keep-async-boundaries-explicit/) when the hidden effect
  starts work that may finish after the caller returns.
- Use a [preparatory refactor](/patterns/preparatory-refactor/) to extract framework hooks into
  plain command methods before testing UI, callback, or event-driven code.
- [Test observable behavior](/patterns/test-observable-behavior/) by splitting command work from
  query work when a calculation is mixed with an effect.
- Use the [smallest trustworthy verification](/patterns/smallest-trustworthy-verification/) that
  can catch the effect happening at the wrong time, being skipped, or running more than once.

## Examples

### Problem: formatter writes audit state

The call reads like formatting, but it mutates shared audit data.

```csharp title="Invoices/InvoiceFormatter.cs"
public string FormatInvoice(Invoice invoice)
{
    audit.RecordViewed(invoice.Id);
    return $"{invoice.Number}: {invoice.Total:C}";
}
```

### Better: effect is named before formatting

The caller can review the mutation and formatting as separate steps.

```csharp title="Invoices/InvoiceService.cs"
public string ViewInvoice(Invoice invoice)
{
    audit.RecordViewed(invoice.Id);
    return invoiceFormatter.Format(invoice);
}
```

### Problem: A mapper mutates its input

The name reads like a pure transformation, but the call changes shared state.

```java title="src/main/java/example/InvoiceMapper.java"
InvoiceView toView(Invoice invoice) {
    invoice.markViewed();
    return new InvoiceView(invoice.id(), invoice.total());
}
```

### Better: Mutation is named at the call site

The effect happens through an operation whose name prepares the reader for state change.

```java title="src/main/java/example/InvoiceService.java"
InvoiceView markViewedAndLoadView(Invoice invoice) {
    invoice.markViewed();
    return invoiceViews.from(invoice);
}
```

### Problem: helper reads ambient time

The function looks deterministic, but tests depend on the wall clock.

```python title="billing/invoices.py"
def invoice_status(invoice):
    if invoice.due_at < datetime.now():
        return "overdue"
    return "open"
```

### Better: caller passes the time dependency

The hidden input becomes part of the behavior under review.

```python title="billing/invoices.py"
def invoice_status(invoice, now):
    if invoice.due_at < now:
        return "overdue"
    return "open"
```

### Problem: conversion publishes an event

The function name suggests a pure conversion, but it publishes an external event.

```rust title="src/invoices.rs"
pub fn to_view(invoice: &Invoice, bus: &EventBus) -> InvoiceView {
    bus.publish(Event::InvoiceViewed(invoice.id));
    InvoiceView::from(invoice)
}
```

### Better: effectful operation names the event

The event is visible before the pure conversion.

```rust title="src/invoices.rs"
pub fn record_view_and_convert(invoice: &Invoice, bus: &EventBus) -> InvoiceView {
    bus.publish(Event::InvoiceViewed(invoice.id));
    InvoiceView::from(invoice)
}
```

### Problem: selector writes to storage

The name reads like a query, but the call changes browser state.

```ts title="src/preferences/selectTheme.ts"
export function selectedTheme(user: User) {
  localStorage.setItem('lastThemeLookup', user.id);
  return user.theme ?? 'system';
}
```

### Better: effect is split from selection

The write and the calculation have separate names.

```ts title="src/preferences/selectTheme.ts"
export function rememberThemeLookup(user: User) {
  localStorage.setItem('lastThemeLookup', user.id);
}

export function selectedTheme(user: User) {
  return user.theme ?? 'system';
}
```

### Problem: total calculation changes cart state

The function reads like a calculation, but it marks the cart as discounted.

```c title="src/cart_total.c"
Money cart_total(Cart *cart) {
    if (cart->coupon_code != NULL) {
        cart->discount_applied = true;
        return money_sub(cart->subtotal, coupon_discount(cart->coupon_code));
    }

    return cart->subtotal;
}
```

### Better: discount application is explicit

The state change happens in a named operation before the total is read.

```c title="src/cart_total.c"
void apply_coupon_discount(Cart *cart) {
    if (cart->coupon_code == NULL) {
        return;
    }

    cart->discount = coupon_discount(cart->coupon_code);
    cart->discount_applied = true;
}

Money cart_total(const Cart *cart) {
    return money_sub(cart->subtotal, cart->discount);
}
```

### Problem: query method writes audit data

A method named like a query writes to the audit log.

```cpp title="src/invoices.cpp"
InvoiceView InvoiceService::view_for(const Invoice& invoice) {
    audit_log.record_view(invoice.id());
    return InvoiceView::from(invoice);
}
```

### Better: effectful name owns the write

The method name tells callers that the audit effect is part of the operation.

```cpp title="src/invoices.cpp"
InvoiceView InvoiceService::record_view_and_render(const Invoice& invoice) {
    audit_log.record_view(invoice.id());
    return InvoiceView::from(invoice);
}
```

### Problem: label helper emits a metric

A helper used from templates changes process-wide metrics.

```go title="internal/invoices/label.go"
func InvoiceLabel(invoice Invoice) string {
    metrics.Count("invoice_label_rendered")
    return invoice.Number
}
```

### Better: rendering owns the metric

The effect moves to the operation where rendering is the visible behavior.

```go title="internal/invoices/view.go"
func RenderInvoice(invoice Invoice) string {
    metrics.Count("invoice_rendered")
    return InvoiceLabel(invoice)
}
```

### Problem: price helper sends analytics

The helper looks like formatting, but every call sends an event.

```js title="src/pricing/priceLabel.js"
export function priceLabel(product) {
  analytics.track('price_viewed', { sku: product.sku });
  return `$${product.price.toFixed(2)}`;
}
```

### Better: effect is separate from formatting

The analytics call is visible at the UI boundary.

```js title="src/pricing/priceLabel.js"
export function trackPriceViewed(product) {
  analytics.track('price_viewed', { sku: product.sku });
}

export function priceLabel(product) {
  return `$${product.price.toFixed(2)}`;
}
```

## References

- Michael Feathers, [Working Effectively with Legacy Code](/references/#working-effectively-with-legacy-code),
  Chapter 10, “The Case of the Undetectable Side Effect.”
