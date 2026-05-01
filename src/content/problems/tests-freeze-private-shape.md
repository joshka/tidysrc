---
title: >-
  Tests Freeze Private Shape
status: reviewed
category: testing
topics:
  - observable-behavior
  - refactoring
  - test-design
summary: >-
  A test fails when internals move even though the user-visible behavior has not changed.
relatedPatterns:
  - test-observable-behavior
  - smallest-trustworthy-verification
relatedConcepts:
  - observable-behavior
---

## Description

A test fails when internals move even though the user-visible behavior has not changed.

The test protects the route the implementation currently takes instead of the result callers
observe. It verifies helper calls, private ordering, intermediate values, or mocks that encode
today's shape. A harmless extraction, rename, or reordering then looks like a regression.

Private-shape assertions are sometimes right: a helper may be a real contract, an algorithm may need
an invariant test, or a performance-sensitive path may require a specific call shape. The problem is
asserting private shape when the stable contract is [observable behavior](/concepts/observable-behavior/).

## Why It Matters

These tests make code harder to improve. They turn harmless refactors into test rewrites and make
incidental structure feel mandatory.

The worse failure is false confidence. A suite can stay green because the same helper was called,
while the returned value, rendered output, persisted state, or user-visible error is wrong.

## Code Impact

The code impact is friction around structure changes. Refactors require coordinated test rewrites,
mocks grow to mirror implementation details, and tests fail in files that do not explain the
behavior being protected.

That friction pushes teams away from improving design. It also makes review noisy because the diff
mixes real behavior protection with assertions that only restate the old implementation path.

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

- Move assertions toward [observable behavior](/concepts/observable-behavior/): outputs, errors,
  side effects, persisted state, or collaborator contracts.
- Keep private-shape assertions only when the shape itself is the contract, such as ordering
  guarantees or performance-sensitive calls.
- When replacing brittle tests, keep enough coverage to protect the behavior before deleting the old
  assertions.
- Use [test observable behavior](/patterns/test-observable-behavior/) as the default replacement.
- Use the [smallest trustworthy verification](/patterns/smallest-trustworthy-verification/) that
  would catch the likely behavior regression.

## Examples

### Problem: test verifies a private call

The test fails when implementation shape changes but behavior stays the same.

```csharp title="Billing/InvoiceTests.cs"
processor.Process(invoice);
gateway.Verify(x => x.CalculateTax(invoice), Times.Once);
```

### Better: test verifies the observable result

The test protects the invoice total callers see. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```csharp title="Billing/InvoiceTests.cs"
var result = processor.Process(invoice);
Assert.Equal(InvoiceStatus.Ready, result.Status);
Assert.Equal(110m, result.Total);
```

### Problem: mock freezes helper order

The test encodes the current call path.

```java title="src/test/java/example/InvoiceTest.java"
verify(taxCalculator).calculate(invoice);
verify(totalCalculator).sum(invoice);
```

### Better: test checks output behavior

The assertion targets the behavior the caller depends on. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```java title="src/test/java/example/InvoiceTest.java"
var processed = processor.process(invoice);
assertThat(processed.total()).isEqualByComparingTo("110.00");
```

### Problem: test asserts private helper use

Renaming or extracting the helper breaks the test.

```python title="tests/test_invoice.py"
processor.process(invoice)
processor._calculate_tax.assert_called_once_with(invoice)
```

### Better: test asserts output behavior

The internal shape can change without losing coverage. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```python title="tests/test_invoice.py"
processed = processor.process(invoice)
assert processed.total == Decimal("110.00")
```

### Problem: test freezes intermediate structure

The test depends on how the result is assembled.

```rust title="src/invoice.rs"
assert_eq!(build_steps(invoice), vec!["tax", "total", "status"]);
```

### Better: test protects observable output

The assertion checks the behavior the caller receives. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```rust title="src/invoice.rs"
let processed = process_invoice(invoice);
assert_eq!(processed.total, dec!(110.00));
```

### Problem: test asserts helper calls

The component cannot be refactored without changing the test.

```ts title="src/invoice.test.ts"
renderInvoice(invoice);
expect(formatMoney).toHaveBeenCalledWith(invoice.total);
```

### Better: test asserts rendered behavior

The test protects what users see. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```ts title="src/invoice.test.ts"
renderInvoice(invoice);
expect(screen.getByText('$110.00')).toBeVisible();
```

### Problem: test freezes parser helper calls

The test fails if parsing is reorganized, even when the parsed record is unchanged.

```c title="src/example.c"
parse_field(&record, "title", "Release Notes");
parse_field(&record, "status", "draft");

assert_int_equal(2, record.field_count);
```

### Better: test the parsed result

The test protects the record callers receive. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```c title="src/example.c"
struct record record = parse_record("title=Release Notes\nstatus=draft");

assert_string_equal("Release Notes", record.title);
assert_string_equal("draft", record.status);
```

### Problem: test freezes exporter internals

The test asserts which helper builds the file instead of the file contract.

```cpp title="src/example.cpp"
EXPECT_CALL(writer, write_header());
EXPECT_CALL(writer, write_rows(_));

export_report(report, writer);
```

### Better: test the exported file

The test protects what downstream consumers read. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```cpp title="src/example.cpp"
auto file = export_report(report);

EXPECT_THAT(file.contents(), HasSubstr("Report ID,Status"));
EXPECT_THAT(file.contents(), HasSubstr("R-42,ready"));
```

### Problem: test freezes repository call shape

The test fails if search stops calling one helper directly.

```go title="internal/example/service.go"
repo.On("FindBySlug", "guard-clause").Return(pattern)

result := Search(repo, "guard-clause")
require.Equal(t, pattern, result[0])
```

### Better: test search behavior

The test protects the API result instead of the private lookup path. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```go title="internal/example/service.go"
results := Search(index, "guard-clause")

require.Equal(t, []string{"guard-clause"}, slugs(results))
```

### Problem: test freezes formatter calls

The test fails when the component stops calling a particular formatter.

```js title="src/example.js"
renderInvoice(invoice);

expect(formatMoney).toHaveBeenCalledWith(invoice.total);
```

### Better: test rendered text

The test protects what the user sees. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```js title="src/example.js"
renderInvoice(invoice);

expect(screen.getByText('$110.00')).toBeVisible();
```
