---
title: >-
  Interface Narration Obscures the Task
status: seed
category: readability
topics:
  - documentation
  - ux
  - navigation
summary: >-
  Page copy describes cards, sections, flows, or the reader's journey instead of naming the work
  area, artifact, decision, or behavior.
relatedPatterns:
  - cut-interface-narration
  - name-destinations-not-directions
  - match-documentation-shape-to-reader-task
relatedConcepts:
  - documentation-surface
  - reader-locality
  - cognitive-burden
---

## Description

Interface narration appears when documentation copy talks about the page shape instead of the thing
the reader came to inspect. The words may sound polished, but they make readers translate from
"this section guides you through..." or "these cards expose..." into the actual destination.

This is common in generated site copy, landing pages, index rows, and documentation catalogs. The
page starts explaining itself before it names the work area, decision, command, rule, or artifact.

## Why It Matters

Readers use headings and link text as navigation. When those labels narrate the interface, the
reader has to infer whether a section is a reference, procedure, concept, checklist, or source
catalog. That extra inference raises cognitive burden and makes review comments harder to cite.

## Code Impact

The implementation risk is usually in content and templates. Cards, rows, headings, and metadata
fields can encourage copy that repeats the UI model instead of the source-change model. Agents then
imitate that style and spread page narration into otherwise useful docs.

## Signals

- Link text says "start here", "open this guide", or "use this page" on a reference surface.
- Headings describe what the page is doing instead of the destination below them.
- Cards mention cards, sections, maps, flows, or the catalog before naming the work area.
- Metadata, IDs, prefixes, or generated structure appear before reader-facing meaning.

## Diagnostic Questions

- What destination, decision, artifact, or behavior should the label name?
- Is this page a procedure, catalog, reference, explanation, or review aid?
- Does the copy still work if a reader arrives from search or a direct link?
- Is any UI or catalog machinery visible only because it was convenient to generate?

## Approach

- Replace page narration with concrete labels for work areas, artifacts, decisions, and behaviors.
- Use imperative copy only when the page is actually a procedure or checklist.
- Keep metadata and generated structure in frontmatter, filters, chips, or maintainer docs unless
  the reader needs it for citation.
- Review rendered pages, not only Markdown source, when navigation copy changes.

## Examples

### Problem: the card narrates itself

The copy makes the reader parse the page model before the destination.

```md title="problem-card.md"
Explore the cards below to discover how each rule family can guide your work.
```

### Better: the card names the destination

The label names the work area directly.

```md title="better-card.md"
Rule families for documentation, testing, review, source control, and agent workflow.
```
