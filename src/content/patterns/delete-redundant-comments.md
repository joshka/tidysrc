---
title: >-
  Delete Redundant Comments
summary: >-
  Remove comments that repeat code, preserve old code, or contradict the implementation.
status: seed
tags:
  - "comments"
  - "readability"
  - "tidying"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "Comments add noise without explaining a constraint the code cannot show."
concepts:
  - "cognitive-burden"
related:
  - "write-explaining-comments"
  - "delete-dead-code"
---

## Core Idea

A redundant comment makes the reader compare two sources of truth. If the comment only restates the
next line, it adds work without adding knowledge.

Delete comments that repeat code, preserve old code, or describe behavior that is now obvious from a
better name.

The tradeoff is losing history. Keep comments that explain external constraints or surprising
decisions; delete comments that merely narrate syntax.

## Use When

- A comment repeats the code immediately below it.
- A comment describes old behavior after the code changed.
- A comment exists only to preserve deleted code.

## Guidance

- Delete comments that do not add intent or constraints.
- Rename code when the comment is compensating for a poor name.
- Keep comments that explain why a surprising shape remains.

## Tradeoffs

- Some generated docs need descriptive comments.
- Public APIs may require documentation even when implementation is obvious.
- Deleting a constraint comment can make future simplification unsafe.

## Agent Instruction

Remove comments that repeat or contradict the code. Keep comments that explain constraints the code
cannot express.

## Examples

### Remove narration comments

The method name already says what happens; the comment does not add a constraint.

```ts title="src/example.ts"
// Delete this: publishes the pattern.
publishPattern(pattern);
```

## References

- [Tidy First?: Delete Redundant Comments](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch15.html)
