---
title: >-
  Layer language leaks
status: draft
category: boundaries
topics:
  - contracts
  - translation
  - change-radius
summary: >-
  Database rows, API payloads, UI props, or framework objects become the shared language of
  unrelated layers.
relatedPatterns:
  - name-cross-layer-contracts
  - parse-dont-validate
  - cap-change-radius
relatedConcepts:
  - boundary-trust
  - change-radius
  - reader-locality
---

## Impact

A change in one layer forces distant code to change because the boundary never translated the shape.
Readers must understand storage, transport, and UI details to review domain behavior.

## Signals

- Domain logic depends on database column names or HTTP payload fields.
- UI components receive persistence flags that should have been converted into view state.
- A storage migration changes application logic that does not own persistence.
- Mapping code exists, but it only copies fields without naming the contract change.

## Diagnostic Questions

- Which layer owns this field name and shape?
- What contract does the next layer need?
- Does mapping change meaning or only mirror fields?
- Would a named boundary type reduce future change radius?

## Approach

- Name the contract where data crosses layer language.
- Map persistence, transport, domain, and UI shapes only when the next layer needs a different
  contract.
- Keep raw external shape from leaking inward after the boundary has enough context to parse it.
- Avoid empty DTO churn that mirrors fields without changing meaning.
