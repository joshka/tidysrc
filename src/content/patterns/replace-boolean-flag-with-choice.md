---
title: >-
  Replace Boolean Flag With a Choice
summary: >-
  Turn ambiguous boolean parameters and fields into named options when the two states carry domain
  meaning.
status: draft
tags:
  - "api-design"
  - "naming"
  - "readability"
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
  - "Call sites pass true or false and the reader must inspect the function to know what behavior was selected."
concepts:
  - "state-space"
  - "reader-locality"
related:
  - "make-invalid-states-hard-to-express"
  - "explaining-variable"
---

## Core Idea

A boolean is cheap until a reader has to remember what true means at each call site. When a flag
selects behavior, encodes a lifecycle state, or travels across module boundaries, a named choice can
make the call read in domain terms and make future states possible without boolean drift.

Reach for this pattern when the boolean crosses a function boundary and controls behavior rather
than carrying a local fact.

The main tradeoff is that a local boolean condition can be clearer than a tiny enum when the name is
visible and no API boundary is involved.

## Use When

- The boolean crosses a function boundary and controls behavior rather than carrying a local fact.
- Several booleans combine into states that should be named directly.
- A third state is likely or already represented through null, comments, or another flag.

## Guidance

- Replace the flag with an enum, union, options object, or named constructor that exposes the
  behavior at the call site.
- Keep local booleans when they name a nearby fact and do not leak into an API.
- Update tests to assert the behavior selected by the named choice, not the implementation branch.

## Tradeoffs

- A local boolean condition can be clearer than a tiny enum when the name is visible and no API
  boundary is involved.
- Public API changes require migration care; introduce overloads or adapters when callers cannot
  move at once.
- Go lacks enums in the same shape as Rust or Java, so constants and small named types often carry
  this pattern.

## Agent Instruction

When a boolean parameter selects domain behavior, replace it with a named choice at the boundary.
Keep local boolean facts only when the meaning is visible beside the branch.

## Examples

### TypeScript call site names the behavior

The call no longer asks the reader to remember what true means for the second argument.

```ts title="src/render.ts"
type RenderMode = 'preview' | 'publish';

renderPattern(pattern, { mode: 'preview' });
```

### Java enum replaces paired booleans

The mode names the delivery behavior directly instead of combining flags at each call site.

```java title="NotificationMode.java"
enum NotificationMode {
    SILENT,
    EMAIL,
    EMAIL_AND_SMS
}

notifier.send(message, NotificationMode.EMAIL);
```

### Rust enum names the render mode

The call site chooses Preview or Publish explicitly instead of passing a boolean whose meaning lives
in the callee.

```rust title="src/render.rs"
pub enum RenderMode {
    Preview,
    Publish,
}

render_pattern(pattern, RenderMode::Preview);
```

### C# enum names the behavior

The call site no longer asks the reader to remember what true means.

```csharp title="Renderer.cs"
public enum RenderMode { Preview, Publish }

renderer.Render(pattern, RenderMode.Preview);
```

### Python literal choice replaces a flag

The mode communicates behavior at the call site.

```python title="render.py"
RenderMode = Literal["preview", "publish"]

render_pattern(pattern, mode="preview")
```

## References

- None yet.
