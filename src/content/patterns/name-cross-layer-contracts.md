---
title: >-
  Name Cross-Layer Contracts
summary: >-
  Give data crossing layers a contract name instead of passing persistence, transport, or UI
  shapes everywhere.
status: draft
tags:
  - "architecture"
  - "api-design"
  - "boundaries"
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
  - "Database rows, API payloads, UI props, or framework types leak across boundaries that should own their own language."
concepts:
  - "boundary-trust"
  - "reader-locality"
related:
  - "parse-dont-validate"
  - "reader-locality"
  - "cap-change-radius"
---

## Core Idea

Layer leaks make every part of the system know about every other part. A database row travels to the
UI, an HTTP payload becomes a domain object, or a component receives storage flags. Naming the
contract at the boundary keeps the layer-specific shape from becoming everyone’s shared language.

Reach for this pattern when a persistence record, wire payload, or UI-specific type is used in logic
that should not know that layer exists.

The main tradeoff is that small applications can tolerate some shared shapes when the boundary has
not earned its cost.

## Use When

- A persistence record, wire payload, or UI-specific type is used in logic that should not know that
  layer exists.
- A field is named for storage mechanics rather than the domain decision the caller needs.
- Changing one layer forces unrelated layers to change because they share the same shape.

## Guidance

- Create a boundary type or mapper where the layer changes language.
- Keep layer-specific names inside their layer and pass domain or view contracts across the next
  boundary.
- Map only when the contract changes; do not add translation objects that mirror fields without
  changing meaning.

## Tradeoffs

- Small applications can tolerate some shared shapes when the boundary has not earned its cost.
- Public API and database compatibility may require separate shapes even when they look similar
  today.
- Java often uses DTOs here, Rust often uses explicit conversion types, and TypeScript needs care
  not to let structural typing blur boundaries again.

## Agent Instruction

When data crosses persistence, transport, domain, or UI boundaries, name the contract at the
boundary. Do not pass layer-specific shapes through unrelated code.

## Examples

### TypeScript maps wire data to a view contract

The component receives the view contract instead of depending on API field names.

```ts title="src/patternView.ts"
export function toPatternCard(pattern: PatternResponse): PatternCard {
  return {
    title: pattern.display_name,
    summary: pattern.short_summary,
    href: `/patterns/${pattern.slug}/`,
  };
}
```

### Rust conversion marks the boundary

The database row stops at the conversion boundary; domain code receives Pattern.

```rust title="src/pattern.rs"
impl TryFrom<PatternRow> for Pattern {
    type Error = PatternError;

    fn try_from(row: PatternRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: PatternId::parse(&row.slug)?,
            title: row.title,
        })
    }
}
```

### Java DTO stops at the controller boundary

The controller translates transport shape into a command before domain code sees it.

```java title="PatternController.java"
CreatePattern command = new CreatePattern(
    request.slug(),
    request.displayName(),
    request.summary()
);

service.create(command);
```

### C# maps database row to domain

The database shape stops at the repository boundary.

```csharp title="PatternRepository.cs"
static Pattern ToDomain(PatternRow row)
{
    return new Pattern(new PatternSlug(row.Slug), row.DisplayName, row.Summary);
}
```

### Python maps API payload to command

The service receives a command rather than raw request JSON.

```python title="routes/patterns.py"
command = CreatePattern(
    slug=PatternSlug.parse(payload["slug"]),
    title=payload["display_name"],
)
service.create(command)
```

## References

- None yet.
