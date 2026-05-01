---
title: >-
  Make Validation Policy Explicit
summary: >-
  Give repeated validation rules one named owner before callers drift apart.
status: seed
tags:
  - "validation"
  - "boundaries"
  - "correctness"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "The same rule is checked in several places with slightly different behavior."
concepts:
  - "boundary-trust"
  - "change-radius"
related:
  - "parse-dont-validate"
  - "make-invalid-states-hard-to-express"
---

## Core Idea

Repeated validation rules drift because each caller owns a slightly different interpretation. A
named policy gives the rule one place to change and one set of errors to review.

Use this when the same field, state, or permission is checked across boundaries and the checks are
not naturally replaced by a precise type yet.

The tradeoff is overlap with parsing. If the rule creates a trusted value, parse it. If the rule
decides a workflow policy, name the policy.

## Use When

- The same validation condition appears in several callers.
- Error messages differ for the same rule.
- A rule is policy, not just input parsing.

## Guidance

- Name the policy in the layer that owns it.
- Return structured validation errors when callers need feedback.
- Prefer parsing when the rule creates a reusable value.

## Tradeoffs

- One local guard may be simpler.
- A shared validator can become a dumping ground.
- Different boundaries may legitimately need different policy.

## Agent Instruction

When validation rules repeat, decide whether the rule belongs in a parser, precise type, or named
policy owner. Do not let callers drift independently.

## Examples

### Name the publish validation policy

The rule is workflow policy, so callers use one named decision.

```ts title="src/example.ts"
export function validatePublishReady(pattern: Pattern): ValidationResult {
  return pattern.examples.length > 0 ? ok() : missing('examples');
}
```

## References

- None yet.
