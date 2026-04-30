---
title: >-
  Temporal Coupling
summary: >-
  Code is temporally coupled when correctness depends on hidden ordering, timing, or lifecycle
  assumptions.
status: draft
tags:
  - "async"
  - "testing"
  - "state"
relatedPatterns:
  - "keep-async-boundaries-explicit"
  - "inject-time-and-randomness"
  - "make-state-transitions-explicit"
---
## What to look for

Hidden ordering appears as unawaited promises, goroutines without cancellation, callbacks that
outlive their owner, sleeps in tests, and state that must be written before another method is
called.

Temporal coupling is hard to review because the relevant facts are often outside the lines being
changed.

## How to reduce it

Name lifecycle transitions, make async boundaries visible, pass clocks explicitly, and return
handles or results when work continues after the current function.
