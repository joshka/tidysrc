# Concept Review Notes

This note captures the first-cut review of concept pages after moving them into markdown files. It
is a queue for human review, not a publication checklist.

## Current State

- Concept entries now live in `src/content/concepts/*.md`, matching the pattern and problem content
  workflow.
- Reference entries now live in `src/content/references/*.md`, so external source notes can be
  edited without touching TypeScript.
- Concept metadata remains in frontmatter. Explanatory sections and optional examples live in the
  markdown body.
- `Cognitive Burden` received a second explanatory section because it was too thin to carry the
  site's reader model.

## Cross-Catalog Notes

- Concepts should carry the durable "why" behind several patterns. If a concept only defines a term,
  it is not doing enough work.
- A good concept page should explain the mental model, the failure mode, how it appears in review,
  and which patterns apply it.
- Concept examples do not need to be as exhaustive as pattern examples, but the important concepts
  should show at least one concrete code shape. `Reader Locality` currently does this best.
- Concepts should avoid sounding like generic principles. They need to connect back to source-change
  decisions: review burden, behavior contracts, boundaries, state, side effects, and verification.

## Per-Concept Notes

### Agent Guidance

Useful but still more operational than conceptual. Review whether this should be split between an
agent-facing guide page and a smaller concept page about instruction precedence and verification.

### Boundary Trust

Strong concept. It should be expanded with examples showing raw request/config/database shapes
becoming trusted domain values or structured boundary errors.

### Change Radius

Strong and central. It needs examples showing a small conceptual rule that touches many files, then
a boundary move that shrinks future radius.

### Cognitive Burden

Important reader-model concept. It now has enough prose to avoid being just a glossary item, but it
still needs concrete examples that distinguish line count from live facts.

### Observable Behavior

Strong concept. Add examples that compare tests pinned to private helper calls with tests pinned to
caller-visible outputs, errors, state, or effects.

### Reader Locality

Currently the strongest concept page because it already has contrast examples. Review whether the
examples should cover more than TypeScript before launch.

### Side Effect Visibility

Good concept. Needs examples across pure-looking calls that mutate, publish, read time, or start
background work.

### State Space

Strong concept and likely important for the hidden state-machine discussion. Add examples with
boolean fields, nullable fields, loose strings, and explicit variants or transition methods.

### Structure Versus Behavior

Central to the site. Needs examples showing a structure-only change, a behavior change, and why
combining them makes review and rollback harder.

### Temporal Coupling

Good concept, but abstract. It needs examples for unawaited promises, goroutines without
cancellation, sleeps in tests, and lifecycle-dependent state.

## Reference Notes

- References are now individual markdown files, but they are still flat. A later pass should group
  them by role: refactoring catalogs, pattern-language sources, legacy-code practice, UX/software
  laws, Rust style, and AI blind spots.
- Keep the reference page lean. It should explain why each source matters to TidySrc, not become a
  bibliography dump.
