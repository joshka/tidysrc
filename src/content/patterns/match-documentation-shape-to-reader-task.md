---
title: >-
  Match Documentation Shape to Reader Task
summary: >-
  Choose whether a page is a catalog, procedure, reference, explanation, or review aid before
  deciding its layout and copy.
status: seed
exampleStyle: narrative
tags:
  - "documentation"
  - "ux"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "md"
  - "ts"
problems:
  - "A documentation page mixes catalog, tutorial, reference, and review work in one shape."
concepts:
  - "documentation-surface"
  - "reader-locality"
related:
  - "cut-interface-narration"
  - "name-destinations-not-directions"
  - "smallest-trustworthy-verification"
---

## Core Idea

A documentation page has a job. Catalogs help readers choose. Procedures move readers through
ordered steps. Reference pages make facts complete and scannable. Explanations build a mental
model. Review aids make evidence and risk easy to inspect.

When one rendered shape tries to serve all of those jobs, the page leaks the source structure into
the interface. Readers see frontmatter-like metadata, long README prose where a catalog should be,
or cards whose click targets are not visually obvious.

## Use When

- Markdown renders into a page that feels like raw source rather than a designed surface.
- A page mixes setup steps, background, reference data, review notes, and roadmap claims.
- Index pages are hard to scan because every row has the same prose-first shape.

## Guidance

- Name the dominant page mode before editing.
- Use layout and copy that support that mode: rows and filters for choosing, steps for procedures,
  tables for reference, paragraphs for explanation, and evidence blocks for review.
- Move secondary material behind links when it interrupts the main task.
- Validate rendered pages when changing shared templates or navigation surfaces.

## Tradeoffs

- Small documentation sets can use one generic shape until repeated friction appears.
- A page can include small supporting sections from another mode.
- Do not add filters, tabs, or layout machinery before the content size justifies it.

## Agent Instruction

Before changing a documentation page or template, state the reader task it serves and choose the
page shape around that task. Validate the rendered page when the shape changes.

## Examples

### Catalog page

Problem: a pattern index renders a README intro, schema notes, and every entry as long prose.

Better: the page groups entries by review pressure, shows concise summaries, and keeps source schema
notes in maintainer docs.

```md title="catalog-outline.md"
Pattern catalog

Readability

- Guard Clause: Exit early when edge cases obscure the main path.
- Reader Locality: Keep weak helpers near their use.
```

### Procedure page

Problem: deployment instructions are embedded in a conceptual overview.

Better: deployment has ordered commands, prerequisites, validation, and failure notes. The concept
overview links to it instead of carrying the procedure inline.

```md title="deploy-procedure.md"
Publish

1. Install dependencies.
1. Build the site.
1. Run the deployment workflow.
1. Check the published URL.
```

### Review aid

Problem: a handoff says "tests passed" after a UI change.

Better: the handoff names the changed surface, the rendered pages inspected, and the command or
screenshot that proves the surface still works.

```md title="review-evidence.md"
Changed surface: pattern catalog filtering.
Validation: pnpm check:site.
Rendered pages inspected: /patterns/, /search/.
```

## References

- Docs Match Page Shape To Reader Task
- Docs One Dominant Mode Per Page
- Test Match Evidence To Surface
