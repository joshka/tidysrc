# TidySrc Site Plan

TidySrc is a standalone pattern language for making source code easier to change. The site should
help people name source-change patterns in review, give coding agents durable fallback guidance, and
teach deeper concepts without turning the first experience into a book or a documentation manual.

## Recommendation

Build TidySrc as a custom Astro content site.

Do not use Starlight as the main foundation for the first site build. Starlight is a strong
documentation framework, but its default model is a left-sidebar manual. TidySrc should instead feel
like a pattern library: fast to search, easy to skim, durable to link, and structured enough for
agents to consume.

Optimize equally for three audiences:

- Reviewers need stable links, short summaries, and examples that fit the context of a review
  comment.
- Agents need structured pages, copyable instructions, and consolidated guidance that is easy to
  retrieve.
- Learners need clear context, tradeoffs, and deeper conceptual material when they want to
  understand the idea behind a pattern.

When those needs conflict, default to clarity and brevity on the main surface. Put depth in concept
pages, related links, expandable sections, or later guide paths.

## Do This, Not That

Do this:

- Use top-level navigation, a searchable catalog, filters, and stable pattern URLs.
- Make each pattern page concise by default, with a strong one-sentence form.
- Give each pattern enough metadata to power cards, search, related links, and agent surfaces.
- Use Rust-first examples, while allowing other languages where they explain a pattern better.
- Provide copyable agent instructions on pattern pages.
- Keep deeper teaching material in `/concepts/` instead of making every pattern page a long article.
- Use targeted client-side islands for search, filters, code tabs, and copy controls.
- Keep the site independent from personal publishing pipelines.

Do not do this:

- Do not make the first experience a docs manual with a mandatory global sidebar.
- Do not start with a giant taxonomy that overwhelms the initial content set.
- Do not make the site an encyclopedia of all software patterns.
- Do not bury linkable pattern entries inside long guide chapters.
- Do not rely on code snippets without explaining the change pressure and tradeoff.
- Do not make examples so abstract that they fail to teach the real pattern.
- Do not make examples so large that the reader must reconstruct a whole project to understand them.

## Information Architecture

Use plural, stable routes:

```text
/                 home
/patterns/        searchable pattern catalog
/patterns/:slug/  individual pattern page
/concepts/        deeper teaching anchors
/concepts/:slug/  individual concept page
/agents/          agent-facing guidance
/configs/         reusable config files and explanations
/references/      influences and prior art
```

Reserve `/problems/` for a follow-up discovery surface. Problem-oriented discovery is important, but
it should not block the first build. The content model should still capture enough metadata to make
future problem pages straightforward.

The primary navigation should be:

```text
Patterns  Concepts  Agents  Configs  References  Search
```

Do not make source tree layout determine public URLs. The public URL shape is a long-term contract.

## Page Models

### Home Page

The home page should explain and route.

It should include:

- A direct statement of what TidySrc is.
- A search entry point.
- Links to patterns, concepts, agents, configs, and references.
- A small set of featured patterns.
- A short explanation that the site is for review links, agent guidance, and everyday source-change
  decisions.

It should not be a manifesto-first page. It should also not be only the pattern catalog. The user
should understand the site quickly and then move to the surface they need.

### Pattern Catalog

The catalog is the primary working surface.

It should support:

- Search by title, summary, aliases, tags, and problem terms.
- Filters for tags, language coverage, status, and audience fit.
- Compact entries that show title, one-line summary, tags, and useful metadata.
- Stable links to pattern pages.

Prototype two or three catalog presentations during implementation before finalizing the visual
form. The default assumption is compact rows or restrained cards, but this should be validated
visually.

### Pattern Page

A pattern page should be concise by default.

Default visible sections:

- Title.
- One-sentence review-comment form.
- When to use it.
- Guidance.
- Tradeoffs.
- Examples.
- Copyable agent instruction.
- Related patterns and concepts.

Optional or deeper material:

- Full context.
- Longer rationale.
- References.
- Extended examples.
- Links to concept pages.

Each pattern should also provide an ultra-compact form for catalog cards, OpenGraph descriptions,
and link previews.

### Concept Page

Concept pages carry teaching depth that would otherwise bloat pattern pages.

Use concept pages for repeated ideas such as:

- Reader locality.
- Observable behavior.
- Agent guidance.
- Cognitive burden.
- Structure versus behavior.

