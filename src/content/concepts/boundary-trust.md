---
title: >-
  Boundary Trust
summary: >-
  A boundary earns trust when it converts uncertain external shape into data the next layer can
  rely on.
status: draft
tags:
  - "boundaries"
  - "api-design"
  - "correctness"
relatedPatterns:
  - "parse-dont-validate"
  - "return-structured-errors"
  - "name-cross-layer-contracts"
  - "centralize-configuration-policy"
---
## Boundary job

A boundary should translate uncertainty into a contract. Raw request data, database rows,
environment variables, and third-party responses should not keep their raw shape after code has
enough context to parse them.

The next layer should receive a value it can trust or a structured error it can handle.

## Failure mode

When boundaries only pass data through, validation, defaults, error handling, and layer vocabulary
spread across callers. That creates drift and makes small rules expensive to change.
