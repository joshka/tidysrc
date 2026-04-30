---
title: >-
  Boolean flag maze
status: draft
category: state
topics:
  - api-design
  - readability
  - control-flow
summary: >-
  Booleans carry domain choices across function boundaries until call sites no longer explain
  themselves.
relatedPatterns:
  - replace-boolean-flag-with-choice
  - make-state-transitions-explicit
  - make-invalid-states-hard-to-express
relatedConcepts:
  - state-space
  - reader-locality
---

## Impact

The reader has to remember what true and false mean in each position. As more flags appear,
impossible combinations become representable and behavior changes hide inside argument order.

## Signals

- Call sites pass true, false, false without local names.
- Two or more booleans combine into a lifecycle or mode.
- A third state appears as null, comments, or another flag.
- Tests name the boolean arrangement instead of the behavior selected by that arrangement.

## Diagnostic Questions

- What domain choice does this flag represent?
- Would an enum, union, named options object, or constructor make the call readable?
- Are these states mutually exclusive?
- Can invalid combinations be made harder to express?

## Approach

- Replace boundary booleans with named choices when the flag selects behavior.
- Keep local boolean facts when the name is visible beside the branch.
- Move lifecycle choices into transition functions if the flag represents state movement.
- Update tests to assert the behavior selected by the named choice.
