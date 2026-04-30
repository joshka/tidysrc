---
title: >-
  Raw input leaks inward
status: draft
category: boundaries
topics:
  - validation
  - parsing
  - domain-shape
summary: >-
  Strings, maps, nullable values, or unchecked data move through the system after the boundary
  should have parsed them.
relatedPatterns:
  - parse-dont-validate
  - make-invalid-states-hard-to-express
  - guard-clause
relatedConcepts:
  - observable-behavior
  - reader-locality
---

## Impact

Every caller has to remember the same validation rules. That spreads defensive code, creates
inconsistent edge handling, and makes invalid states look like normal application data.

## Signals

- The same null, empty, format, or enum checks appear in multiple places.
- A type says string or boolean when the domain has a narrower set of valid states.
- Errors are discovered far from the input boundary that introduced them.
- A function accepts raw data even though every successful caller already validated it.

## Diagnostic Questions

- Where is the first point that has enough context to parse this input?
- What type would make the invalid state impossible or at least uncommon?
- Which checks are boundary validation and which are real business rules?
- Can callers receive a parsed value instead of being trusted to repeat the rule?

## Approach

- Parse raw input at the boundary and pass domain values inward.
- Use guard clauses for local preconditions, but avoid repeated guards that signal a missing parsed
  type.
- Prefer constructors, enums, refined types, or result-bearing parsers that encode the successful
  state.
- Keep error messages and failure modes observable while improving the internal shape.
