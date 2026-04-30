---
title: >-
  Characterize Before Changing
summary: >-
  Pin observable behavior before changing risky legacy code, even when the current behavior is
  awkward.
status: draft
tags:
  - "legacy-code"
  - "testing"
  - "workflow"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "csharp"
  - "go"
  - "java"
  - "python"
  - "rust"
  - "ts"
problems:
  - "Nobody is sure which quirks are bugs and which are depended-on behavior."
concepts:
  - "observable-behavior"
related:
  - "observable-behavior-tests"
  - "smallest-trustworthy-verification"
  - "separate-structure-from-behavior"
---

## Core Idea

Characterization is a safety move before it is a design move. In unfamiliar or under-tested code,
the first job is to learn what callers can observe today, including behavior that looks accidental.
Once that behavior is pinned, the team can decide what to preserve, what to fix, and which change
actually moved the system.

Reach for this pattern when the code is hard to understand and lacks reliable tests, so a refactor
would otherwise depend on the editor’s confidence alone.

The main tradeoff is that characterization tests can preserve bugs; mark suspicious behavior clearly
so the test records today’s contract without declaring it desirable.

## Use When

- The code is hard to understand and lacks reliable tests, so a refactor would otherwise depend on
  the editor’s confidence alone.
- Consumers may depend on surprising behavior, including strange defaults, formatting quirks, or
  edge-case outputs that are not documented.
- A refactor or bug fix could accidentally change public output, error shape, persistence, or
  integration behavior while appearing local.

## Guidance

- Write tests around inputs and outputs that callers can observe, not around private helper calls
  that the refactor is allowed to change.
- Name the test after the behavior, not the implementation, so future readers understand what
  contract is being protected.
- Pin the behavior, make one focused change, and rerun the characterization test to separate
  discovery from change.

## Tradeoffs

- Characterization tests can preserve bugs; mark suspicious behavior clearly so the test records
  today’s contract without declaring it desirable.
- Do not overfit tests to private helper calls or exact formatting unless that detail is truly part
  of the external contract.
- Tiny obvious changes may only need a narrow check; risky legacy areas need a behavior pin before
  structure moves.

## Agent Instruction

Before changing risky legacy code, add or identify a behavior-level test that would fail if callers
see a different result. Preserve suspicious behavior first, then change it deliberately.

## Examples

### Pin current Java behavior

The test records today’s externally visible discount behavior before changing legacy pricing
internals.

```java title="LegacyInvoiceTest.java"
@Test
void keepsBlankDiscountCodeAsZeroDiscount() {
    var invoice = legacyPricing.price(orderWithDiscountCode(""));

    assertEquals(Money.zero(), invoice.discount());
}
```

### Rust golden test for parser output

The test captures the parser’s current empty-field output so a parser refactor cannot silently
change that boundary.

```rust title="tests/parser.rs"
#[test]
fn preserves_legacy_empty_field_behavior() {
    let record = parse_record("name,,active").unwrap();

    assert_eq!(record.middle_name, Some(String::new()));
}
```

### Go test captures the legacy discount rule

The test records a surprising expired-coupon behavior before the pricing code is reorganized.

```go title="pricing_test.go"
func TestExpiredCouponKeepsLegacyDiscount(t *testing.T) {
    invoice := Invoice{
        Subtotal: Money(100),
        Coupon:  Coupon{Code: "SPRING", Expired: true},
    }

    got := Price(invoice)

    require.Equal(t, Money(90), got.Total)
}
```

### C# pins legacy output before refactoring

The test records the visible invoice total before pricing internals move.

```csharp title="LegacyPricingTests.cs"
[Fact]
public void BlankCouponKeepsCurrentTotal()
{
    var invoice = LegacyPricing.Price(OrderWithCoupon(""));

    Assert.Equal(Money.Zero, invoice.Discount);
}
```

### Python captures a surprising parser edge

The test records current behavior without claiming the behavior is desirable.

```python title="test_legacy_parser.py"
def test_blank_middle_field_is_preserved():
    record = parse_record("name,,active")

    assert record.middle_name == ""
```

### TypeScript characterizes generated output

The snapshot pins the boundary output before renderer internals are reorganized.

```ts title="legacyRenderer.test.ts"
it('keeps legacy empty summary markup', () => {
  expect(renderPattern({ title: 'Guard', summary: '' })).toContain('<p></p>');
});
```

## References

- Working Effectively with Legacy Code: characterization tests.
