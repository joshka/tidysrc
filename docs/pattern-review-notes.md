# Pattern Review Notes

This note captures the first-cut review of the pattern catalog after moving pattern content into
markdown files. It is a queue for human review, not a claim that the pattern set is launch-ready.

## Current State

- Pattern entries now live in `src/content/patterns/*.md`, matching the problem-page workflow.
- Existing pattern metadata remains in frontmatter; narrative sections, guidance, examples, agent
  instructions, and references live in markdown body sections.
- Every non-seed pattern has examples for C#, Java, Python, Rust, and a TypeScript or JavaScript
  family language.
- Five seed patterns were added because the problem catalog exposed likely pattern gaps:
  `make-cache-ownership-explicit`, `make-failures-observable`, `measure-before-optimizing`,
  `move-domain-rules-inward`, and `preserve-error-context`.
- Additional seed patterns now capture missing review handles from the problem review and Tidy
  First-shaped gaps: dead code, symmetry, declaration/init locality, explicit parameters, helper
  extraction, comments, batch size, untangling, reversibility, coupling, cohesion, naming drift,
  async ownership, observability policy, and validation policy.
- AI Blindspots is now represented as a small seed cluster: preserve the spec, stop and reframe,
  state requirements before solutions, debug from evidence, prepare the workspace, and let tools
  handle mechanics. These are framed as human-and-agent failure modes; agent wording should support
  the general problem rather than replace it.

## Cross-Catalog Notes

- Pattern pages should be slightly deeper than problem pages. A good target is around three short
  paragraphs for the core idea: what the move is, when it helps, and what can go wrong.
- Pattern names should sound like review advice. A reviewer should be able to say "use guard
  clauses" or "make state transitions explicit" without translating from a clever label.
- Examples should show the pattern as a practical move, not only as a miniature code sample. The
  surrounding note should explain the maintenance problem the code is solving.
- Language examples should stay idiomatic. If a pattern changes shape in Python, Java, C#, Rust, or
  TypeScript, the examples should show that difference rather than forcing identical structure.
- Stable patterns need the strictest review because they are visually promoted before most readers
  understand the maturity model.

## Maturity Notes

- `stable` currently means "central and reasonably coherent," not "fully publication-reviewed."
- `draft` means the pattern is useful enough to show in the catalog but still needs editorial and
  example review.
- `seed` means the catalog probably needs the idea, but the shape, examples, naming, and related
  links need human review before launch.

## Per-Pattern Notes

### Avoid Premature Agent Architecture

Good pattern, but the title is narrower than the current problem framing because humans overbuild
too. Consider whether this should become "Avoid Premature Architecture" or stay agent-specific while
the problem page handles the broader framing.

### Cap Change Radius

Strong fit with the site. Review whether the examples clearly distinguish "cap the radius" from
"add another abstraction." The pattern should emphasize containing churn at a boundary, not
inventing boundaries speculatively.

### Centralize Configuration Policy

Useful and connected to several problems. Review for over-centralization risk: the page should push
narrow named policy objects, not a global config object that every caller can inspect.

### Characterize Before Changing

Strong pattern. The examples are plausible, but this page needs careful language around preserving
bugs. Characterization should record current behavior before deliberate change, not bless accidental
behavior forever.

### Chunk Statements

Useful, but comparatively small. It may remain a draft even if correct because it is more of a local
readability tactic than a major pattern. Review whether it belongs as a standalone pattern or as
part of Reader Locality.

### Explaining Variable

Strong and familiar. Review examples for names that add intent rather than restating the expression.
This page should also warn against stale local names.

### Guard Clause

Stable and central. Needs a final review for cleanup and resource-lifetime caveats across languages,
especially C# `using`, Java try-with-resources, Rust drops, and Go defers.

### Inject Time and Randomness

Strong pattern. Review Python and TypeScript examples for idiom: sometimes passing `now` is clearer
than introducing a clock abstraction.

### Keep Async Boundaries Explicit

Useful, but broad. It spans awaits, callbacks, goroutines, tasks, cancellation, and error
observation. Consider whether a later catalog split is needed around cancellation ownership.

### Make Cache Ownership Explicit

Seed. Added because `Cache Invalidation Unclear` exposed a pattern gap. Needs a deeper pass on cache
freshness policy, stale reads, async rebuilds, and key parsing before it should become draft.

### Make Failures Observable

Seed. Added because `Silent Failure Paths` needed a pattern that is not just structured errors. Needs
review around best-effort side effects and when failure should be returned versus recorded for
retry.

