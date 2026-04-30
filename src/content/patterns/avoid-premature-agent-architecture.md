---
title: >-
  Avoid Premature Agent Architecture
summary: >-
  Do not introduce broad architecture from one or two local examples, especially in agent-written
  code.
status: draft
tags:
  - "agent-guidance"
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
  - "A small feature grows a framework, registry, provider layer, or generic abstraction too soon."
concepts:
  - "agent-guidance"
  - "cognitive-burden"
related:
  - "reader-locality"
  - "repo-local-instructions-win"
  - "separate-structure-from-behavior"
---

## Core Idea

Premature architecture often looks tidy in isolation: providers, registries, strategies, factories,
and extension points can make a small change appear organized. Readers pay the cost when they must
understand concepts that do not yet carry their weight. Use direct code until repetition is real,
semantic, and reduces the number of facts a maintainer must hold.

Reach for this pattern when a proposed abstraction has only one caller or two weakly similar
callers, so the shared concept is not yet proven.

The main tradeoff is that some frameworks require early structure; follow the framework when it is
the local idiom and readers expect that shape.

## Use When

- A proposed abstraction has only one caller or two weakly similar callers, so the shared concept is
  not yet proven.
- The abstraction hides mutation, ordering, or ownership that reviewers need to see to judge
  correctness.
- The change adds broad extension points without a concrete near-term user.

## Guidance

- Implement the local behavior directly first so the real shape of the problem is visible before
  naming a framework around it.
- Extract only when duplication is real, semantic, and lowers reader burden instead of only reducing
  line count.
- Prefer boring names and local helpers over architecture vocabulary until the codebase has enough
  examples to justify stronger concepts.

## Tradeoffs

- Some frameworks require early structure; follow the framework when it is the local idiom and
  readers expect that shape.
- Public APIs may need a deliberate shape before release because compatibility costs can make future
  extraction harder.
- Do not use this pattern to reject all abstraction; reject abstractions that do not pay rent in
  clarity, safety, or changeability.

## Agent Instruction

Do not create broad architecture from one local duplication. Prefer direct code and small local
helpers until a real repeated concept appears.

## Examples

### Local function before provider layer

The stable-pattern filter has one concrete use, so a local function solves the problem without
inventing provider architecture.

```ts title="src/catalog.ts"
export function stablePatterns(patterns: Pattern[]) {
  return patterns.filter((pattern) => pattern.status === 'stable');
}

// Do not add PatternProvider, PatternStrategy, and PatternRegistry for this alone.
```

### Rust direct mapping before trait hierarchy

A direct match exposes the supported labels; a trait hierarchy would hide a tiny mapping behind
extension points.

```rust title="src/language.rs"
pub fn language_label(language: &str) -> &str {
    match language {
        "ts" => "TypeScript",
        "js" => "JavaScript",
        "rs" | "rust" => "Rust",
        other => other,
    }
}
```

### Java local helper before registry

The filtering rule is still one concrete behavior, so a local helper is clearer than a registry and
strategy interface.

```java title="PatternFilters.java"
static List<Pattern> stablePatterns(List<Pattern> patterns) {
    return patterns.stream()
        .filter(pattern -> pattern.status() == Status.STABLE)
        .toList();
}

// Do not introduce PatternProvider, PatternStrategy, and PatternRegistry
// until there are real extension points to name.
```

### C# local helper before service registry

The filter has one caller, so a local helper is clearer than a strategy registry.

```csharp title="PatternFilters.cs"
static IReadOnlyList<Pattern> StablePatterns(IEnumerable<Pattern> patterns)
{
    return patterns.Where(pattern => pattern.Status == Status.Stable).ToList();
}
```

### Python direct function before plugin map

The import path has one supported behavior, so a registry would add concepts without reuse.

```python title="catalog/import_patterns.py"
def stable_patterns(patterns):
    return [pattern for pattern in patterns if pattern.status == "stable"]
```

## References

- None yet.
