---
title: >-
  Tests Freeze Private Shape
status: draft
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

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

These tests make code harder to improve. They turn harmless refactors into test rewrites, train

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

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

### Problem: test verifies a private call

The test fails when implementation shape changes but behavior stays the same.

```csharp title="Billing/InvoiceTests.cs"
processor.Process(invoice);
gateway.Verify(x => x.CalculateTax(invoice), Times.Once);
```

### Better: test verifies the observable result

The test protects the invoice total callers see.

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

The assertion targets the behavior the caller depends on.

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

The internal shape can change without losing coverage.

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

The assertion checks the behavior the caller receives.

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

The test protects what users see.

```ts title="src/invoice.test.ts"
renderInvoice(invoice);
expect(screen.getByText('$110.00')).toBeVisible();
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
