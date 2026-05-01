---
title: >-
  Reader Locality
summary: >-
  Keep helper functions and related concepts close to the code that needs them, especially when the
  abstraction is weak.
status: reviewed
tags:
  - "readability"
  - "organization"
  - "review"
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
  - "The reader has to jump between weak helpers to understand one change."
concepts:
  - "reader-locality"
  - "cognitive-burden"
related:
  - "chunk-statements"
  - "explaining-variable"
  - "extract-helper-after-locality"
---

## Core Idea

Reader Locality is about reducing the number of jumps a maintainer must make to understand one
change. A helper, type, or module earns distance only when its name and contract carry enough
meaning on their own. When an abstraction is weak, keeping it near the caller is often clearer than
moving it into a shared layer that forces every reader to reconstruct the context.

This shows up in ordinary code review: a one-off formatter moved into `utils`, a parser used by one
import path moved into a shared package, or a tiny helper extracted below a vague name like
`processRows`. The code is not always worse because it has more lines. It is worse when the reader
has to leave the workflow to learn a helper that only makes sense in that workflow.

A helper, type, or module should usually stay near one caller when moving it away would make that
caller harder to read.

The main tradeoff is that strong reusable concepts can live farther away if their contract is clear
enough that callers do not need to inspect the implementation.

## Use When

- A helper, type, or module only makes sense beside one caller, and moving it away would make the
  caller harder to read.
- A review requires jumping across files to understand one local behavior, especially when the
  destination file does not expose a durable domain concept.
- A proposed extraction reduces line count but increases the reader’s live mental stack by adding
  names, files, or ordering rules they must remember.

## Guidance

- Put the central item first, then place weak helper functions near the caller that gives them
  meaning so the reader can follow the workflow top to bottom.
- Extract only concepts that have semantic coherence and can be understood locally from their name,
  inputs, outputs, and surrounding module.
- Keep small repetition when it leaves less review work than a distant abstraction.

## Tradeoffs

- Strong reusable concepts can live farther away if their contract is clear enough that callers do
  not need to inspect the implementation.
- Generated code and framework conventions may impose a different file shape; respect those
  boundaries when fighting them would make the project less idiomatic.
- Do not use locality as an excuse to leave unrelated responsibilities fused together; locality
  should reduce reader burden, not hide missing design boundaries.

## Agent Instruction

Before extracting or moving code, check whether the new location reduces the reader’s live context.
Keep weak helpers near their caller and prefer repo-local organization over generic architecture.

## Examples

### Keep the parser beside the import path

The parser only explains this import path, so keeping it local avoids a distant weak helper.

```c title="src/import_users.c"
ImportResult import_users(const char *csv) {
    UserRows rows = parse_user_rows(csv);
    return save_users(rows);
}

static UserRows parse_user_rows(const char *csv) {
    return user_rows_from_csv(csv);
}
```

### Keep the formatter beside the response

The formatter belongs to one endpoint response, not a shared utility namespace.

```cpp title="src/pattern_endpoint.cpp"
PatternResponse response_for(const Pattern& pattern) {
    return PatternResponse{
        pattern.slug(),
        display_title(pattern),
        pattern.summary(),
    };
}

static std::string display_title(const Pattern& pattern) {
    return pattern.status_label() + ": " + pattern.title();
}
```

### Keep the helper beside the workflow it explains

The helper functions are not broad abstractions; they explain the phases of this report workflow and
stay close to the caller that gives them meaning.

```rust title="src/report.rs"
pub fn render_report(input: ReportInput) -> Result<String, ReportError> {
    let rows = collect_rows(input)?;
    let totals = summarize_rows(&rows);

    Ok(format_report(rows, totals))
}

fn collect_rows(input: ReportInput) -> Result<Vec<Row>, ReportError> {
    input.records.into_iter().map(Row::try_from).collect()
}

fn summarize_rows(rows: &[Row]) -> Totals {
    rows.iter().fold(Totals::default(), Totals::add_row)
}
```

### Keep a page-local formatter local until it becomes a concept

The search text formatter belongs to the catalog page, so keeping it local avoids a generic utility
for one behavior.

```ts title="src/patterns/format.ts"
export function patternSearchText(pattern: Pattern): string {
  return [
    pattern.title,
    pattern.summary,
    pattern.tags.join(' '),
    pattern.problems.join(' '),
  ].join(' ').toLowerCase();
}
```

### Keep the private parser beside its caller

The parser only explains this import path, so keeping it local avoids a distant weak helper.

```csharp title="ImportUsers.cs"
public ImportResult ImportUsers(string csv)
{
    var rows = ParseRows(csv);
    return SaveUsers(rows);
}

static IReadOnlyList<UserRow> ParseRows(string csv)
{
    return csv.Split('\n').Select(UserRow.Parse).ToList();
}
```

### Keep the grouping helper near the report

The helper describes one report and stays beside the workflow that gives it meaning.

```go title="reports/publish.go"
func RenderPublishReport(rows []Row) string {
    grouped := groupByOwner(rows)
    return renderTable(grouped)
}

func groupByOwner(rows []Row) map[Owner][]Row {
    grouped := map[Owner][]Row{}
    for _, row := range rows {
        grouped[row.Owner] = append(grouped[row.Owner], row)
    }
    return grouped
}
```

### Keep the response formatter near the endpoint

The formatter belongs to one endpoint response, not a shared utility package.

```java title="PatternEndpoint.java"
PatternResponse responseFor(Pattern pattern) {
    return new PatternResponse(
        pattern.slug(),
        displayTitle(pattern),
        pattern.summary()
    );
}

private String displayTitle(Pattern pattern) {
    return pattern.status().label() + ": " + pattern.title();
}
```

### Keep a page-local formatter local

The search text formatter belongs to the catalog page, so keeping it local avoids a generic utility
for one behavior.

```js title="src/patterns/format.js"
export function patternSearchText(pattern) {
  return [
    pattern.title,
    pattern.summary,
    pattern.tags.join(' '),
    pattern.problems.join(' '),
  ].join(' ').toLowerCase();
}
```

### Keep a grouping helper near its report

The helper describes one report and stays beside the workflow that gives it meaning.

```python title="reports/publish.py"
def render_publish_report(rows):
    grouped = group_by_owner(rows)
    return render_table(grouped)

def group_by_owner(rows):
    return {
        owner: list(items)
        for owner, items in itertools.groupby(rows, key=lambda row: row.owner)
    }
```

## References

- [Ed Page’s Rust Style: Central item first
  (M-ITEM-TOC)](https://epage.github.io/dev/rust-style/#m-item-toc)
- [Ed Page’s Rust Style: Caller then callee
  (M-CALLER-CALLEE)](https://epage.github.io/dev/rust-style/#m-caller-callee)
- [Tidy First?: Reading Order](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch05.html)
- [Tidy First?: Cohesion Order](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch06.html)
