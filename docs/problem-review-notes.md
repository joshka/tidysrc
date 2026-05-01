# Problem Review Notes

This note captures the first-cut editorial review of the problem catalog after adding examples and
maturity metadata. It is not a publication checklist. Use it as a queue for later manual review,
renaming, merging, and example refinement.

## Current State

- Every non-seed problem has examples for C#, Java, Python, Rust, and a TypeScript or JavaScript
  family language.
- Examples use `Problem:` and `Better:` labels when a contrast pair helps the reader understand the
  move.
- Seed items are kept in the content set, but should not be treated as launch-ready guidance.
- Reviewed items should still receive a final prose and example pass before deployment.

## Cross-Catalog Notes

- Problem titles should be usable in review conversations. A reader should be able to say "this is
  hidden main path" or "this is mixed structure and behavior" without needing the full page open.
- Prefer problem names that describe what the reader experiences, not the implementation mechanism
  alone.
- Examples are the main trust signal. When an example is synthetic, it should still look like a
  simplified version of a real maintenance problem.
- When possible, show the same problem shape across the main language set. Let language-specific
  examples diverge only when the language idiom really changes the shape.
- Keep bad/good pairs compact. If the example needs too much setup, the surrounding prose should
  explain the scenario before the code.

## Per-Problem Notes

### Ambiguous State Transitions

Good topic. It may need stronger naming around "implicit state machine" or "hidden state machine" if
that phrase proves more recognizable during review. The current framing works, but the next pass
should check whether the examples make the state transition problem obvious without extra prose.

### Boolean Flag Maze

Useful and concrete. Consider whether "Boolean Flag Maze" or "Flag Argument Maze" is clearer. The
page should keep the emphasis on combinations of choices, not only on a single boolean parameter.

### Cache Invalidation Unclear

The examples are plausible, but the title is slightly abstract. A later pass should decide whether
the reader-facing problem is unclear ownership, unclear freshness, or hidden cache invalidation.

### Concurrency Assumptions Hidden

Worth keeping, but broad. The page may eventually split into shared mutation, async ownership,
cancellation, and thread-safety variants. For now, review whether the examples show hidden
assumptions rather than generic concurrency risk.

### Configuration Drift

Likely useful as-is. Later review should add examples that feel closer to real project drift: command
flags, environment variables, CI settings, local defaults, and production overrides.

### Cross-Cutting Policy Scattered

Strong catalog fit. It overlaps with configuration and boundary pages, but the core problem is
distinct: one policy is implemented in too many places. Review whether each language example keeps
the policy concrete.

### Data Migration Risk

Useful but high-risk as advice. Migration guidance can become domain-specific quickly. The next pass
should check for overclaiming and make sure examples emphasize reversibility, observability, and
small verified steps.

### Domain Logic Buried in Presentation

The renamed title is stronger than the earlier UI-specific wording. Confirm that "presentation" is
the right broad term for UI, templating, rendering, and response formatting. The page should not
become anti-UI; the problem is domain decisions hiding in output code.

### Error Context Is Lost

Likely keep. The problem is clear and the examples make the cost concrete. Later review should make
sure each "better" example preserves context without dumping excessive internals into user-facing
errors.

### Hidden Main Path

Reviewed and currently the model for deeper problem pages. It should still receive one final
editorial pass because it is likely to be an early prototype page for the whole problem format.

### Hidden Side Effects

Useful, but overlaps with the side-effect visibility concept. Keep the problem page focused on what
goes wrong in code review: a reader cannot see that a call writes, publishes, mutates, or schedules
work.

### Mixed Structure and Behavior

Important and well aligned with the existing pattern language. The renamed title is stronger than
"mixed diff risk". Review whether the examples separate mechanical movement from behavior changes
clearly enough.

### Naming Drift

Useful, but examples may need more real project evolution. The next pass should show names that were
reasonable at first and became wrong as responsibilities changed.

### Observability Noise

Good topic, but it can drift into operations advice. Keep the source-change framing: logs, metrics,
and traces should help a maintainer answer what changed and whether it worked.

### Performance Fix Without Evidence

Strong fit. Later review should add or link to benchmark, profiling, and measurement guidance. Make
sure examples avoid implying that measurement has to be elaborate for every small change.

### Premature Architecture

Now broader than agents, which is the right direction. Confirm that the title is better than
"Overengineering" or "Premature Generalization". The page should cover humans and agents without
making agents the whole point.

### Raw Input Leaks Inward

Useful and closely related to parse-don't-validate. Keep the problem page about boundary failure:
raw strings, maps, JSON, or request objects move too far into the system before becoming named
domain values.

### Repeated Validation Rules

Seed. This currently overlaps with raw input leaks and parse-don't-validate. It may become useful if
the site needs a separate problem about duplicated validation policy, but it should not be treated as
launch-ready yet.

### Review Comment Lacks a Pattern Name

Seed. This is useful workflow guidance, but may belong under agents, reviewing, or site usage rather
than the general problem catalog.

### Risky Legacy Change

Useful but broad. It may need narrower examples around characterization tests, small seams, and
observable behavior. Review carefully so it does not become a generic "legacy code is hard" page.

### Silent Failure Paths

Strong general problem. The examples should continue emphasizing swallowed errors, ignored results,
and success-looking APIs that hide failure.

### Tests Freeze Private Shape

Strong fit with observable behavior tests. Review whether examples protect behavior while avoiding
the opposite mistake: tests so broad that failures no longer diagnose the change.

### Time-Dependent Tests

Strong and concrete. The language examples should stay idiomatic around injected clocks, fakes, and
deterministic test setup.

### Tooling Contract Implicit

Seed. This may belong under configs or contributor workflow rather than problems. Keep it out of the
launch problem set unless it gains a clearer source-change problem framing.

### Unclear Async Ownership

Useful, but cancellation and lifetime examples may need extra review. The page should focus on who
owns a task, who can cancel it, and where failure is observed.

### Unclear Done Signal

Seed. This is probably a verification or agent-workflow page, not a general software-development
problem page.

### Weak Abstractions Hide Context

Good topic, but the title is generic. Later review should test alternatives that name the reader's
pain more directly, such as "Abstraction Hides the Decision" or "Indirection Hides Context".

### Wide Change Radius

Strong fit with the plan. Later review should make sure it does not duplicate change-radius concept
material too much; the problem page should stay grounded in the experience of making one conceptual
change across too many files.
