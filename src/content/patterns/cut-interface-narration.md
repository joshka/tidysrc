---
title: >-
  Cut Interface Narration
summary: >-
  Replace copy that narrates the page, component, or reader journey with concrete behavior,
  evidence, tradeoffs, or destination labels.
status: seed
exampleStyle: narrative
tags:
  - "documentation"
  - "ux"
  - "readability"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "md"
problems:
  - "Page copy describes the interface instead of the reader's task."
concepts:
  - "documentation-surface"
  - "reader-locality"
related:
  - "name-destinations-not-directions"
  - "write-explaining-comments"
  - "delete-redundant-comments"
---

## Core Idea

Documentation copy should explain the system, command, artifact, tradeoff, or destination. When it
starts narrating the page structure, it asks readers to translate the interface back into the work
they came to do.

Generated prose often has this shape: it is smooth, positive, and vague. The fix is not to make
docs colder. The fix is to replace interface narration with the specific object the reader can use.

## Use When

- A landing page, index, card, or heading describes the UI container instead of the destination.
- Copy sounds polished but avoids concrete behavior, evidence, tradeoffs, or commands.
- A review comment cannot cite the page because the label does not name the work area.

## Guidance

- Name the artifact, behavior, work area, or decision first.
- Cut words that explain what the page is doing unless the page machinery is the subject.
- Keep a human voice, but make every sentence carry a contract, example, tradeoff, or navigation
  label.

## Tradeoffs

- Some procedures need directional copy because the reader is following ordered steps.
- Short helper text can orient a complex interface, but it should still name the reader's task.
- Do not remove useful explanation only because it is friendly.

## Agent Instruction

When editing documentation UI copy, remove page and component narration unless the component is the
subject. Replace it with concrete destination labels, behavior, evidence, or tradeoff language.

## Examples

### Generated landing copy

Problem: "These cards guide you through the full map of development practices."

Better: "Development practice areas: documentation, testing, review, source control, and agent
workflow."

```md title="landing-copy.md"
Development practice areas: documentation, testing, review, source control, and agent workflow.
```

### Catalog row copy

Problem: "This section exposes the patterns you can use to improve readability."

Better: "Readability patterns for naming, control flow, locality, and review comments."

```md title="catalog-row.md"
Readability patterns for naming, control flow, locality, and review comments.
```

### Review note

Problem: "The page walks readers through how setup should be reasoned about."

Better: "Setup docs name the required tools, install command, local server command, and validation
command."

```md title="review-note.md"
Setup docs name the required tools, install command, local server command, and validation command.
```

## References

- Docs Avoid Generated Prose Tells
- Docs Write Technical Prose
- Docs Hide Catalog Mechanics
