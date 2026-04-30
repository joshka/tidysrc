---
title: >-
  Hidden side effects
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

## Impact

Hidden effects make review depend on implementation inspection. A maintainer cannot judge ordering,
retries, or failure behavior from the call site, and tests often become broad because the real input
or output is invisible.

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

### Problem: C# formatter writes audit state

The call reads like formatting, but it mutates shared audit data.

```csharp title="Invoices/InvoiceFormatter.cs"
public string FormatInvoice(Invoice invoice)
{
    audit.RecordViewed(invoice.Id);
    return $"{invoice.Number}: {invoice.Total:C}";
}
```

### Better: C# effect is named before formatting

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

### Problem: Python helper reads ambient time

The function looks deterministic, but tests depend on the wall clock.

```python title="billing/invoices.py"
def invoice_status(invoice):
    if invoice.due_at < datetime.now():
        return "overdue"
    return "open"
```

### Better: Python caller passes the time dependency

The hidden input becomes part of the behavior under review.

```python title="billing/invoices.py"
def invoice_status(invoice, now):
    if invoice.due_at < now:
        return "overdue"
    return "open"
```

### Problem: Rust conversion publishes an event

The function name suggests a pure conversion, but it performs I/O.

```rust title="src/invoices.rs"
pub fn to_view(invoice: &Invoice, bus: &EventBus) -> InvoiceView {
    bus.publish(Event::InvoiceViewed(invoice.id));
    InvoiceView::from(invoice)
}
```

### Better: Rust effectful operation names the event

The event is visible before the pure conversion.

```rust title="src/invoices.rs"
pub fn record_view_and_convert(invoice: &Invoice, bus: &EventBus) -> InvoiceView {
    bus.publish(Event::InvoiceViewed(invoice.id));
    InvoiceView::from(invoice)
}
```

### Problem: TypeScript selector writes to storage

The name reads like a query, but the call changes browser state.

```ts title="src/preferences/selectTheme.ts"
export function selectedTheme(user: User) {
  localStorage.setItem('lastThemeLookup', user.id);
  return user.theme ?? 'system';
}
```

### Better: TypeScript effect is split from selection

The write and the calculation have separate names.

```ts title="src/preferences/selectTheme.ts"
export function rememberThemeLookup(user: User) {
  localStorage.setItem('lastThemeLookup', user.id);
}

export function selectedTheme(user: User) {
  return user.theme ?? 'system';
}
```
