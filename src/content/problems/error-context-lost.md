---
title: >-
  Error context lost
status: draft
category: boundaries
topics:
  - errors
  - observability
  - recovery
summary: >-
  Failures cross a boundary as strings, generic exceptions, or dropped causes that callers cannot
  inspect.
relatedPatterns:
  - return-structured-errors
  - observable-behavior-tests
  - characterize-before-changing
relatedConcepts:
  - observable-behavior
  - boundary-trust
---

## Impact

Callers cannot recover, retry, report, or test failure behavior without parsing text or relying on
logs. Error messages become accidental APIs while useful context disappears.

## Signals

- Code checks error.message or string contents to choose behavior.
- A low-level error is wrapped without the field, id, status, or retry hint that explains recovery.
- Tests assert vague failure text instead of a stable error kind.
- The UI cannot show useful feedback without duplicating parser logic.

## Diagnostic Questions

- Which part of this error is stable program behavior?
- Which context would help the caller recover or report the failure?
- Does changing this error shape affect public behavior?
- Can the human message remain separate from the machine-readable kind?

## Approach

- Return structured errors with stable kinds and recovery context.
- Preserve causes when they matter for debugging, but do not force callers to parse cause text.
- Test public error shape when callers depend on it.
- Characterize legacy string errors before replacing them if callers may already parse them.
