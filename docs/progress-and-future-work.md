# Progress and Future Work

This document summarizes the major work completed during the current TidySrc prototype thread and
captures items that were discussed but intentionally left for later. It is a handoff note, not a
launch checklist.

## Completed Work

### Standalone Astro Site

The project was reset into a standalone Astro content site rather than a publishing sidecar for
`joshka.net`. The site now uses `pnpm` and `mise`, and the local workflow favors `jj` changes for
reviewable increments.

The foundation is a custom Astro site instead of Starlight. That keeps the primary experience closer
to a pattern catalog, with top navigation, grouped cards, filters, and stable pages instead of a
left-sidebar documentation manual.

### Site Planning

`docs/site-plan.md` captures the canonical product direction: a pattern language for everyday source
change, aimed at reviewers, agents, and learners. It records the decision to keep the site
standalone, concise, searchable, and structured enough for agent consumption.

The plan also records the main page models: patterns, problems, concepts, agents, configs, and
references. Several later implementation decisions follow that structure.

### Writing Guidelines

`docs/writing-guidelines.md` defines the editorial style for TidySrc. It was adapted from prior
Komodo documentation work and narrowed for this site.

The guide now includes a reader model: TidySrc pages are hybrid surfaces. They should skim like
cards during review while still carrying enough prose to explain tradeoffs.

### Content Collections

Patterns, problems, concepts, and references now live as content files instead of large in-code
data structures. The Astro content collections validate frontmatter and build pages from those
files.

Problems were migrated to markdown sections that are parsed as structured content. Each problem
requires impact, signals, diagnostic questions, approach, and optional examples.

### Maturity Metadata

Content entries now have maturity/status metadata such as `seed`, `draft`, `reviewed`, and
`stable`. New additions from broad source material are generally marked `seed` so they can be
hidden, filtered, or reviewed before being treated as launch-ready.

### Problem Catalog

The `/problems/` section was added and filled in. Problem pages connect vague review symptoms to
diagnostic questions and related patterns.

Problem categories were added, category chips became clickable, and the problem index gained
pathway cards for grouped navigation. Problem cards now show a compact "Why it matters" block from
each problem's impact section, so browsing surfaces the consequence and not only the symptom.

### Pattern Catalog

Pattern pages now use the bento-style layout: core idea, use when, guidance, tradeoffs, examples,
agent instruction, review snippet, related links, and references.

The pattern index gained grouped entry points for common change pressures such as readability,
boundaries, testing, workflow, effects, and agent-resistant defaults. These cards drive the existing
filters rather than creating a separate taxonomy.

### Concept Catalog

Concept pages were moved to content files and grouped on the concept index. The index now has
navigation groups for reader model, boundaries and shape, change workflow, and effects/state/time.

The intent is for concept pages to carry explanation that would make pattern pages too long.

### References

The references section now includes external sources such as Tidy First and AI Blindspots, alongside
the earlier software-pattern, refactoring, and legacy-code sources.

References are treated as context, not authority. Some overly narrow discussion links were moved
away from the main reference direction when they felt too specific for a top-level reference page.

### Code Examples

Pattern and problem examples were expanded across the main review languages where useful: C#, Java,
JavaScript/TypeScript, Python, and Rust, with C, C++, and Go included where they clarify a
particular problem.

Bad/good example labeling was added for cases where contrast teaches the issue better than a single
snippet. Examples now include notes that explain the problem being solved rather than presenting
code as standalone decoration.

### Language Presentation

Language choices are sorted consistently in display code paths. Code examples use tabs where a
pattern has multiple languages, so a reader can choose the language that matches their context.

The current language direction is to emphasize Python, Java, C#, JavaScript/TypeScript, and Rust;
use C, C++, and Go when they add real value rather than forcing every page to cover every language.

### Copyable Review and Agent Surfaces

Pattern pages now include copyable agent instructions and copyable markdown review snippets. The
review snippet names the pattern, briefly states the problem, and links back to the page.

The copy controls were adjusted to behave more like Expressive Code copy controls: small icon
button, top-right placement, hover visibility, and no extra layout space.

### Theme and Visual Direction

The site evolved toward a modernist, blocky, card/cheat-sheet visual style inspired by the Google
Stitch explorations. The light theme remains the clearest reference point.

The dark palette was tuned after earlier versions lost figure/ground clarity. The current direction
uses a more neutral charcoal base, stronger borders, muted text hierarchy, and amber accents without
letting the entire theme become warm mud.

### Code Block Readability

Expressive Code was styled to feel more integrated with the bento layout. Code surfaces, borders,
copy controls, and syntax token colors were adjusted for both light and dark themes.

The build check includes a Playwright-backed syntax contrast pass over rendered pages so invisible
or low-contrast highlighted tokens fail fast.

### Font Consistency

Rendered pattern pages were checked for computed font families. Page text and UI now use the site
sans token, while code and copy snippets use the site mono token.

Several inheritance leaks were fixed: pathway-card buttons, copy snippets, and Expressive Code copy
buttons no longer fall back to browser default fonts.

### Agentic Pattern Cluster

The agent-guidance cluster was expanded with seed patterns that describe human and agent failure
modes:

