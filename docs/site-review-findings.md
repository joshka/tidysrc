# Site Review Findings

This note captures a local review of the TidySrc site before deployment. The review used the
current Astro build, the local development server, and Playwright checks across sampled desktop and
mobile pages.

The site is strong enough to review as a real product surface. The main launch risk is no longer
whether the prototype has enough shape. It is whether the catalog is edited, validated, and grouped
well enough that each item feels precise and worth publishing.

## What Works

- The bento-style pattern pages are the strongest part of the site. They combine narrative,
  examples, review snippets, agent instructions, and related items in a way that matches the
  cheat-sheet/reference direction.
- The problem pages give the site a useful entry point for readers who know what hurts but do not
  yet know which pattern to apply.
- The current visual language is distinctive: blocky, editorial, technical, and more standalone
  than a default documentation theme.
- The light theme is crisp. Borders, cards, code surfaces, and the grid background have clear
  figure/ground structure.
- The dark theme is substantially improved from the earlier version. The warmer code and content
  surfaces read better than the previous dark code blocks.

## Findings

### Editorial Maturity Is the Main Launch Risk

The site now has enough volume to feel substantial: roughly twenty patterns, ten concepts, and
thirty problems. That is enough content to be useful, but it also means the launch bar moves from
layout polish to editorial quality.

Each entry needs a deliberate review for:

- Whether the advice is precise enough to be memorable.
- Whether it overlaps too much with a neighboring item.
- Whether the examples actually demonstrate the claim.
- Whether the language-specific versions are idiomatic.
- Whether the guidance avoids sounding like generic AI-generated software advice.

### The Problem Catalog Is Too Flat

The `/problems/` page works visually, but the catalog is already long enough that a flat list gives
every problem equal weight. That makes discovery harder as the catalog grows.

Group or filter problems by domains such as:

- Readability and cognitive load.
- Testing and observable behavior.
- Boundaries and layering.
- State and invalid transitions.
- Agent workflows.
- Configuration and tooling.
- Async, time, and concurrency.
- Observability and error context.

### Concept Pages Need More Weight

Concept pages are cleaner than before, but several still feel closer to glossary entries than core
reference material. They should carry more of the site's explanatory load.

The most important concept pages should explain:

- The mental model.
- The failure mode.
- Why the failure mode matters during review or maintenance.
- Which problems expose the concept.
- Which patterns address it.
- A small contrast example where that helps.

This matters especially for cognitive burden, reader locality, observable behavior, state space, and
side-effect visibility.

### Mobile Needs a Focused Pass

The sampled desktop pages did not show broad layout overflow. On mobile, pattern detail pages have a
small horizontal overflow around the bento cards on a 390px viewport. The mobile navigation also
takes too much first-screen space.

The mobile site is usable, but it does not yet feel as disciplined as the desktop layout.

Recommended fixes:

- Remove the small bento-card overflow on narrow screens.
- Compact the mobile navigation.
- Reduce large display text on detail pages.
- Tune the problem-detail hero and impact panels so they feel like dense reference material rather
  than posters.

### Dark Mode Still Needs Proportion Tuning

The current dark mode is more readable, but some dark/tan panels are visually heavy. The light theme
works because cream canvas, white cards, black borders, and dark hero blocks create a crisp hierarchy.
The dark theme sometimes uses large high-contrast panels where a smaller accent would do.

Keep the warmer dark palette, but tune:

- Large tan panels.
- Large black impact cards.
- Internal borders versus major borders.
- Muted text hierarchy.
- Mobile proportions.

### Metadata Has Some Noise

Pattern pages can show duplicated metadata, such as a `rust` tag and a `Rust` language chip on the
same page. Tags and languages should either be visually separated or deduplicated before rendering.

Language ordering should remain consistent:

```text
Go / Java / JavaScript / Rust / TypeScript
```

### Examples Are the Biggest Missing Trust Signal

The examples are plausible, but many still read as synthetic. The site does not need copied
production code, but it does need examples that feel shaped by real maintenance problems.

Add an examples policy before expanding much further:

- Use bad/good pairs when contrast is the point.
- Use one block when the lesson is about a small local move.
- Explain the concrete problem the code is solving before showing code.
- Keep general patterns consistent across the main language set where possible.
- Allow language-specific examples when the pattern is truly language-shaped.
- Prefer simplified real-world shapes over abstract toy code.

### Relationship Integrity Should Be Validated

Catalog relationships need build-time validation. A stale related id should fail fast instead of
being silently dropped or turning into a broken link.

One concrete issue found during review:

- `characterize-before-changing` references `find-the-seam`, but no matching pattern route appears
  to exist.

Validation should cover:

- Duplicate ids.
- Missing related pattern ids.
- Missing related concept ids.
- Missing problem ids.
- Duplicate tag/language chips.
- Required examples for launch-ready patterns.

### References Are Valid but Under-Organized

The references page has useful links, but it should do more than list sources. It should explain how
each source informs the site.

Group references by role:

- Refactoring catalogs.
- Pattern-language sources.
- Legacy-code practice.
- UX and software laws.
- Rust style and maintainer guidance.

Keep the references page lean. It should be useful context, not a bibliography dump.

### Search and Filtering Are Prototype-Grade

Local filtering is useful, but launch-quality discovery likely needs URL-addressable state. A reader
should be able to link directly to filtered views such as testing problems, Rust examples, or agent
workflow patterns.

Global search can wait, but the current indexes should preserve useful filter state in the URL before
the catalog gets much larger.

### Authorship Is in the Right Direction

The footer now points back to Josh without turning the site into a personal sales page. That balance
fits the current product direction.

Do not add a monetization path yet. The site will earn trust faster if the first public version is
clearly useful, carefully edited, and lightly attributed.

## Suggested Next Steps

1. Add catalog validation for ids, relationships, required fields, and duplicate language/tag chips.
2. Review the problem catalog first, because problems define why the site exists.
3. Review patterns second, making sure each one clearly answers one or more problems.
4. Review concepts third, using them to explain the durable mental models behind the patterns.
5. Add a maturity field for all content types, such as `seed`, `draft`, `reviewed`, and `stable`.
6. Group `/problems/` by domain or add durable URL-addressable filters.
7. Fix the narrow mobile overflow on pattern detail pages.
8. Compact the mobile navigation.
9. Tune dark-mode proportions on problem and pattern detail pages.
10. Add an examples policy and audit all examples against it.
11. Add richer concept pages for the core mental models.
12. Rework the references page into grouped, purposeful sources.
13. Verify generated deployment assets such as `favicon.ico`, `favicon.svg`, and `llms.txt`.
14. Add a final prelaunch checklist that combines build, link checks, accessibility checks, and
    editorial review.

## Verification Notes

- `mise exec -- pnpm build` passed during review.
- Playwright sampled light and dark desktop pages.
- Playwright sampled mobile pages at a narrow viewport.
- Desktop sampled pages did not show broad horizontal overflow.
- Mobile pattern detail pages showed small bento-card overflow.
