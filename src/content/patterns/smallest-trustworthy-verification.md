---
title: >-
  Smallest Trustworthy Verification
summary: >-
  Run the cheapest check that can catch the likely failure before claiming the change is done.
status: stable
tags:
  - "workflow"
  - "testing"
  - "agents"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "csharp"
  - "java"
  - "js"
  - "python"
  - "rust"
problems:
  - "A change is marked done after either no check or an expensive unfocused check."
concepts:
  - "observable-behavior"
  - "agent-guidance"
related:
  - "observable-behavior-tests"
  - "separate-structure-from-behavior"
---

## Core Idea

Verification should match the risk of the change. A focused unit test, typecheck, build, route smoke
test, or visual check can catch the changed surface better than an expensive suite that misses it.
Choose a check that could fail for the mistake the change is likely to introduce.

Reach for this pattern when the likely failure mode is narrower than the full test suite, such as a
parser edge case, route render, type error, or formatting regression.

The main tradeoff is that a cheap check is not trustworthy when it would pass despite the likely
bug.

## Use When

- The likely failure mode is narrower than the full test suite, such as a parser edge case, route
  render, type error, or formatting regression.
- A local check can prove the changed surface still works before broad CI runs.
- An agent or reviewer needs a credible completion signal that distinguishes checked work from
  plausible but unverified edits.

## Guidance

- Choose the check based on what changed: format for formatting, typecheck for signatures, unit
  tests for logic, build for routes, and smoke tests for rendered UI.
- Run broader checks when shared contracts, generated artifacts, public behavior, or cross-module
  assumptions changed.
- Report exactly what passed and what was not run so the next person can judge residual risk without
  decoding your workflow.

## Tradeoffs

- A cheap check is not trustworthy when it would pass despite the likely bug.
- Broad refactors may need full suites even when local tests pass because the risk is distributed
  across many callers.
- Manual visual checks matter for UI work after automated checks pass, because layout, contrast, and
  interaction can fail outside type systems.

## Agent Instruction

Before calling work complete, run the smallest check that can catch the likely failure. State what
ran and do not imply broader verification than you performed.

## Examples

### Rust check aimed at the changed parser branch

The narrow test is trustworthy because it exercises the parser branch the change touched, before
broader CI runs.

```rust title="src/parser.rs"
#[test]
fn rejects_blank_pattern_names() {
    let error = parse_pattern_name("   ").unwrap_err();

    assert_eq!(error.kind(), ParseErrorKind::BlankName);
}
```

### JavaScript route smoke check

The route-level assertion is cheaper than a full browser suite but still catches a broken pattern
index render.

```js title="catalog.test.js"
test('pattern index renders stable entries', async () => {
  const response = await app.fetch('/patterns/');
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(html).toContain('Use a Guard Clause');
});
```

### C# checks the touched route

The smoke test can fail for the changed route without running the entire suite.

```csharp title="PatternRouteTests.cs"
[Fact]
public async Task PatternPageRenders()
{
    var response = await client.GetAsync("/patterns/guard-clause/");

    Assert.True(response.IsSuccessStatusCode);
}
```

### Java runs a focused parser test

The check targets the parser branch that changed.

```java title="PatternParserTest.java"
@Test
void rejectsBlankNames() {
    assertThrows(ParseException.class, () -> PatternName.parse("   "));
}
```

### Python smoke-tests the changed page

The route check is cheap but still catches a broken render path.

```python title="test_routes.py"
def test_guard_clause_page_renders(client):
    response = client.get("/patterns/guard-clause/")

    assert response.status_code == 200
```

## References

- Tidy First: behavior-preserving changes should stay small and easy to verify.
