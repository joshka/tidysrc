---
title: >-
  Cohesion
summary: >-
  How strongly the parts of a module, type, or function belong to one concept.
status: seed
tags:
  - "architecture"
  - "readability"
  - "organization"
relatedPatterns:
  - "strengthen-cohesion"
  - "reader-locality"
  - "move-domain-rules-inward"
---

## Why it matters

Cohesion is the positive side of locality. Related facts and behavior should live together when that
lets a reader understand one concept without assembling it from fragments.

Low cohesion shows up as modules grouped by technical category rather than by the thing that changes
together. High cohesion can still need internal structure, but the outer concept is clear.

## How to apply it

Ask whether the pieces in a module change for the same reason. If they do, strengthen the concept.
If they do not, split the responsibilities before the file becomes a bucket.

## Examples

### Low cohesion: billing module holds unrelated helpers

The file is named for a domain area, but the functions change for different reasons.

```ts title="src/billing.ts"
export function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function sendInvoiceEmail(invoice: Invoice) {
  return mailer.send(invoice.customerEmail, renderInvoice(invoice));
}
```

### Better: one module owns one reason to change

Formatting and delivery can change independently.

```ts title="src/billing/invoice-mailer.ts"
export function sendInvoiceEmail(invoice: Invoice) {
  return mailer.send(invoice.customerEmail, renderInvoice(invoice));
}
```
