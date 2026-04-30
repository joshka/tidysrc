---
title: >-
  Risky legacy change
status: draft
category: change-risk
topics:
  - legacy-code
  - characterization
  - verification
summary: >-
  The existing behavior is unclear, under-tested, or coupled to callers that a small edit can break.
relatedPatterns:
  - characterize-before-changing
  - separate-structure-from-behavior
  - observable-behavior-tests
  - smallest-trustworthy-verification
relatedConcepts:
  - observable-behavior
  - structure-vs-behavior
---

## Impact

The danger comes from uncertainty about intentional behavior. Without characterization, a tidy can
silently become a product change.

## Signals

- The code has few tests or tests that only cover internal helpers.
- A small edit changes parsing, error handling, ordering, or public output at the same time.
- Callers rely on behavior that is not written down anywhere.
- The reviewer needs to ask “what changed?” and the diff does not make that question answerable.

## Diagnostic Questions

- What observable behavior would prove the current system still works?
- Which outputs, errors, logs, side effects, or calls are part of the public contract?
- Can the structure be improved without changing behavior first?
- What is the smallest verification that would catch the likely regression?

## Approach

- Characterize the current behavior before changing it, especially around edge cases and public
  boundaries.
- Separate structural cleanup from behavior changes so review can answer one question at a time.
- Protect observable behavior instead of private implementation shape.
- Use the smallest trustworthy verification loop before broadening tests or refactoring further.

## Examples

### Problem: C# legacy parser changes without a behavior pin

The rewrite may change accepted inputs, but no test names the old behavior.

```csharp title="Legacy/DateParser.cs"
public DateTime ParseDate(string value)
{
    return DateTime.Parse(value);
}
```

### Better: C# characterization names the existing contract

The test records behavior before the parser changes.

```csharp title="Legacy/DateParserTests.cs"
Assert.Equal(new DateTime(2024, 1, 2), parser.ParseDate("01/02/2024"));
```

### Problem: Java cleanup changes legacy error behavior

The caller may depend on the current exception shape.

```java title="src/main/java/legacy/Parser.java"
int parseCount(String value) {
    return Integer.parseInt(value.trim());
}
```

### Better: Java characterization protects the public edge

The test captures the observable failure before cleanup.

```java title="src/test/java/legacy/ParserTest.java"
assertThrows(NumberFormatException.class, () -> parser.parseCount("many"));
```

### Problem: Python legacy behavior is edited directly

The function may have undocumented callers.

```python title="legacy/parser.py"
def parse_count(value):
    return int(value.strip())
```

### Better: Python pins current behavior first

The characterization tells review what changed later.

```python title="tests/test_parser.py"
with pytest.raises(ValueError):
    parse_count("many")
```

### Problem: Rust legacy parser is refactored without examples

The refactor can accidentally change edge-case parsing.

```rust title="src/legacy.rs"
pub fn parse_count(value: &str) -> Result<u32, ParseIntError> {
    value.trim().parse()
}
```

### Better: Rust characterization records edge behavior

The test protects the observable parser contract.

```rust title="src/legacy.rs"
#[test]
fn rejects_words() {
    assert!(parse_count("many").is_err());
}
```

### Problem: TypeScript legacy output changes silently

The formatter may be part of a public contract.

```ts title="src/legacy/format.ts"
export function formatCode(value: string) {
  return value.trim().toUpperCase();
}
```

### Better: TypeScript pins the output before cleanup

The test makes the legacy contract explicit.

```ts title="src/legacy/format.test.ts"
expect(formatCode(' ab ')).toBe('AB');
```
