---
title: >-
  Data migration risk
status: draft
category: change-risk
topics:
  - data
  - compatibility
  - verification
summary: >-
  A schema or data-shape change alters stored meaning without clear compatibility, fallback, or
  verification.
relatedPatterns:
  - parse-dont-validate
  - characterize-before-changing
  - separate-structure-from-behavior
relatedConcepts:
  - boundary-trust
  - observable-behavior
  - change-radius
---

## Impact

Data changes are hard to roll back and easy to under-test. The code may work for new records while
old records, partial migrations, or mixed-version deployments fail.

## Signals

- New code assumes every stored record already has the new shape.
- Migration, parser, and behavior changes land in one patch.
- Fallback behavior is implicit or differs by caller.
- Tests only use newly constructed records.

## Diagnostic Questions

- What old shapes can still exist when this code runs?
- Is the migration compatible with mixed versions or rollback?
- Which parser or boundary should normalize old and new data?
- What behavior proves old records still work?

## Approach

- Parse stored data at a boundary that can normalize old and new shapes.
- Separate migration mechanics from behavior changes when review would otherwise mix risks.
- Characterize behavior with representative old records before changing the shape.
- Return structured errors when incompatible data must be rejected.
