---
title: >-
  Side Effect Visibility
summary: >-
  A reader should be able to see where code mutates state, touches I/O, reads time, or starts
  work.
status: draft
tags:
  - "side-effects"
  - "readability"
  - "testing"
relatedPatterns:
  - "make-side-effects-visible"
  - "inject-time-and-randomness"
  - "keep-async-boundaries-explicit"
---
## Why it matters

Side effects change the review question. Pure calculation can be checked locally, while mutation,
I/O, time, randomness, and background work require ordering and failure reasoning.

A pure-looking helper with hidden effects makes every caller suspicious. The reader has to inspect
implementation before trusting the call.

## Language pressure

Rust signatures expose some effects through ownership and mutability, but I/O, time, and task
spawning still need clear boundaries. Go, Java, TypeScript, and JavaScript rely more on names,
return types, and statement shape.
