---
title: >-
  Hidden Side Effects
status: draft
category: side-effects
topics:
  - mutation
  - io
  - review
summary: >-
  A call reads like a calculation but mutates state, performs I/O, reads time, or starts external
  work.
relatedPatterns:
  - make-side-effects-visible
  - inject-time-and-randomness
  - keep-async-boundaries-explicit
relatedConcepts:
  - side-effect-visibility
  - temporal-coupling
  - observable-behavior
---

## Description

A call reads like a calculation but mutates state, performs I/O, reads time, or starts external
work.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Hidden effects make review depend on implementation inspection. A maintainer cannot judge ordering,

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

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

- Separate calculation from mutation or I/O when the ordering matters.
- Rename or reshape effectful boundaries so the side effect is visible at the call site.
- Pass time, randomness, clients, stores, or publishers explicitly when ambient access hides
  behavior.
- Test the observable effect at the smallest boundary that can catch ordering or failure
  regressions.

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

The function name suggests a pure conversion, but it performs I/O.

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
