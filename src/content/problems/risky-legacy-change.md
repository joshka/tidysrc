---
title: >-
  Risky Legacy Change
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
  - test-observable-behavior
  - smallest-trustworthy-verification
relatedConcepts:
  - observable-behavior
  - structure-vs-behavior
---

## Description

The existing behavior is unclear, under-tested, or coupled to callers that a small edit can break.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

The danger comes from uncertainty about intentional behavior. Without characterization, a tidy can

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

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

### Problem: legacy parser changes without a behavior pin

The rewrite may change accepted inputs, but no test names the old behavior.

```csharp title="Legacy/DateParser.cs"
public DateTime ParseDate(string value)
{
    return DateTime.Parse(value);
}
```

### Better: characterization names the existing contract

The test records behavior before the parser changes.

```csharp title="Legacy/DateParserTests.cs"
Assert.Equal(new DateTime(2024, 1, 2), parser.ParseDate("01/02/2024"));
```

### Problem: cleanup changes legacy error behavior

The caller may depend on the current exception shape.

```java title="src/main/java/legacy/Parser.java"
int parseCount(String value) {
    return Integer.parseInt(value.trim());
}
```

### Better: characterization protects the public edge

The test captures the observable failure before cleanup.

```java title="src/test/java/legacy/ParserTest.java"
assertThrows(NumberFormatException.class, () -> parser.parseCount("many"));
```

### Problem: legacy behavior is edited directly

The function may have undocumented callers.

```python title="legacy/parser.py"
def parse_count(value):
    return int(value.strip())
```

### Better: pins current behavior first

The characterization tells review what changed later.

```python title="tests/test_parser.py"
with pytest.raises(ValueError):
    parse_count("many")
```

### Problem: legacy parser is refactored without examples

The refactor can accidentally change edge-case parsing.

```rust title="src/legacy.rs"
pub fn parse_count(value: &str) -> Result<u32, ParseIntError> {
    value.trim().parse()
}
```

### Better: characterization records edge behavior

The test protects the observable parser contract.

```rust title="src/legacy.rs"
#[test]
fn rejects_words() {
    assert!(parse_count("many").is_err());
}
```

### Problem: legacy output changes silently

The formatter may be part of a public contract.

```ts title="src/legacy/format.ts"
export function formatCode(value: string) {
  return value.trim().toUpperCase();
}
```

### Better: pins the output before cleanup

The test makes the legacy contract explicit.

```ts title="src/legacy/format.test.ts"
expect(formatCode(' ab ')).toBe('AB');
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