Concept pages can be more narrative than pattern pages, but they should still prefer clear headings,
examples, and links back to concrete patterns.

### Agent Page

The agent page should be concise and operational.

It should include:

- A reusable instruction snippet.
- Guidance on how repo-local instructions override TidySrc.
- Links to agent-relevant patterns.
- Short consolidated rules for common agent failure modes.
- A plan for `llms.txt` or equivalent machine-readable summary content.

Pattern pages should include copyable agent instructions targeted at how agents build software, not
just prose written for humans.

## Content Model

Use content collections with typed frontmatter for patterns and concepts.

Each pattern must have:

```yaml
title: Use a Guard Clause
slug: guard-clause
summary: >-
  Exit early when a boring precondition would otherwise indent or obscure the
  main path.
status: seed
tags:
  - readability
  - control-flow
  - refactoring
audiences:
  - reviewers
  - agents
  - learners
languages:
  - rust
related:
  - chunk-statements
  - parse-dont-validate
  - make-invalid-states-hard-to-express
```

Use lightweight status values:

- `seed`: early page that proves the content shape.
- `draft`: useful but still incomplete or lightly validated.
- `stable`: ready to cite without caveats.

Start with 8 to 12 patterns. That is enough to prove the catalog, metadata, related links, and
example presentation without pretending to be complete.

Start with only a few concept anchors. Concepts are important, but the first milestone should not
become a textbook.

## Code Examples

Use Rust-first examples by default. Add other languages when they make a pattern clearer or when the
pattern is not Rust-specific.

Prefer small realistic examples. They should feel like real code, but they can be written for the
page. Real extracted examples from open-source repositories are a good future direction, but they
add source-linking, context, licensing, and maintenance cost that should not block v1.

Support multi-file examples selectively. They are useful when a pattern crosses files, such as tests
plus implementation or agent instructions plus repo-local defaults. Do not force every pattern into
a multi-file format.

Use Markdown for simple examples and MDX or Astro components for richer examples.

The implementation should provide components or conventions for:

- Language tabs.
- File tabs.
- Filenames.
- Diff markers.
- Highlighted lines or words.
- Copy buttons.
- Optional terminal or editor frames.

Use Expressive Code as the provisional recommendation for code presentation. Validate it during
implementation against the required code-sample behaviors before treating it as final. If it does
not fit multi-file examples or MDX composition cleanly, use Astro's Shiki pipeline plus small custom
components instead.

## Technical Foundation

Use Astro as the site foundation.

Use:

- Astro content collections for typed metadata and generated pages.
- Markdown for ordinary content.
- MDX for pages that need richer examples or interactive components.
- Minimal client-side islands for search, filters, code tabs, copy buttons, and similar focused
  interactions.
- Static generation by default.

Do not switch to VitePress, Docusaurus, MkDocs Material, or another static site generator unless a
concrete requirement appears that Astro cannot satisfy. Those frameworks are capable, but they start
from documentation-site assumptions and do not solve the main pattern-library problem better than
Astro.

Starlight can be reconsidered later for a separate subsection if TidySrc grows a conventional manual
that benefits from persistent sidebar navigation. It should not drive the v1 information
architecture.

## Visual Direction

Use a quiet reference style.

The site should be:

- Readable.
- Fast to scan.
- Restrained.
- Typographically strong.
- Dense enough for repeated use.
- Friendly to code examples and short summaries.

Avoid:

- Marketing-page composition.
- Oversized decorative heroes.
- Heavy illustration as the primary structure.
- A one-note color palette.
- UI cards nested inside other cards.
- Sidebar-first layouts that imply a manual instead of a pattern library.

Pattern pages can use a centered article column. Long pages may include an optional right-side
on-page outline on wide screens. Mobile pages should keep the pattern summary, examples, and
copyable agent instruction easy to reach.

The catalog visual form should be prototyped before finalizing. Compare:

- Compact rows.
- Restrained cards.
- Grouped category sections with search.

Choose the variant that makes repeated lookup and link copying fastest while still feeling
approachable to first-time readers.

## Landscape Lessons

