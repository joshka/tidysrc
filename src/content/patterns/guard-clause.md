---
title: >-
  Use a Guard Clause
summary: >-
  Exit early when a boring precondition would otherwise indent or obscure the main path.
status: stable
tags:
  - "readability"
  - "control-flow"
  - "refactoring"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "csharp"
  - "go"
  - "java"
  - "js"
  - "python"
  - "rust"
problems:
  - "The normal case is buried under validation, empty cases, or unsupported modes."
concepts:
  - "reader-locality"
related:
  - "chunk-statements"
  - "parse-dont-validate"
  - "make-invalid-states-hard-to-express"
---

## Core Idea

A guard clause makes the exceptional or uninteresting path pay its cost up front. Instead of
wrapping the main behavior in conditionals, it handles empty input, invalid state, unsupported
modes, or no-op cases and then gets out of the way. The result should make the normal behavior more
prominent, not merely replace one confusing branch shape with another.

Reach for this pattern when the branch handles an empty case, invalid input, unsupported mode, or
no-op that is less important than the behavior that follows.

The main tradeoff is that too many guards can hide a missing input type or parser; repeated
validation may belong at a construction boundary instead.

## Use When

- The branch handles an empty case, invalid input, unsupported mode, or no-op that is less important
  than the behavior that follows.
- Continuing would make the main path more indented than the edge case, forcing readers to carry a
  condition while reading the real work.
- The early return does not skip cleanup or required behavior; ownership, locks, transactions, and
  deferred work are still explicit.

## Guidance

- Put boring preconditions at the top of the function in the order a reader must rule them out
  before trusting the main path.
- Keep the main behavior visually prominent after the guards so the function reads as “reject
  invalid cases, then do the work.”
- Use domain-specific return values or errors so the guard states why execution stops.

## Tradeoffs

- Too many guards can hide a missing input type or parser; repeated validation may belong at a
  construction boundary instead.
- In languages with manual cleanup, make cleanup ownership explicit before returning so the tidy
  does not introduce lifetime or resource bugs.
- A domain-relevant alternative path may deserve a named branch if both paths carry behavior a
  reader must compare.

## Agent Instruction

Use a guard clause when an empty case, validation failure, unsupported mode, or no-op would
otherwise indent the main path. Keep the normal behavior visually prominent.

## Examples

### Before: hide the valid path behind a branch

This version is correct, but the useful parsing result sits inside the branch while the empty-input
case controls the shape of the function.

```rust title="src/parser.rs"
pub fn parse_name(input: &str) -> Option<Name> {
    let trimmed = input.trim();

    if !trimmed.is_empty() {
        Some(Name::new(trimmed))
    } else {
        None
    }
}
```

### After: guard invalid input before parsing

The parser rejects blank input before constructing a name, leaving the valid parsing path flat.

```rust title="src/parser.rs"
pub fn parse_name(input: &str) -> Option<Name> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return None;
    }

    Some(Name::new(trimmed))
}
```

### Guard missing DOM target

The UI hook may run before both elements exist, so the guard avoids nesting the real event binding
under a defensive check.

```js title="src/search.js"
export function attachSearch(input, results) {
  if (!input || !results) {
    return;
  }

  input.addEventListener('input', () => {
    results.dataset.query = input.value.trim().toLowerCase();
  });
}
```

### Guard empty work before allocating

The empty report case needs no allocation or summarization, so returning early keeps the normal
report construction direct.

```go title="internal/report/report.go"
func BuildReport(rows []Row) Report {
    if len(rows) == 0 {
        return Report{}
    }

    totals := summarize(rows)
    return Report{Rows: rows, Totals: totals}
}
```

### C# rejects missing input before the main work

The guard makes the unsupported request pay its cost before the publish path starts.

```csharp title="PublishCommand.cs"
public Result Publish(Pattern? pattern)
{
    if (pattern is null) {
        return Result.NotFound();
    }

    return publisher.Publish(pattern);
}
```

### Java returns before the valid path

The main send path stays flat after the missing-recipient case is ruled out.

```java title="Mailer.java"
SendResult send(Recipient recipient, Message message) {
    if (recipient == null) {
        return SendResult.missingRecipient();
    }

    return gateway.send(recipient, message);
}
```

### Python guards empty work

The function exits before building indexes that cannot be used for an empty batch.

```python title="catalog/index.py"
def build_index(patterns):
    if not patterns:
        return SearchIndex.empty()

    documents = [to_document(pattern) for pattern in patterns]
    return SearchIndex.from_documents(documents)
```

## References

- Tidy First: guard clauses as small structural changes.
