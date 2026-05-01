---
title: >-
  Follow Existing Conventions
summary: >-
  Apply local project conventions before general preferences, pattern catalogs, or agent defaults.
status: reviewed
tags:
  - "agent-guidance"
  - "workflow"
  - "review"
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
  - "md"
problems:
  - "A general style preference conflicts with explicit repository conventions."
concepts:
  - "agent-guidance"
related:
  - "avoid-premature-agent-architecture"
  - "smallest-trustworthy-verification"
---

## Core Idea

Repository conventions, existing helpers, naming schemes, test workflows, and maintainer preferences
carry context that a generic pattern catalog cannot know. Agents and reviewers should preserve
deliberate local coherence instead of replacing it with generic guidance.

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

- Read local conventions first and treat them as the default authority unless the user explicitly
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

Follow existing project conventions first. When the repository is silent, fall back to general
maintainability guidance and keep any convention choice visible in the handoff.

## Examples

### Agent convention precedence

The project rule states precedence directly, so general agent defaults do not override maintainer
instructions.

```md title="AGENTS.md"
Follow this repository's conventions first.

When the repository is silent, prefer concise changes, observable behavior tests,
and source code that reduces the reader's live mental stack.
```

### Allocation policy

This codebase routes allocation through one wrapper so out-of-memory paths report the same error
shape. Direct `malloc` calls would bypass that convention.

```c title="src/pattern_index.c"
int build_pattern_index(const PatternList *patterns, PatternIndex **out) {
    PatternIndex *index = tidysrc_alloc(sizeof(*index));
    if (index == NULL) {
        return TIDYSRC_OUT_OF_MEMORY;
    }

    int result = pattern_index_init(index, patterns);
    if (result != TIDYSRC_OK) {
        tidysrc_free(index);
        return result;
    }

    *out = index;
    return TIDYSRC_OK;
}
```

### Repository paths

The path helper already handles repository roots, generated fixtures, and separator differences. New
code keeps that boundary instead of assembling catalog paths inline.

```cpp title="src/pattern_paths.cpp"
PatternSource load_pattern(std::string_view slug, const ProjectPaths& paths) {
    auto source_path = paths.pattern_catalog(slug);
    return PatternSource::parse(read_file(source_path));
}
```

### Test data builder

The typed fixture builder owns defaults for status, tags, and relationships. Inline objects would
make each test restate those defaults differently.

```csharp title="PatternRendererTests.cs"
var pattern = PatternBuilder.Stable("guard-clause")
    .WithTag("readability")
    .Build();

var page = renderer.Render(pattern);

page.Html.Should().Contain("Use a Guard Clause");
```

### Fixture defaults

The repository fixture sets the same stable metadata that production entries use. A hand-built
struct would make the test pass while drifting away from real catalog data.

```go title="pattern_renderer_test.go"
func TestStablePatternTitle(t *testing.T) {
    pattern := testcatalog.StablePattern("guard-clause")

    page := renderer.Render(pattern)

    require.Contains(t, page.HTML, "Use a Guard Clause")
}
```

### Factory vocabulary

The repository factory names the domain state the test needs. A generic builder would add setup
vocabulary without making the behavior clearer.

```java title="PatternRendererTest.java"
var pattern = PatternFixtures.stable("guard-clause");

var html = renderer.render(pattern);

assertThat(html).contains("Use a Guard Clause");
```

### Route generation

The route builder preserves the site base path and trailing-slash convention. Building URLs with
string interpolation would look smaller while breaking deploy-specific paths.

```js title="src/patternLink.js"
export function patternLink(pattern) {
  return html`<a href="${patternHref(pattern)}">${pattern.title}</a>`;
}
```

### Pytest fixture

The project fixture owns catalog defaults, so the test only names the state it is exercising. Inline
dictionaries would make each test choose its own incomplete shape.

```python title="test_pattern_renderer.py"
def test_renders_stable_pattern(stable_pattern, render_pattern):
    html = render_pattern(stable_pattern(slug="guard-clause"))

    assert "Use a Guard Clause" in html
```

### Configuration boundary

The local constructor owns environment variable names, parsing, and defaulting. New callers use that
boundary instead of adding a second conversion layer.

```rust title="src/catalog.rs"
pub fn load_catalog(env: &Env) -> Result<Catalog, ConfigError> {
    let config = Config::from_env(env)?;

    Catalog::open(config.catalog_dir()).map_err(ConfigError::from)
}
```

### Typed fixture

The test factory captures required fields and project naming. Plain object literals would make the
test depend on whichever subset of fields the author remembered.

```ts title="patternRenderer.test.ts"
const pattern = patternFactory.stable({ slug: 'guard-clause' });

const page = renderPattern(pattern);

expect(page.text()).toContain('Use a Guard Clause');
```

## References

- None yet.
