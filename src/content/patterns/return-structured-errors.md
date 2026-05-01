---
title: >-
  Return Structured Errors
summary: >-
  Give callers error shape they can inspect instead of forcing them to parse strings or lose
  context.
status: draft
tags:
  - "errors"
  - "api-design"
  - "observable-behavior"
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
  - "Callers branch on error text or lose the context needed to recover, retry, or report the failure."
concepts:
  - "observable-behavior"
  - "boundary-trust"
related:
  - "test-observable-behavior"
  - "parse-dont-validate"
---

## Core Idea

Errors are part of the observable contract when callers branch, retry, report, or recover from them.
A string can explain a failure to a person, but it is weak program structure. Structured errors keep
the stable kind, recoverable context, and human message in separate places.

Reach for this pattern when a caller needs to distinguish retryable, validation, authorization,
not-found, or conflict failures.

The main tradeoff is that do not over-model errors that are logged and returned only as opaque
internal failures.

## Use When

- A caller needs to distinguish retryable, validation, authorization, not-found, or conflict
  failures.
- Error messages contain data that tests or callers parse with string matching.
- A boundary has to preserve enough context for logs, UI copy, or recovery decisions.

## Guidance

- Expose a stable error kind or variant for program behavior and keep human text separate.
- Attach context that helps recovery, such as field names, resource ids, retry hints, or upstream
  status.
- Test the stable error shape when it is part of the public contract.

## Tradeoffs

- Do not over-model errors that are logged and returned only as opaque internal failures.
- Changing error shape can be a behavior change; characterize callers that depend on existing
  strings before replacing them.
- Rust and Go can make error typing visible through return signatures; JavaScript often needs
  explicit discriminated objects.

## Agent Instruction

When callers need to inspect an error, return a structured kind and context instead of relying on
message text. Preserve human messages as messages, not program control flow.

## Examples

### Rust error kind carries program behavior

The caller can branch on the error kind without parsing the display message.

```rust title="src/import_error.rs"
pub enum ImportError {
    MissingField { field: &'static str },
    DuplicateId { id: PatternId },
}
```

### TypeScript error object separates kind from message

The UI can render the message while retry logic uses the stable kind.

```ts title="src/errors.ts"
type CatalogError =
  | { kind: 'not-found'; id: string; message: string }
  | { kind: 'invalid-filter'; field: string; message: string };
```

### Go typed error exposes retry behavior

The caller can inspect the error type for retry behavior while the message remains human-readable.

```go title="errors.go"
type RateLimitError struct {
    RetryAfter time.Duration
}

func (e RateLimitError) Error() string {
    return "rate limit exceeded"
}
```

### C# error kind separates behavior from text

Callers branch on Kind while messages remain human-readable.

```csharp title="CatalogError.cs"
public sealed record CatalogError(
    CatalogErrorKind Kind,
    string Message,
    string? Field = null);
```

### Java exception carries stable context

The field name is available without parsing the message.

```java title="MissingFieldException.java"
final class MissingFieldException extends RuntimeException {
    private final String field;

    MissingFieldException(String field) {
        super("missing field: " + field);
        this.field = field;
    }
}
```

### Python exception carries error data

The caller can inspect the kind and field separately from display text.

```python title="errors.py"
class CatalogError(Exception):
    def __init__(self, kind, message, field=None):
        super().__init__(message)
        self.kind = kind
        self.field = field
```

## References

- None yet.

### Low-level boundary names the rule

The caller delegates the rule to a named boundary instead of repeating mechanics inline.

```c title="src/example.c"
if (approval_policy_can_approve(policy, user, request)) {
    approve_request(request);
}
```

### Object boundary names the rule

The object caller asks a boundary that owns the rule.

```cpp title="src/example.cpp"
if (approval_policy.can_approve(user, request)) {
    approvals.approve(request);
}
```

### Client boundary names the rule

The client code uses a named boundary instead of rebuilding the rule.

```js title="src/example.js"
if (approvalPolicy.canApprove(user, request)) {
  approve(request);
}
```