- Constrain the Agent Edit Surface.
- Separate Exploration From Editing.
- Report Verification Honestly.
- Preserve Human Changes.
- Keep Agent Handoff Current.
- Pin Authoritative Context.
- Make Stop Conditions Explicit.
- Review Generated Code Normally.

These entries are meant to generalize beyond AI-only behavior where the same problem also appears
in human workflow.

### Tidy First and AI Blindspots Source Material

Tidy First and AI Blindspots were added as source material and references. They informed seed
patterns around behavior-preserving change, preparatory refactoring, stop conditions, context
hygiene, debugging from evidence, and respecting specifications.

The implementation deliberately did not import every article as a one-to-one pattern. The better
fit is curated TidySrc entries that cite the source material where relevant.

### Validation and Checks

The project now has validation for content shape and relationship integrity. Checks cover content
schema, missing related ids, duplicate ids, required sections, examples, link integrity, build
health, and syntax contrast.

The routine verification path used throughout this thread was:

```sh
markdownlint-cli2 <changed markdown files>
node scripts/check-content.mjs
mise exec -- pnpm check
mise exec -- pnpm check:site
```

## Future Work

### Full Editorial Review

Every pattern, problem, and concept still needs a deliberate human review before launch. The site
has enough volume to feel real, but launch quality depends on whether each item is precise,
memorable, and worth linking in review.

For each entry, check overlap with neighbors, whether the examples prove the claim, whether the
language variants are idiomatic, and whether the prose follows `docs/writing-guidelines.md`.

### Final Design Pass

The current layout is intentionally usable but not final. A future pass should apply the stronger
Google Stitch visual ideas without losing the current bento structure.

The goal is not to redesign the information architecture. It is to refine spacing, color,
proportions, mobile scale, and card rhythm so the site feels launch-ready.

### Mobile Polish

Mobile was sampled and improved, but it has not had the same level of polish as desktop. The next
pass should focus on detail-page display type, hero density, navigation height, bento proportions,
and problem impact panels.

The target is a dense reference surface, not a poster layout squeezed onto a small viewport.

### Real-World Example Sourcing

Examples are the largest remaining trust signal. Many examples are plausible, but they still feel
synthetic in places.

Future work should collect simplified real-world shapes from maintenance experience, open-source
examples, or review notes. These should be rewritten to avoid copying project-specific code while
preserving the real problem shape.

### Example Policy

The site has a working convention for bad/good examples, but not a canonical policy. Write a short
policy for when to show a problem and better version, when to show only one snippet, and when a
language-specific example is justified.

The policy should also state how many languages a page should cover before examples become review
noise.

### Language Coverage Review

The language set needs a pragmatic editorial pass. Python, Java, C#, JavaScript/TypeScript, and
Rust are the likely core languages. C, C++, and Go should be added where the problem naturally
appears in those ecosystems.

Python in particular needs idiom review. Some problems need both object-shaped and dict-shaped
examples, while others should choose one clear idiom.

### Taxonomy and Grouping

The current categories and pathway cards are useful, but they are not a final taxonomy. As content
grows, review whether tags, categories, topics, audiences, and maturity statuses are distinct
enough to be useful.

Avoid building a taxonomy wall. The grouping should help readers choose an entry point and help
agents retrieve relevant guidance.

### Agent Failure Modes Surface

The agentic patterns exist as seed entries, but there is not yet a dedicated guide or landing page
for agent failure modes. A future `/agents/` pass could group these into a practical workflow:
prepare, constrain, explore, edit, verify, hand off.

That surface should still avoid becoming a separate AI manual. The same patterns should remain part
of the general source-change language.

### Configs and Agent Instructions

The `/configs/` section exists, but it needs a focused pass to decide which reusable files belong
there. Candidate material includes AGENTS.md snippets, review prompts, verification handoff
templates, lint/format guidance, and agent stop-condition templates.

Configs should be practical and copyable, not another essay surface.

### References Organization

References are valid but still under-organized. Group them by role: refactoring catalogs,
pattern-language history, legacy-code practice, UX/software laws, agent tooling, and source-change
economics.

Each reference should say what a reader should expect from the source. Avoid bridge prose that only
explains that the link exists.

### Monetization and Author Surface

A monetization path was discussed and intentionally deferred. The footer now points back to the
author without making the site feel too self-promotional.

If monetization returns later, keep it lightweight and separate from the pattern-reading flow.

### Full AI Blindspots Mapping

AI Blindspots was read and partially mapped into seed TidySrc entries. A future pass could revisit
all 20 articles and decide which should strengthen existing entries, become references only, or
suggest new patterns.

Avoid one page per source article. Prefer durable TidySrc names that combine related source ideas.

### Full Tidy First Mapping

Tidy First inspired several seed patterns and concepts, but it has not been exhaustively mapped.
Future work should compare the book's chapters against existing patterns and decide where TidySrc
needs a new entry, a reference note, or no additional content.

New items from this pass should remain `seed` until reviewed.

### Launch Readiness Checklist

Before deployment, create a short launch checklist that covers editorial maturity, relationship
validation, mobile review, contrast, broken links, copy controls, theme behavior, metadata quality,
and representative examples.

This should be separate from the progress log so it remains actionable.
