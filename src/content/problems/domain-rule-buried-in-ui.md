---
title: >-
  Domain rule buried in UI
status: draft
category: boundaries
topics:
  - ui
  - domain-rules
  - testing
summary: >-
  A business rule lives inside component rendering or presentation code where other callers cannot
  reuse or verify it.
relatedPatterns:
  - name-cross-layer-contracts
  - cap-change-radius
  - observable-behavior-tests
relatedConcepts:
  - boundary-trust
  - change-radius
  - observable-behavior
---

## Impact

The rule becomes easy to miss and hard to test without rendering the UI. Other surfaces may
implement a different version because the actual policy has no named boundary.

## Signals

- A component filters, authorizes, validates, or prices data inline.
- The same rule appears in an API handler and a UI component.
- Tests need a browser or component harness to check a domain decision.
- Changing UI layout risks changing business behavior.

## Diagnostic Questions

- Is this branch a presentation choice or a domain decision?
- Which non-UI caller also needs the rule?
- Can the component receive a view model or policy result instead?
- What observable behavior should protect the rule?

## Approach

- Move domain decisions to a policy, parser, or view-model boundary before rendering.
- Keep presentation-specific formatting in the UI.
- Test the rule at the boundary that owns it, then smoke test the rendered path if needed.
- Name cross-layer contracts so the UI receives the shape it needs.