### Make Invalid States Hard to Express

Strong pattern. Review examples for excessive wrapper types. The pattern should make valid code
simpler or safer, not merely more formally named.

### Make Side Effects Visible

Strong pattern. Review for overlap with async boundaries and observable failures. Keep the core
message focused on mutation, I/O, time, external calls, and hidden writes.

### Make State Transitions Explicit

Strong fit, especially after reviewing hidden state-machine problems. Consider adding examples where
a struct or object has several fields that accidentally form a hidden state machine.

### Measure Before Optimizing

Seed. Added because `Performance Fix Without Evidence` needs a direct pattern. It needs better
language-specific examples: benchmark, profile, route timing, and production trace shapes differ a
lot by ecosystem.

### Move Domain Rules Inward

Seed. Added because `Domain Logic Buried in Presentation` needs a direct move. Needs review for
proper boundaries: UI formatting should stay in presentation, but business decisions should move to
a domain or application policy.

### Name Cross-Layer Contracts

Strong pattern. Review examples for DTO overuse. The page should say "name the contract when the
language changes," not "always add a mapper."

### Observable Behavior Tests

Stable and central. Needs careful examples so it does not imply only high-level tests are valuable.
The phrase "cheapest trustworthy boundary" should probably appear somewhere.

### Parse, Don’t Validate

Strong pattern. Review references and language examples closely. This page should distinguish one
boundary parser from scattered validation and avoid making every local guard look wrong.

### Preserve Error Context

Seed. Added because `Error Context Is Lost` needed a more direct pattern than returning structured
errors. Needs review around sensitive data, public error compatibility, and nested causes.

### Reader Locality

Stable and important. The examples should be checked against Ed Page's Rust style guidance without
making the page sound Rust-only.

### Replace Boolean Flag With Choice

Strong pattern. Review whether the title should mention "argument" or "parameter" for discoverability.
Examples should keep local boolean facts separate from boundary-crossing behavior flags.

### Repo-Local Instructions Win

Useful for agent workflow, but less like a code pattern than most entries. Consider whether it
belongs under agents rather than the main pattern catalog, or keep it as stable because it is central
to how TidySrc should be used.

### New Seed Patterns From Tidy First Themes

These entries are intentionally `seed`: `delete-dead-code`, `normalize-symmetries`,
`move-declaration-and-initialization-together`, `make-parameters-explicit`,
`extract-helper-after-locality`, `write-explaining-comments`, `delete-redundant-comments`,
`choose-change-batch-size`, `untangle-before-changing`, `keep-structure-reversible`,
`name-coupling`, and `strengthen-cohesion`.

They should be reviewed against TidySrc's own voice and examples before promotion. The O'Reilly
chapter list is useful as a checklist of themes, but these pages should not become a paraphrase of
Tidy First.

### New Seed Patterns From Problem Review

These entries close direct problem-page gaps: `keep-name-current`, `name-async-ownership`,
`contain-observability-policy`, and `make-validation-policy-explicit`.

They need deeper examples before promotion, especially across Python, C#, Java, Rust, and
TypeScript.

### New Seed Patterns From AI Blindspots

These entries are intentionally `seed`: `preserve-the-spec`, `stop-and-reframe`,
`state-requirements-before-solutions`, `debug-from-evidence`, `prepare-the-workspace`, and
`let-tools-handle-mechanics`.

They distill AI Blindspots posts into TidySrc names. Review them as general source-change problems
that also show up in agent workflows, not as AI-only rules.

### Return Structured Errors

Strong pattern. Review overlap with `Preserve Error Context`; one may be the general representation
pattern while the other is the boundary-preservation move.

### Separate Structure From Behavior

Stable and central. Review examples for jj workflow language later, because the page currently
describes the code change pattern more than the version-control workflow.

### Smallest Trustworthy Verification

Stable and central to agent work. Needs careful language so it does not sound like "run less test
coverage"; the point is matching the check to the risk.

## Missing Or Deferred Pattern Ideas

- Make duplicated validation policy explicit. Status: seeded as
  `make-validation-policy-explicit`; still overlaps with parse-don't-validate and invalid states.
- Name async ownership. Status: seeded as `name-async-ownership`; may become a split from Keep Async
  Boundaries Explicit if cancellation examples grow.
- Keep naming current with responsibility. Status: seeded as `keep-name-current`.
- Contain observability policy. Status: seeded as `contain-observability-policy`.
- Keep examples close to real maintenance stories. This is more of an examples policy than a pattern,
  but it should shape future content.
