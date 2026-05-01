---
title: >-
  Risky Legacy Change
status: reviewed
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
  - test-observable-behavior
  - smallest-trustworthy-verification
relatedConcepts:
  - observable-behavior
  - structure-vs-behavior
---

## Description

The existing behavior is unclear, under-tested, or coupled to callers that a small edit can break.

The risk comes from uncertainty, not age alone. A small cleanup can change parsing quirks, error
shape, ordering, formatting, or side effects that callers already depend on. If no test or example
names that behavior, review cannot tell whether the change preserved the contract or merely changed
something nobody noticed.

Legacy code often needs a behavior pin before it needs a design opinion. Once the current
[observable behavior](/concepts/observable-behavior/) is visible, the team can decide what to keep,
what to fix, and which structure can move separately.

## Why It Matters

The danger comes from uncertainty about intentional behavior. Without characterization, a tidy can
turn into a behavior change while still looking like cleanup.

Reviewers need to know which observable result should stay the same before they can judge the
change. Otherwise every rename, extraction, guard clause, or parser cleanup carries hidden product
risk.

## Code Impact

Risky legacy code tends to mix structure, behavior, and compatibility quirks. A refactor may change
the same lines that define public output, persisted state, errors, logs, or call ordering.

The code impact is review ambiguity. Future maintainers cannot tell whether a changed branch was a
deliberate behavior change, a missed edge case, or an accidental side effect of making the code look
better.

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

- [Characterize before changing](/patterns/characterize-before-changing/) around edge cases and
  public boundaries.
- [Separate structure from behavior](/patterns/separate-structure-from-behavior/) so review can
  answer one question at a time.
- [Test observable behavior](/patterns/test-observable-behavior/) instead of private
  implementation shape.
- Use the [smallest trustworthy verification](/patterns/smallest-trustworthy-verification/) before
  broadening tests or refactoring further.

## Examples

### Before: legacy parser behavior exists

The old parser accepts ambiguous date strings, and callers may already depend on that behavior.

```csharp title="Legacy/DateParser.cs"
public DateTime ParseDate(string value)
{
    return DateTime.Parse(value);
}
```

### Problem: legacy parser changes without a behavior pin

The rewrite may change accepted inputs, but no test names the old behavior being replaced.

```csharp title="Legacy/DateParser.cs"
public DateTime ParseDate(string value)
{
    return DateTime.ParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture);
}
```

### Better: characterization names the existing contract

The test records behavior before the parser changes. This applies
[Characterize Before Changing](/patterns/characterize-before-changing/).

```csharp title="Legacy/DateParserTests.cs"
Assert.Equal(new DateTime(2024, 1, 2), parser.ParseDate("01/02/2024"));
```

### Before: legacy parser throws current exception

The current parser trims input and lets `Integer.parseInt` choose the failure shape.

```java title="src/main/java/legacy/Parser.java"
int parseCount(String value) {
    return Integer.parseInt(value.trim());
}
```

### Problem: cleanup changes legacy error behavior

The caller may depend on the current exception shape.

```java title="src/main/java/legacy/Parser.java"
int parseCount(String value) {
    if (!value.matches("\\d+")) {
        throw new IllegalArgumentException("count must be numeric");
    }

    return Integer.parseInt(value);
}
```

### Better: characterization protects the public edge

The test captures the observable failure before cleanup. This applies
[Characterize Before Changing](/patterns/characterize-before-changing/).

```java title="src/test/java/legacy/ParserTest.java"
assertThrows(NumberFormatException.class, () -> parser.parseCount("many"));
```

### Before: legacy function has undocumented callers

The existing function trims input and raises Python's standard `ValueError` for non-numeric text.

```python title="legacy/parser.py"
def parse_count(value):
    return int(value.strip())
```

### Problem: legacy behavior is edited directly

The function may have undocumented callers.

```python title="legacy/parser.py"
def parse_count(value):
    if not value.isdecimal():
        raise ParseError("count must be numeric")

    return int(value)
```

### Better: pins current behavior first

The characterization tells review what changed later. This applies
[Characterize Before Changing](/patterns/characterize-before-changing/).

```python title="tests/test_parser.py"
with pytest.raises(ValueError):
    parse_count("many")
```

### Before: parser returns the current error shape

The existing function trims and returns whatever `parse` reports.

```rust title="src/legacy.rs"
pub fn parse_count(value: &str) -> Result<u32, ParseIntError> {
    value.trim().parse()
}
```