Borrow durable catalog behavior from [Refactoring.com](https://refactoring.com/catalog/): stable
names, compact entries, and linkable pages.

Borrow approachable pattern-library presentation from [Frontend
Patterns](https://frontendpatterns.dev/) and [Patterns.dev](https://www.patterns.dev/): top
navigation, modern scanning, and examples that help the reader move quickly from concept to
application.

Borrow problem-oriented grouping from
[Microservices.io](https://microservices.io/patterns/index.html) and [Enterprise Integration
Patterns][enterprise-integration-patterns]: patterns become more useful when readers can start from
the problem they are trying to solve.

Borrow faceted discovery ideas from the [Interface Refactoring
Catalog](https://interface-refactoring.github.io/) and [Azure Cloud Design
Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/): the same pattern should
be discoverable by concern, tag, language, and audience.

Borrow concrete example discipline from [Code Catalog](https://codecatalog.org/) and dense lookup
behavior from [Code Smells Catalog](https://www.codesmells.org/).

Do not copy the full shape of any one site. TidySrc's distinct position is:

```text
Short, addressable patterns for making source code easier to change.
```

That includes code shape, tests, documentation, review, local workflows, and agent behavior.

## Implementation Milestones

### Milestone 1: Foundation

- Keep Astro as the framework.
- Add content collections for patterns and concepts.
- Establish stable routes for the main sections.
- Create shared layouts for home, catalog, pattern pages, concept pages, and utility pages.
- Add repo-local Markdown linting with 100-character prose wrapping and tables exempted from
  line-length checks.

### Milestone 2: Content Seed

- Create the first 8 to 12 pattern pages.
- Create a few concept anchors.
- Create the agent guidance page.
- Create references and configs pages.
- Ensure every pattern has useful-minimum metadata.

### Milestone 3: Discovery

- Build the searchable pattern catalog.
- Add filters for tags, status, language coverage, and audience fit.
- Generate related links from metadata where practical.
- Preserve hand-authored related links when they express a meaningful editorial relationship.

### Milestone 4: Examples

- Validate Expressive Code against the desired code-sample behaviors.
- Add single-file example presentation.
- Add selective multi-file example support.
- Add copy-code and copy-agent-instruction controls.

### Milestone 5: Polish

- Prototype catalog rows, restrained cards, and grouped sections.
- Choose the catalog layout based on scanning, search, and link-copying speed.
- Add OpenGraph descriptions from the ultra-compact pattern form.
- Check responsive behavior and accessibility.
- Add `llms.txt` or an equivalent machine-readable summary surface.

## Alternatives Considered

### Starlight

Starlight is a good choice for conventional documentation sites. It provides a lot of useful
defaults: sidebar navigation, search, typography, dark mode, and Markdown/MDX support.

It is not the recommended v1 foundation because TidySrc should not feel like a manual by default.
The main user action is lookup, scanning, linking, and pattern comparison.

Revisit Starlight if a future subsection becomes a deep manual.

### Docs-Shell Sidebar

A permanent sidebar can help when a user needs to traverse a deep hierarchy. It is less useful for a
small pattern language where search, filters, category pages, and related links are more important.

Use an optional on-page outline for long pages instead.

### Guide-First Information Architecture

A guide-first site can teach well, but it makes review linking and agent lookup secondary. TidySrc
can add curated guides later after the catalog proves the content model.

### Problems-First Information Architecture

Problem-oriented discovery is valuable. It should be designed into metadata and added as
`/problems/` later. The first build should ship patterns plus concepts so the site has stable named
entries before building more discovery surfaces.

### Real Extracted Examples

Real examples are a strong end goal because they show patterns in live code. They are not the v1
default because they require extra context, source selection, licensing care, and maintenance. Use
small realistic examples first.

### Rich Metadata From Day One

Deep facets can make discovery powerful, but they raise authoring cost. Start with useful-minimum
metadata and add facets when repeated browsing needs appear.

## Acceptance Criteria

The first implementation that follows this plan is acceptable when:

- The homepage explains TidySrc and routes to the major sections.
- The catalog supports search and filtering over seeded pattern metadata.
- Pattern pages have concise defaults, examples, related links, and copyable agent instructions.
- Concept pages exist for repeated teaching material.
- Agent guidance exists in a consolidated page.
- Code examples support filenames, highlighting, and copy behavior.
- Public routes match the planned URL shape.
- Markdown linting passes.
- The visual direction is quiet, reference-like, and not sidebar-first.

[enterprise-integration-patterns]:
    https://www.enterpriseintegrationpatterns.com/patterns/messaging/toc.html
