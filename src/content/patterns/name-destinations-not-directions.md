---
title: >-
  Name Destinations, Not Directions
summary: >-
  Write navigation, headings, cards, and index rows as labels for destinations, decisions,
  artifacts, or work areas.
status: seed
exampleStyle: narrative
tags:
  - "documentation"
  - "ux"
  - "naming"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "md"
  - "ts"
problems:
  - "Navigation copy tells readers where to go before naming what they will find."
concepts:
  - "documentation-surface"
  - "reader-locality"
related:
  - "cut-interface-narration"
  - "keep-name-current"
  - "reader-locality"
---

## Core Idea

Reference surfaces should help readers choose by recognition. A label like "start here" only makes
sense if the reader has already accepted the page's order. A label like "Validation commands" or
"Rule domains" tells the reader what they will reach.

This is the documentation version of keeping names current. The label should carry the destination
or decision, not the writer's instruction to move through the page.

## Use When

- A heading or card begins with "start", "open", "use", "explore", or "learn" on an index page.
- The page is a catalog, reference, or landing page rather than an ordered procedure.
- Readers arrive from search, review links, or retrieval and need local context immediately.

## Guidance

- Use nouns for destinations: "Validation commands", "Review evidence", "Rule domains".
- Use decision labels when the reader is choosing: "Change scope", "Public API risk", "Rendered
  surface proof".
- Reserve imperative labels for procedures, checklists, and setup steps.

## Tradeoffs

- Procedures can use directional headings because order is part of the task.
- Marketing pages sometimes use calls to action, but technical reference pages usually need
  recognition more than persuasion.
- A short verb can work when it names the action itself, such as "Deploy" in a command list.

## Agent Instruction

On indexes, catalogs, and reference pages, replace directional navigation copy with labels for the
destination, decision, artifact, or work area.

## Examples

### Reference heading

Problem: "Start with the rules that matter most."

Better: "Rule domains."

```md title="heading.md"
Rule domains
```

### Card title

Problem: "Open the guide for agent workflows."

Better: "Agent workflow."

```md title="card-title.md"
Agent workflow
```

### Link text

Problem: "Go here to check build commands."

Better: "Build and validation commands."

```md title="link-text.md"
[Build and validation commands](./validation.md)
```

## References

- Docs Name Destination Not Direction
- Docs Use Descriptive Headings
