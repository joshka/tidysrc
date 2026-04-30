---
title: >-
  Cap the Change Radius
summary: >-
  Keep a change inside the smallest coherent set of files, calls, and concepts that can carry it.
status: draft
tags:
  - "workflow"
  - "architecture"
  - "review"
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
  - "A small behavior change requires touching many distant files that do not own the behavior."
concepts:
  - "change-radius"
  - "reader-locality"
related:
  - "reader-locality"
  - "separate-structure-from-behavior"
  - "parse-dont-validate"
---

## Core Idea

A change radius grows when a small rule forces edits across files, tests, builders, configs, and
docs that do not own the behavior. Some radius is real coupling. Some is accidental shape. Before
broadening a patch, ask which boundary should own the rule and which edits only exist because the
current shape leaks it.

Reach for this pattern when one rule change touches several layers because the rule is represented
as loose data or repeated conditionals.

The main tradeoff is that large radii can be legitimate for public API changes; make that
compatibility cost explicit instead of hiding it as cleanup.

## Use When

- One rule change touches several layers because the rule is represented as loose data or repeated
  conditionals.
- A review has many mechanical edits that hide the file where the behavior actually lives.
- A caller needs to know too many downstream implementation details before it can make a small
  change safely.

## Guidance

- Find the boundary that owns the rule and move the rule there before copying updates through
  callers.
- Separate mechanical call-site changes from the behavior change when the radius cannot be avoided.
- Use a precise type, policy object, or named helper only when it reduces the number of future edit
  sites.

## Tradeoffs

- Large radii can be legitimate for public API changes; make that compatibility cost explicit
  instead of hiding it as cleanup.
- Do not create a central dumping ground just to reduce touched files; the new boundary must own the
  concept.
- Rust often exposes radius through type changes, while dynamic languages can hide radius until
  runtime or tests execute the path.

## Agent Instruction

Before editing many files for one rule, identify the boundary that should own the rule. Keep the
patch radius small or explain why the wider radius is a real contract change.

## Examples

### Move the rule to the policy boundary

Callers stop repeating the stable-status rule; future changes edit the policy instead of every
catalog view.

```ts title="src/policy.ts"
export function canPublish(pattern: Pattern): boolean {
  return pattern.status === 'stable' && pattern.examples.length > 0;
}
```

### Rust type carries the rule through callers

Callers that receive PublishablePattern no longer repeat the same readiness checks before
publishing.

```rust title="src/publish.rs"
pub struct PublishablePattern(Pattern);

impl TryFrom<Pattern> for PublishablePattern {
    type Error = PublishError;

    fn try_from(pattern: Pattern) -> Result<Self, Self::Error> {
        pattern.ensure_ready()?;
        Ok(Self(pattern))
    }
}
```

### Java service narrows the edited surface

Controllers ask the policy for the rule instead of repeating the same publish checks across
endpoints.

```java title="PublishPolicy.java"
final class PublishPolicy {
    boolean canPublish(Pattern pattern) {
        return pattern.status() == Status.STABLE && !pattern.examples().isEmpty();
    }
}
```

### C# adds a facade at the churn boundary

Callers depend on a small local gateway instead of each knowing the vendor API shape.

```csharp title="SearchGateway.cs"
public Task<IReadOnlyList<Pattern>> SearchPatterns(string query)
{
    return vendorClient.SearchAsync(new SearchRequest(query));
}
```

### Python contains a field rename

Only the adapter knows the vendor changed display_name to title.

```python title="pattern_gateway.py"
def to_pattern(row):
    return Pattern(slug=row["slug"], title=row["display_name"], summary=row["summary"])
```

## References

- None yet.
