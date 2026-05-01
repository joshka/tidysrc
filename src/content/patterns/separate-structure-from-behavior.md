---
title: >-
  Separate Structure from Behavior
summary: >-
  Keep tidying changes separate from behavior changes when mixing them would make review or
  rollback harder.
status: reviewed
tags:
  - "workflow"
  - "review"
  - "refactoring"
  - "legacy-code"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "csharp"
  - "java"
  - "python"
  - "rust"
  - "ts"
problems:
  - "A diff mixes renames, moves, formatting, and behavior changes in one review unit."
concepts:
  - "structure-vs-behavior"
related:
  - "preparatory-refactor"
  - "characterize-before-changing"
  - "smallest-trustworthy-verification"
---

## Core Idea

Structure and behavior fail in different ways. A rename, move, extraction, or formatting pass should
be reviewable as behavior-preserving when no output, error, or side effect changes. A behavior
change should expose the new rule. Separate units give reviewers a smaller diff, tests a clearer
job, and rollback a narrower target.

Reach for this pattern when the structural change can be verified independently, such as a rename,
move, extraction, or formatting change that should preserve behavior.

The main tradeoff is that tiny local cleanups can stay with behavior if separation would add process
noise and the cleanup is plainly inseparable from the changed lines.

## Use When

- The structural change can be verified independently, such as a rename, move, extraction, or
  formatting change that should preserve behavior.
- The behavior change is easier to review after a small tidy because the tidy removes incidental
  noise around the real rule.
- Rollback would be risky if cleanup and logic are fused, especially when a bug fix might need to be
  reverted without losing valuable structure.

## Guidance

- Make pure structure changes first when they lower risk for the behavior change and can be checked
  without understanding the new behavior.
- Keep the behavior-preserving change mechanically reviewable by avoiding opportunistic edits
  outside the changed path.
- Run the smallest trustworthy check after each unit so accidental behavior movement is caught
  before the behavioral diff starts.

## Tradeoffs

- Tiny local cleanups can stay with behavior if separation would add process noise and the cleanup
  is plainly inseparable from the changed lines.
- Do not tidy unrelated areas because a behavior change is nearby; that expands review scope without
  lowering risk.
- Legacy code may need characterization tests before either change is safe, because “structure-only”
  is hard to prove without a behavior signal.

## Agent Instruction

If a requested behavior change needs tidying, separate the behavior-preserving structure change from
the behavior change unless the cleanup is tiny and local. Verify each unit independently.

## Examples

### Structure-only rename before logic

The rename can be reviewed as a behavior-preserving step before the rule changes from “not archived”
to “stable.”

```ts title="src/change.ts"
// Change 1: rename "items" to "activePatterns" everywhere.
const activePatterns = patterns.filter((pattern) => pattern.status !== 'archived');

// Change 2: update the active-pattern rule after the rename is reviewable.
const activePatterns = patterns.filter((pattern) => pattern.status === 'stable');
```

### Rust workflow split

Moving parsing behind a named function is one change; adding the new validation rule is a separate
behavior change.

```rust title="src/migrate.rs"
// Change 1: move parsing into parse_record without changing behavior.
let record = parse_record(line)?;

// Change 2: add the new validation rule.
record.validate_required_fields()?;
```

### C# keeps rename and rule change separate

The first change is a rename; the second change alters which items are visible.

```csharp title="PatternList.cs"
// Change 1: rename items to visiblePatterns without changing the predicate.
var visiblePatterns = patterns.Where(pattern => !pattern.Archived);

// Change 2: alter the behavior after the rename is reviewable.
var visiblePatterns = patterns.Where(pattern => pattern.Status == Status.Stable);
```

### Java moves parsing before changing validation

The extraction can be checked separately from the new required-field rule.

```java title="Importer.java"
// Change 1: move parsing without changing behavior.
var record = parseRecord(line);

// Change 2: add the new behavior.
record.requireField("title");
```

### Python separates formatting from behavior

A formatting-only tidy should not also change the filter rule.

```python title="catalog/render.py"
# Change 1: split the expression into named steps.
rows = render_rows(patterns)
return Page(rows=rows)

# Change 2: update which patterns are rendered.
rows = render_rows(stable_patterns(patterns))
```

## References

- [Tidy First?: Separate Tidying](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch16.html)
