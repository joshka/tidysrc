---
title: >-
  Preserve Error Context
summary: >-
  Carry the stable cause and recovery context across boundaries instead of flattening failures into
  generic messages.
status: seed
tags:
  - "errors"
  - "boundaries"
  - "observability"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A failure loses the field, id, upstream status, or cause that callers need to recover."
concepts:
  - "boundary-trust"
  - "observable-behavior"
related:
  - "return-structured-errors"
  - "make-failures-observable"
  - "observable-behavior-tests"
---

## Core Idea

Preserve error context when a failure crosses a layer, process, or user-facing boundary. The caller
needs a stable kind for program behavior and enough context to recover, retry, report, or test the
case.

This is narrower than returning structured errors in general. The emphasis is on not dropping
context that already exists, especially when wrapping low-level failures or converting them to API
responses.

The tradeoff is that some context is internal, sensitive, or too noisy for the caller. Keep the
recoverable facts stable and move internal detail to logs or diagnostics.

## Use When

- A catch block or error mapper replaces a specific failure with a generic message.
- Callers parse text because stable error kind or context was lost.
- The failure crosses a boundary where recovery, retry, or user feedback matters.

## Guidance

- Preserve the stable error kind separately from human-readable text.
- Attach the context the caller can act on, such as field name, resource id, retry hint, or upstream
  status.
- Keep sensitive implementation detail out of public error payloads.

## Tradeoffs

- Do not expose every nested cause as API surface.
- Public error shape is observable behavior and needs compatibility care.
- Logs can hold diagnostic detail that should not become caller contract.

## Agent Instruction

When mapping or wrapping errors, preserve the stable kind and recoverable context. Do not replace a
specific failure with a generic string unless callers truly cannot act on the detail.

## Examples

### TypeScript preserves field context

The API response keeps the stable kind and field name while still giving a human message.

```ts title="src/errors.ts"
return {
  kind: 'missing-field',
  field: error.field,
  message: `Missing required field: ${error.field}`,
};
```

## References

- None yet.
