---
title: >-
  Repo-Local Instructions Win
summary: >-
  Apply local project instructions before general preferences, pattern catalogs, or agent
  defaults.
status: stable
tags:
  - "agent-guidance"
  - "workflow"
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
  - "md"
problems:
  - "A general style preference conflicts with explicit repository guidance."
concepts:
  - "agent-guidance"
related:
  - "avoid-premature-agent-architecture"
  - "smallest-trustworthy-verification"
---

## Core Idea

Repository instructions, existing helpers, naming schemes, test workflows, and maintainer
preferences carry context that a generic pattern catalog cannot know. Agents and reviewers should
preserve deliberate local coherence instead of replacing it with generic guidance.

Reach for this pattern when a repo has AGENTS.md, CONTRIBUTING, local style docs, or established
patterns that define how work should be done there.

The main tradeoff is that local style can be stale; do not preserve broken patterns blindly when
they conflict with correctness or clear maintainability.

## Use When

- A repo has AGENTS.md, CONTRIBUTING, local style docs, or established patterns that define how work
  should be done there.
- General guidance conflicts with local compatibility, release constraints, or maintainer
  preference.
- An agent is about to apply global defaults to an unfamiliar codebase without first checking the
  repo’s own conventions.

## Guidance

- Read local instructions first and treat them as the default authority unless the user explicitly
  overrides them.
- Prefer established local helpers, naming, routes, and workflows because consistency lowers review
  and maintenance cost.
- Escalate only when local guidance is unsafe, contradictory, or impossible, and make the conflict
  explicit instead of silently choosing.

## Tradeoffs

- Local style can be stale; do not preserve broken patterns blindly when they conflict with
  correctness or clear maintainability.
- Security, correctness, and explicit user requests can override local taste, but the reason should
  be visible in the change or handoff.
- When guidance conflicts, name the conflict so the maintainer can correct the rule or approve the
  exception.

## Agent Instruction

Follow repo-local instructions first. Use TidySrc only when the project is silent or when a local
pattern matches the same guidance.

## Examples

### Agent instruction precedence

The instruction states precedence directly so an agent knows when local guidance overrides broader
TidySrc defaults.

```md title="AGENTS.md"
Follow this repository's instructions first.

When the repository is silent, prefer concise changes, observable behavior tests,
and source code that reduces the reader's live mental stack.
```

### Local helper before generic utility

The route builder already encodes local URL conventions, so it avoids another generic helper.

```ts title="src/url.ts"
// Prefer the local route builder so generated URLs match the app.
const href = patternHref(pattern.slug);

// Avoid introducing a generic URL helper for one local convention.
```

### Rust local constructor before generic conversion layer

The project already constructs Config through this local helper, so new callers should keep the same
boundary instead of adding a generic conversion framework.

```rust title="src/config.rs"
impl Config {
    pub fn from_env(env: &Env) -> Result<Self, ConfigError> {
        Ok(Self {
            endpoint: Endpoint::parse(env.required("ENDPOINT")?)?,
            timeout: Timeout::from_seconds(env.optional("TIMEOUT_SECONDS")?)?,
        })
    }
}
```

### C# uses the local test helper

The local helper preserves the repo testing vocabulary instead of adding another fixture pattern.

```csharp title="PatternTests.cs"
var catalog = TestCatalog.WithStablePattern("guard-clause");

var page = renderer.Render(catalog);

Assert.Contains("Use a Guard Clause", page.Html);
```

### Java follows the repository factory

The repo already has a builder, so the test uses it rather than inventing a generic fixture layer.

```java title="PatternTests.java"
var pattern = PatternFixtures.stable("guard-clause");

var html = renderer.render(pattern);

assertThat(html).contains("Use a Guard Clause");
```

### Python uses the project fixture

The test stays consistent with the repo fixture instead of creating a new setup style.

```python title="test_patterns.py"
pattern = pattern_factory.stable(slug="guard-clause")

html = render_pattern(pattern)

assert "Use a Guard Clause" in html
```

## References

- Agent guidance: local project guidance overrides general defaults.