### Problem: legacy parser is refactored without examples

The refactor can accidentally change edge-case parsing.

```rust title="src/legacy.rs"
pub fn parse_count(value: &str) -> Result<u32, CountError> {
    if !value.chars().all(|ch| ch.is_ascii_digit()) {
        return Err(CountError::Invalid);
    }

    Ok(value.parse().unwrap())
}
```

### Better: characterization records edge behavior

The test protects the observable parser contract. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```rust title="src/legacy.rs"
#[test]
fn rejects_words() {
    assert!(parse_count("many").is_err());
}
```

### Before: formatter has visible output

The current formatter trims and uppercases a value that may already be visible to callers.

```ts title="src/legacy/format.ts"
export function formatCode(value: string) {
  return value.trim().toUpperCase();
}
```

### Problem: legacy output changes silently

The formatter may be part of a public contract.

```ts title="src/legacy/format.ts"
export function formatCode(value: string) {
  return value.normalize().toUpperCase();
}
```

### Better: pins the output before cleanup

The test makes the legacy contract explicit. This applies
[Characterize Before Changing](/patterns/characterize-before-changing/).

```ts title="src/legacy/format.test.ts"
expect(formatCode(' ab ')).toBe('AB');
```

### Before: parser has permissive legacy behavior

The current parser treats blank and non-numeric input as zero through `atoi`.

```c title="src/example.c"
int parse_count(const char *value) {
    while (*value == ' ') {
        value++;
    }

    return atoi(value);
}
```

### Problem: parser cleanup has no behavior pin

The cleanup may change how blank fields are handled, but no test records the current contract.

```c title="src/example.c"
int parse_count(const char *value) {
    char *end;
    long count = strtol(value, &end, 10);

    if (*end != '\0') {
        return -1;
    }

    return (int)count;
}
```

### Better: characterize the parser edge

The test pins the observable behavior before parser cleanup. This applies
[Characterize Before Changing](/patterns/characterize-before-changing/).

```c title="src/example.c"
void test_parse_count_keeps_legacy_blank_behavior(void) {
    assert_int_equal(0, parse_count(""));
}
```

### Before: formatter output is part of the contract

The current formatter trims and uppercases output used by files and snapshots.

```cpp title="src/example.cpp"
std::string format_code(std::string value) {
    trim(value);
    uppercase(value);
    return value;
}
```

### Problem: formatter cleanup touches public output

The formatter output may be consumed by files, emails, or snapshots.

```cpp title="src/example.cpp"
std::string format_code(std::string value) {
    return normalize_whitespace(value);
}
```

### Better: test the output contract

The test protects visible output while internals move. This applies
[Test Observable Behavior](/patterns/test-observable-behavior/).

```cpp title="src/example.cpp"
TEST(FormatCode, PreservesLegacyTrimAndUppercase) {
    EXPECT_EQ("AB", format_code(" ab "));
}
```

### Before: parser returns current parse errors

The current parser trims input and exposes the standard conversion error.

```go title="internal/example/service.go"
func ParseCount(value string) (int, error) {
    return strconv.Atoi(strings.TrimSpace(value))
}
```

### Problem: cleanup can change error behavior

The parser shape looks small, but callers may depend on the current error.

```go title="internal/example/service.go"
func ParseCount(value string) (int, error) {
    if strings.TrimSpace(value) == "" {
        return 0, ErrMissingCount
    }

    return strconv.Atoi(value)
}
```

### Better: characterize the error edge

The test records the failure callers can observe. This applies
[Characterize Before Changing](/patterns/characterize-before-changing/).

```go title="internal/example/service.go"
func TestParseCountRejectsWords(t *testing.T) {
    _, err := ParseCount("many")
    if err == nil {
        t.Fatal("expected error")
    }
}
```

### Before: renderer has visible empty markup

The existing renderer turns missing summaries into an empty paragraph.

```js title="src/example.js"
export function renderSummary(summary) {
  return `<p>${summary || ''}</p>`;
}
```

### Problem: renderer cleanup can change markup

The markup looks incidental, but callers or tests may rely on it.

```js title="src/example.js"
export function renderSummary(summary) {
  if (!summary) return '';
  return `<p>${summary}</p>`;
}
```

### Better: characterize generated output

The test pins the visible output before renderer cleanup. This applies
[Characterize Before Changing](/patterns/characterize-before-changing/).

```js title="src/example.js"
expect(renderSummary(null)).toBe('<p></p>');
```
