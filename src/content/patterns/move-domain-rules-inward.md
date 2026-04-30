---
title: >-
  Move Domain Rules Inward
summary: >-
  Put business decisions behind a domain boundary instead of hiding them in rendering, transport, or
  persistence code.
status: seed
tags:
  - "boundaries"
  - "domain-rules"
  - "testing"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A component, serializer, controller, or presenter owns a rule that other callers need."
concepts:
  - "boundary-trust"
  - "reader-locality"
related:
  - "name-cross-layer-contracts"
  - "cap-change-radius"
  - "observable-behavior-tests"
---

## Core Idea

Domain rules should live where they can be reused and tested without rendering the presentation
surface. A component may display a decision, but it should not be the only place that knows the
decision exists.

Use this pattern when pricing, authorization, validation, eligibility, or state transitions appear
inside UI, serializers, presenters, or controllers. Move the decision inward and pass the result
outward.

The tradeoff is that tiny display-only choices can stay in presentation code. Move rules inward when
other callers need the decision or when tests have to mount presentation just to check policy.

## Use When

- A UI component or controller filters, authorizes, validates, prices, or transitions state inline.
- Multiple presentation surfaces repeat the same rule.
- The rule is hard to test without rendering or transport setup.

## Guidance

- Name the rule in the domain or application layer.
- Let presentation code display the result of the decision.
- Keep display-only formatting in presentation code.

## Tradeoffs

- Not every conditional in a component is a domain rule.
- Moving a rule inward may require a new boundary contract.
- Public behavior may change if duplicate rules had drifted.

## Agent Instruction

When presentation code owns a business decision, move the decision to a named domain or application
boundary and let presentation render the result.

## Examples

### TypeScript moves publishability out of the component

The component displays the decision instead of owning the rule.

```ts title="src/publishPolicy.ts"
export function canPublish(pattern: Pattern): boolean {
  return pattern.status === 'reviewed' && pattern.examples.length > 0;
}
```

## References

- None yet.
