---
title: >-
  Repeated validation rules
status: seed
category: boundaries
topics:
  - validation
  - duplication
  - domain-shape
summary: >-
  Multiple callers repeat the same rules because the valid domain shape is not represented once.
relatedPatterns:
  - make-invalid-states-hard-to-express
  - parse-dont-validate
relatedConcepts:
  - observable-behavior
  - reader-locality
---

## Impact

Repeated validation looks defensive but often marks a weak domain boundary. Over time the rules
drift, edge cases differ, and callers can pass values that should never exist inside the system.

## Signals

- Several functions check the same string format, range, enum value, or nullability.
- Validation happens after data has already crossed multiple module boundaries.
- Callers disagree about what error to return for the same invalid input.
- The type system allows impossible combinations that every consumer has to reject.

## Diagnostic Questions

- What is the canonical place where this value becomes trusted?
- Can the validated value be named as its own type?
- Which callers should receive an error and which should never see raw input?
- Will this representation make common valid states easier to construct?

## Approach

- Create a parsed or refined value at the boundary and pass that value inward.
- Move repeated validation rules into a constructor or parser with explicit failure behavior.
- Use invalid-state-resistant types where they reduce caller burden without over-modeling the
  domain.
- Keep behavior-visible error messages covered while consolidating the rule.
