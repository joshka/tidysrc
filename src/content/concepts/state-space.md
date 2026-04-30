---
title: >-
  State Space
summary: >-
  The set of states a program can represent, including impossible combinations the code
  accidentally permits.
status: draft
tags:
  - "correctness"
  - "api-design"
  - "state"
relatedPatterns:
  - "make-state-transitions-explicit"
  - "replace-boolean-flag-with-choice"
  - "make-invalid-states-hard-to-express"
---
## Review heuristic

Ask which states the code can represent, not only which states the developer intended. Invalid
combinations are bugs waiting for the right call path.

Independent booleans, nullable fields, and loose strings expand the state space. Enums, variants,
constructors, and transition functions can reduce it.

## Language pressure

Rust enums can encode mutually exclusive states directly. TypeScript discriminated unions can do the
same when callers preserve the tag. Java sealed types and enums help when the domain has named
states. Go often uses small typed constants plus constructors.
