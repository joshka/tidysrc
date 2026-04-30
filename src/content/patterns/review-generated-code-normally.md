---
title: >-
  Review Generated Code Normally
summary: >-
  Treat agent-written code as source code with behavior, contracts, and maintenance cost.
status: seed
tags:
  - "agent-guidance"
  - "review"
  - "testing"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "md"
  - "ts"
problems:
  - "A generated patch is accepted because it works once, even though it leaves weak structure."
concepts:
  - "observable-behavior"
  - "cognitive-burden"
  - "agent-guidance"
related:
  - "observable-behavior-tests"
  - "avoid-premature-agent-architecture"
  - "repo-local-instructions-win"
---

## Core Idea

Agent-written code is still code. It can hide side effects, overfit tests, invent abstractions,
ignore local style, or make future changes harder. The review standard should not drop because the
author is a tool.

The useful distinction is provenance, not quality. A generated diff may need extra scrutiny around
contracts, examples, and verification because the author can produce plausible code without a
stable model of the system.

This pattern does not reject generated code. It rejects treating a green check as a substitute for
reviewing behavior, names, ownership, and future maintenance.

## Use When

- A patch was written or heavily shaped by an agent.
- The code passes checks but feels generic, wide, or misaligned with local patterns.
- The reviewer needs language for rejecting a plausible but costly implementation.

## Guidance

- Review behavior, contracts, and local fit before style polish.
- Check whether the patch weakened tests or changed public shape to make itself pass.
- Ask for the same examples and verification you would require from a human contributor.

## Tradeoffs

- Generated code can be correct and useful; do not reject it by origin alone.
- Extra review should focus on risk, not on proving the agent wrong.
- Some generated code needs a smaller follow-up refactor rather than a full rewrite.

## Agent Instruction

Assume generated code will be reviewed like any other source. Preserve contracts, follow local
patterns, and report verification honestly.

## Examples

### Review note names the same standards

The comment rejects the generated shape because of review cost, not because it was generated.

```md title="review.md"
This passes the current test, but it adds a provider layer with one caller and changes the public
route helper. Please keep the route shape and solve this with the existing catalog helpers.
```

### Generated output still needs behavior checks

The check describes the observable behavior instead of only asserting that code was produced.

```ts title="catalog.test.ts"
it('keeps reviewed patterns visible before seed entries', () => {
  const html = renderCatalog([seedPattern, reviewedPattern]);

  expect(html.indexOf('Reviewed Pattern')).toBeLessThan(html.indexOf('Seed Pattern'));
});
```

## References

- AI Blindspots: Respect the Spec
- AI Blindspots: Black Box Testing
