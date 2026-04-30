---
title: >-
  Tests freeze private shape
status: draft
category: testing
topics:
  - observable-behavior
  - refactoring
  - test-design
summary: >-
  A test fails when internals move even though the user-visible behavior has not changed.
relatedPatterns:
  - observable-behavior-tests
  - smallest-trustworthy-verification
relatedConcepts:
  - observable-behavior
---

## Impact

These tests make code harder to improve. They turn harmless refactors into test rewrites, train
developers to avoid cleanup, and give agents false confidence because the suite is sensitive to the
wrong thing.

## Signals

- Tests assert private helper calls, exact internal ordering, or intermediate data that users never
  observe.
- A pure extraction or rename requires widespread test changes.
- Mocks encode implementation details instead of collaborator behavior.
- The test suite is noisy during structural changes but misses real output regressions.

## Diagnostic Questions

- What behavior would a user, caller, or downstream system actually observe?
- Could the same behavior be produced by a different internal shape?
- Is the mock verifying a contract or only the current implementation path?
- Would this assertion survive a legitimate refactor?

## Approach

- Move assertions toward outputs, errors, side effects, persisted state, or collaborator contracts.
- Keep private-shape assertions only when the shape itself is the contract, such as ordering
  guarantees or performance-sensitive calls.
- When replacing brittle tests, keep enough coverage to protect the behavior before deleting the old
  assertions.
- For agents, make the verification target explicit so they do not satisfy the suite by preserving
  accidental internals.

## Examples

### Problem: C# test verifies a private call

The test fails when implementation shape changes but behavior stays the same.

```csharp title="Billing/InvoiceTests.cs"
processor.Process(invoice);
gateway.Verify(x => x.CalculateTax(invoice), Times.Once);
```

### Better: C# test verifies the observable result

The test protects the invoice total callers see.

```csharp title="Billing/InvoiceTests.cs"
var result = processor.Process(invoice);
Assert.Equal(InvoiceStatus.Ready, result.Status);
Assert.Equal(110m, result.Total);
```

### Problem: Java mock freezes helper order

The test encodes the current call path.

```java title="src/test/java/example/InvoiceTest.java"
verify(taxCalculator).calculate(invoice);
verify(totalCalculator).sum(invoice);
```

### Better: Java test checks output behavior

The assertion targets the behavior the caller depends on.

```java title="src/test/java/example/InvoiceTest.java"
var processed = processor.process(invoice);
assertThat(processed.total()).isEqualByComparingTo("110.00");
```

### Problem: Python test asserts private helper use

Renaming or extracting the helper breaks the test.

```python title="tests/test_invoice.py"
processor.process(invoice)
processor._calculate_tax.assert_called_once_with(invoice)
```

### Better: Python test asserts output behavior

The internal shape can change without losing coverage.

```python title="tests/test_invoice.py"
processed = processor.process(invoice)
assert processed.total == Decimal("110.00")
```

### Problem: Rust test freezes intermediate structure

The test depends on how the result is assembled.

```rust title="src/invoice.rs"
assert_eq!(build_steps(invoice), vec!["tax", "total", "status"]);
```

### Better: Rust test protects observable output

The assertion checks the behavior the caller receives.

```rust title="src/invoice.rs"
let processed = process_invoice(invoice);
assert_eq!(processed.total, dec!(110.00));
```

### Problem: TypeScript test asserts helper calls

The component cannot be refactored without changing the test.

```ts title="src/invoice.test.ts"
renderInvoice(invoice);
expect(formatMoney).toHaveBeenCalledWith(invoice.total);
```

### Better: TypeScript test asserts rendered behavior

The test protects what users see.

```ts title="src/invoice.test.ts"
renderInvoice(invoice);
expect(screen.getByText('$110.00')).toBeVisible();
```
