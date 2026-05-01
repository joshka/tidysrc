---
title: >-
  Make Invalid States Hard to Express
summary: >-
  Move checks into types, constructors, or parsing boundaries so the rest of the code handles
  valid states.
status: draft
tags:
  - "correctness"
  - "api-design"
  - "rust"
  - "testing"
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
  - "Every caller must remember the same validation rule before using a value."
concepts:
  - "observable-behavior"
related:
  - "parse-dont-validate"
  - "guard-clause"
  - "test-observable-behavior"
---

## Core Idea

This pattern moves repeated “remember to check” work into a representation that carries the
invariant. A precise type, constructor, or parser can make invalid values difficult or impossible to
pass downstream. The payoff is highest when many callers repeat the same defensive checks or when
one missed check can create a bug.

Reach for this pattern when the same invalid case is checked repeatedly, and each caller has to
remember the rule before using the value safely.

The main tradeoff is that do not wrap values that are constructed and immediately destructured; that
adds ceremony without reducing the reader’s live facts.

## Use When

- The same invalid case is checked repeatedly, and each caller has to remember the rule before using
  the value safely.
- A function accepts values that make no sense for its operation, such as empty identifiers,
  unparsed URLs, or states that violate the domain model.
- The type system can carry an invariant without excessive ceremony, making valid code shorter than
  invalid code.

## Guidance

- Create a more precise type at the boundary where uncertainty enters so downstream code receives a
  value it can trust.
- Expose constructors that validate once and return an actionable error with enough context for the
  caller to report or recover.
- Make downstream functions accept the precise type, not raw input, so the invariant is visible in
  signatures instead of comments.

## Tradeoffs

- Do not wrap values that are constructed and immediately destructured; that adds ceremony without
  reducing the reader’s live facts.
- Avoid parameter-bag types that only rename a long argument list without enforcing a real
  relationship between the fields.
- For one local branch, a guard clause may be simpler than a new type because the invariant has not
  proven it needs a reusable representation.

## Agent Instruction

When repeated checks protect the same invariant, consider moving the check into a precise type or
construction path. Avoid new wrapper types that do not reduce downstream reasoning.

## Examples

### Rust constructor owns the invariant

The constructor validates once and returns an Email value that downstream functions can trust
without repeating the same check.

```rust title="src/email.rs"
pub struct Email(String);

impl Email {
    pub fn parse(input: &str) -> Result<Self, EmailError> {
        if !input.contains('@') {
            return Err(EmailError::MissingAtSign);
        }

        Ok(Self(input.to_owned()))
    }
}
```

### TypeScript branded parse boundary

The parser converts an uncertain string into a branded Email so downstream APIs can ask for the
precise value.

```ts title="src/email.ts"
type Email = string & { readonly kind: unique symbol };

export function parseEmail(input: string): Email | null {
  return input.includes('@') ? (input as Email) : null;
}
```

### Java value object replaces repeated checks

The static factory is the only place raw strings become Email values, so callers stop repeating the
same validation before sending mail.

```java title="Email.java"
public record Email(String value) {
    public static Email parse(String input) {
        if (!input.contains("@")) {
            throw new IllegalArgumentException("email must contain @");
        }

        return new Email(input);
    }
}
```

### C# value object owns the invariant

The constructor prevents blank slugs from moving deeper into the system.

```csharp title="PatternSlug.cs"
public sealed record PatternSlug
{
    public string Value { get; }

    public PatternSlug(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("slug required");
        Value = value;
    }
}
```

### Python dataclass validates construction

The rest of the code receives a PatternSlug instead of checking raw strings repeatedly.

```python title="catalog/slug.py"
@dataclass(frozen=True)
class PatternSlug:
    value: str

    def __post_init__(self):
        if not self.value.strip():
            raise ValueError("slug required")
```

## References

- Rust API Guidelines: conversions, common traits, and predictable public APIs.
- Microsoft Pragmatic Rust Guidelines: document magic values and prefer static verification.

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

### Service boundary names the rule

The service keeps the rule behind one named operation.

```go title="internal/example/service.go"
if approvalPolicy.CanApprove(user, request) {
    approvals.Approve(request)
}
```

### Client boundary names the rule

The client code uses a named boundary instead of rebuilding the rule.

```js title="src/example.js"
if (approvalPolicy.canApprove(user, request)) {
  approve(request);
}
```
