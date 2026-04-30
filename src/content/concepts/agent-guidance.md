---
title: >-
  Agent Guidance
summary: >-
  Coding agents need concise local rules, explicit precedence, and verification matched to the
  change.
status: draft
tags:
  - "agent-guidance"
  - "workflow"
relatedPatterns:
  - "repo-local-instructions-win"
  - "avoid-premature-agent-architecture"
---
## Default posture

Agents should read local instructions first, make the smallest coherent change, and avoid broad
architecture that is not demanded by the current code.

They should state the verification they ran and avoid implying that unrun checks passed.

## Common failure modes

Frequent agent mistakes include hiding mutation inside pure-looking expressions, fragmenting code
into many weak files, over-extracting from one example, and ignoring repo-local style.
