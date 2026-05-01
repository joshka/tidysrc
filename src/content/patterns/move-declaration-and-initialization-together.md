---
title: >-
  Move Declaration and Initialization Together
summary: >-
  Declare a value where it becomes known instead of making readers track an empty slot.
status: seed
tags:
  - "readability"
  - "state"
  - "tidying"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A variable exists before it has a meaningful value."
concepts:
  - "cognitive-burden"
  - "reader-locality"
related:
  - "explaining-variable"
  - "chunk-statements"
---

## Core Idea

A declaration without its value creates a temporary mystery. The reader must remember the name,
wonder when it becomes valid, and check whether it can be observed early.

Move declaration to the point where the value is known. This often removes nullable state, mutation,
and defensive checks.

The tradeoff is scope. Sometimes a value must be declared before a try/finally or language
construct, but most local variables can start life with meaning.

## Use When

- A variable is declared empty and assigned later.
- A nullable local only exists because initialization is separated.
- A reader must scan forward to know whether the value is valid.

## Guidance

- Declare values at first meaningful assignment.
- Prefer immutable locals when the language supports them.
- Keep setup paragraphs close to the work that uses them.

## Tradeoffs

- Resource cleanup constructs can force broader scope.
- Avoid duplicating expensive initialization just to narrow a variable.
- Some languages have idioms that differ around declaration scope.

## Agent Instruction

Move local declarations to the point where their value becomes meaningful. Avoid empty slots that
readers must track.

## Examples

### Declare the value when it is known

The slug is created at the parse boundary instead of existing as an undefined local.

```ts title="src/example.ts"
const slug = parseSlug(input.slug);
return loadPattern(slug);
```

## References

- [Tidy First?: Move Declaration and Initialization Together](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch07.html)
