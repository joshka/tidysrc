---
title: >-
  Test Observable Behavior
summary: >-
  Protect what callers can observe instead of freezing private implementation shape.
status: reviewed
tags:
  - "testing"
  - "review"
  - "legacy-code"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "c"
  - "cpp"
  - "csharp"
  - "go"
  - "java"
  - "js"
  - "python"
  - "rust"
  - "ts"
problems:
  - "Tests fail after harmless refactors because they assert private calls or structure."
concepts:
  - "observable-behavior"
related:
  - "characterize-before-changing"
  - "smallest-trustworthy-verification"
---

## Core Idea

Observable behavior tests protect the contract a caller would notice: returned values, errors,
rendered output, persisted state, events, or boundary side effects. They leave room to rename
helpers, move code, and simplify internals without rewriting tests. The test should fail when
behavior changes, not when the private route to that behavior changes.

Characterization tests are one form of observable behavior test: they record what existing code does
before a risky change, especially in legacy code. Observable behavior testing is the broader habit:
it also applies to new code and ordinary refactors where the important question is what callers can
observe.

Reach for this pattern when a test exists mainly to protect behavior through future refactors, so it
should describe the stable boundary instead of the current implementation path.

The main tradeoff is that some low-level algorithms need direct tests for edge cases because the
algorithm itself is the contract being maintained.

## Use When

- A test exists mainly to protect behavior through future refactors, so it should describe the
  stable boundary instead of the current implementation path.
- Private helper assertions make safe structure changes expensive by failing when a call graph
  changes even though callers see the same result.
- The API or user-visible output is the real contract, including errors, events, files, network
  calls, persistence, and generated UI.

## Guidance

- Assert outputs, persisted state, events, errors, and side effects the caller can observe at the
  cheapest boundary that still catches likely regressions.
- Use fixtures, snapshots, or golden files when the observable result is structured, but keep them
  focused enough that intentional changes remain reviewable.
- Keep private helper tests only when the helper is a real concept with its own contract, not a
  temporary decomposition detail.

## Tradeoffs

- Some low-level algorithms need direct tests for edge cases because the algorithm itself is the
  contract being maintained.
- Observable tests can be broader and slower; choose the cheapest trustworthy boundary instead of
  defaulting to end-to-end coverage.
- Treat logs, diagnostics, and API errors as observable contracts when callers depend on them.

## Agent Instruction

When adding or updating tests, prefer assertions against observable behavior. Avoid tests that only
prove a private helper was called unless that helper owns a real contract.

## Examples

### Parser contract

The test protects the returned parse result instead of asserting which helper consumed each field.

```c title="tests/parser_test.c"
void test_parse_title_field_sets_record_title(void) {
    struct record record = {0};

    bool ok = parse_field(&record, "title", "Release Notes");

    assert_true(ok);
    assert_string_equal(record.title, "Release Notes");
}
```

### Exported result

The test verifies the file contract rather than the renderer class or helper path used to build it.

```cpp title="tests/report_export_test.cpp"
TEST(ReportExport, WritesPdfWithReportTitle) {
    Report report = Report::with_title("Quarterly Review");

    ExportedFile file = export_pdf_report(report);

    EXPECT_EQ(file.content_type(), "application/pdf");
    EXPECT_THAT(file.bytes(), ContainsBytes("Quarterly Review"));
}
```

### Test the rendered result

The assertion checks what the rendered catalog exposes instead of pinning which helper sorted the
patterns.

```ts title="src/render.test.ts"
it('shows stable patterns first', () => {
  const html = renderCatalog([draftPattern, stablePattern]);

  expect(html.indexOf('Stable Pattern')).toBeLessThan(html.indexOf('Draft Pattern'));
});
```

### Visible UI state

The test protects what the dashboard renders instead of checking which renderer function was called.

```js title="renderDashboard.test.js"
it('shows the empty dashboard message', () => {
  const html = renderDashboard({ widgets: [] });

  expect(html).toContain('No widgets configured');
});
```

### Public search boundary

The test protects search behavior through the public search boundary, leaving internal indexing free
to change.

```rust title="tests/search.rs"
#[test]
fn finds_pattern_by_problem_terms() {
    let results = search(patterns(), "nested validation");

    assert!(results.iter().any(|pattern| pattern.slug == "guard-clause"));
}
```

### API behavior instead of internal calls

The test checks the returned pattern slugs instead of asserting how the search implementation walks
its data.

```go title="search_test.go"
func TestSearchFindsProblemTerms(t *testing.T) {
    results := Search(patterns, "nested validation")

    require.Contains(t, slugs(results), "guard-clause")
}
```

### Returned contract

The test protects the API result instead of the private helper used to sort it.

```csharp title="CatalogTests.cs"
[Fact]
public void StablePatternsAppearFirst()
{
    var page = catalog.Render(new[] { DraftPattern, StablePattern });

    Assert.True(page.Html.IndexOf("Stable") < page.Html.IndexOf("Draft"));
}
```

### Response body

The test leaves repository and mapper internals free to change.

```java title="CatalogRouteTest.java"
@Test
void rendersStablePattern() {
    var response = route.get("/patterns");

    assertThat(response.body()).contains("Use a Guard Clause");
}
```

### Command result

The assertion checks the behavior the CLI user sees, not which helper built it.

```python title="test_catalog_cli.py"
def test_lists_stable_patterns_first():
    output = run_cli("patterns", "--stable-first")

    assert output.index("Stable Pattern") < output.index("Draft Pattern")
```

## References

- Working Effectively with Legacy Code: characterize behavior before refactoring.
