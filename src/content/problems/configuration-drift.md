---
title: >-
  Configuration drift
status: draft
category: boundaries
topics:
  - configuration
  - policy
  - change-radius
summary: >-
  Defaults, feature flags, environment variables, and magic values are interpreted differently
  across callers.
relatedPatterns:
  - centralize-configuration-policy
  - parse-dont-validate
  - cap-change-radius
relatedConcepts:
  - boundary-trust
  - change-radius
---

## Impact

The running system can behave differently depending on which path read the config. A small policy
change becomes a search-and-edit task with hidden edge cases.

## Signals

- Multiple modules read the same environment variable or feature flag directly.
- Defaults are repeated as literals in business logic.
- A config key is parsed in several places with different error handling.
- Changing a timeout, retry count, or mode requires edits outside the config boundary.

## Diagnostic Questions

- Which boundary owns this config value and its default?
- What named policy should callers receive?
- Are precedence rules documented in code or recreated at call sites?
- Can the raw value be parsed once and passed inward as a precise type?

## Approach

- Parse raw config at one boundary and pass narrow policy values inward.
- Name defaults and magic values by their domain role.
- Keep framework-shaped config at the framework edge.
- Test surprising precedence or default behavior as observable behavior.
