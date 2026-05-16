---
title: >-
  Documentation Surface
summary: >-
  Rendered docs, indexes, headings, examples, and navigation copy are user-facing surfaces, not just
  prose stored in Markdown.
status: seed
tags:
  - "documentation"
  - "ux"
  - "reader-locality"
relatedPatterns:
  - "cut-interface-narration"
  - "match-documentation-shape-to-reader-task"
  - "name-destinations-not-directions"
---

## Why It Matters

Documentation becomes a surface when readers use it to choose a page, follow a command, cite a
pattern, or decide whether a rule applies. At that point the page structure, headings, links, tags,
examples, and empty states all carry part of the contract.

A Markdown file can be correct in source form while the rendered page still asks readers to do too
much work. The page may expose metadata as body copy, make clickable rows look static, bury the
decision behind a long introduction, or describe the site machinery instead of the reader's task.

## How To Apply It

Choose the surface by the reader's job. A catalog helps someone choose an entry. A pattern page
helps someone recognize a situation and apply a move. A reference page helps someone inspect a
source and understand why it matters. A procedure gives ordered steps.

Validate the rendered surface when the structure changes. Markdown lint catches source formatting;
builds catch routing and type errors. Rendered inspection, screenshots, link checks, or focused
browser tests catch whether the page reads as the intended surface.

## Applied Shape

### Catalog surface

The catalog should start with recognizable work areas and entry names. IDs, generation paths, and
frontmatter fields can support filtering without becoming the reader's first task.

### Procedure surface

A setup guide can use imperative headings because the reader is following a sequence. The same
phrasing is weaker on a reference index, where the reader needs destination labels before deciding
where to go.
