---
title: >-
  Parse, Don’t Validate
summary: >-
  Convert uncertain input into a precise representation once, then pass the precise value onward.
status: draft
tags:
  - "correctness"
  - "api-design"
  - "rust"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "csharp"
  - "go"
  - "java"
  - "python"
  - "rust"
  - "ts"
problems:
  - "Code validates raw input repeatedly but still passes the raw input around."
concepts:
  - "observable-behavior"
related:
  - "make-invalid-states-hard-to-express"
  - "guard-clause"
  - "explaining-variable"
---

## Core Idea

Parsing is validation plus a change in representation. Check raw input once, then convert it into a
shape that encodes what is now known. This reduces repeated checks and makes downstream code read as
if it operates on trusted domain values.

Reach for this pattern when a value crosses a trust boundary such as user input, config, environment
variables, files, or wire data.

The main tradeoff is that do not introduce a parser for a one-off local condition when a guard
clause or explaining variable communicates the rule directly.

## Use When

- A value crosses a trust boundary such as user input, config, environment variables, files, or wire
  data.
- Downstream code needs a stronger promise than raw strings or maps can provide, and that promise
  should be visible in the type or data shape.
- Validation and use are separated far enough that the reader must remember the check or wonder
  whether it already happened.

## Guidance

- Parse at the boundary and return either a precise value or an actionable error, keeping uncertain
  input from leaking inward.
- Pass the parsed value through downstream APIs so callers do not need to repeat defensive
  validation.
- Preserve enough error context for the caller to act, especially when input came from users,
  config, or external systems.

## Tradeoffs

- Do not introduce a parser for a one-off local condition when a guard clause or explaining variable
  communicates the rule directly.
- Parsing can reveal behavior changes; characterize risky legacy input first if callers may depend
  on loose acceptance.
- Keep parser errors intentional; low-level implementation details make the boundary harder to
  evolve.

## Agent Instruction

When raw input is validated and then reused, prefer parsing it into a precise type at the boundary.
Downstream code should accept the parsed representation.

## Examples

### Rust parse boundary

Raw configuration is converted at load time, so the rest of the app receives Endpoint and
RetryPolicy values instead of loose fields.

```rust title="src/config.rs"
pub fn load_config(raw: RawConfig) -> Result<Config, ConfigError> {
    Ok(Config {
        endpoint: Endpoint::parse(&raw.endpoint)?,
        retry_policy: RetryPolicy::from_raw(raw.retry)?,
    })
}
```

### TypeScript request parser

The request schema handles unknown input once and returns a normalized request object for the rest
of the route.

```ts title="src/request.ts"
export function parsePatternRequest(input: unknown): PatternRequest {
  const data = requestSchema.parse(input);
  return {
    query: data.query.trim(),
    tags: new Set(data.tags ?? []),
  };
}
```

### Go parses once at the boundary

The raw endpoint string is parsed before Config is built, so callers cannot receive a Config with an
unchecked endpoint.

```go title="config.go"
func ParseConfig(raw RawConfig) (Config, error) {
    endpoint, err := ParseEndpoint(raw.Endpoint)
    if err != nil {
        return Config{}, err
    }

    return Config{Endpoint: endpoint}, nil
}
```

### C# parses request input once

The controller passes a parsed command inward instead of raw request fields.

```csharp title="CreatePatternRequest.cs"
public CreatePattern ToCommand()
{
    return new CreatePattern(
        PatternSlug.Parse(Slug),
        RequiredText.Parse(Title));
}
```

### Java parser returns a precise command

Raw transport data stops at the parser boundary.

```java title="CreatePatternRequest.java"
CreatePatternCommand toCommand() {
    return new CreatePatternCommand(
        PatternSlug.parse(slug),
        RequiredText.parse(title)
    );
}
```

### Python converts raw config to policy

Downstream code receives Endpoint and RetryPolicy values instead of strings.

```python title="config.py"
def parse_config(raw):
    return Config(
        endpoint=Endpoint.parse(raw["endpoint"]),
        retry_policy=RetryPolicy.from_raw(raw.get("retry")),
    )
```

## References

- Parse, Don’t Validate: convert uncertain input into precise data.
