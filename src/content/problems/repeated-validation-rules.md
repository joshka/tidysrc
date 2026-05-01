---
title: >-
  Repeated Validation Rules
status: seed
category: boundaries
topics:
  - validation
  - duplication
  - domain-shape
summary: >-
  Multiple callers repeat the same rules because the valid domain shape is not represented once.
relatedPatterns:
  - make-validation-policy-explicit
  - make-invalid-states-hard-to-express
  - parse-dont-validate
relatedConcepts:
  - observable-behavior
  - reader-locality
---

## Description

Repeated validation looks defensive but often marks a weak domain boundary. Over time the rules
drift, edge cases differ, and callers can pass values that should never exist inside the system.

The same validity rule appears in controllers, services, jobs, and helpers because the code does
not have one trusted representation for the value after it has been checked.

## Why It Matters

Repeated validation creates false confidence. Each check appears cautious, but the system still
allows disagreement about what valid means and when data becomes safe to use.

## Code Impact

The code accumulates duplicated conditionals, mismatched error messages, and raw strings or numbers
flowing through internal APIs. Every new caller has to remember the validation rule instead of
receiving a value that already satisfies it.

## Signals

- Several functions check the same string format, range, enum value, or nullability.
- Validation happens after data has already crossed multiple module boundaries.
- Callers disagree about what error to return for the same invalid input.
- The type system allows impossible combinations that every consumer has to reject.

## Diagnostic Questions

- What is the canonical place where this value becomes trusted?
- Can the validated value be named as its own type?
- Which callers should receive an error and which should never see raw input?
- Will this representation make common valid states easier to construct?

## Approach

- Create a parsed or refined value at the boundary and pass that value inward.
- Move repeated validation rules into a constructor or parser with explicit failure behavior.
- Use invalid-state-resistant types where they reduce caller burden without over-modeling the
  domain.
- Keep behavior-visible error messages covered while consolidating the rule.

## Examples

### Problem: each caller repeats the same format rule

The validated value remains a raw string, so every caller has to remember the same check.

```typescript title="src/users/invite.ts"
export function inviteUser(email: string) {
  if (!email.includes("@")) {
    throw new Error("invalid email");
  }

  return sendInvite(email);
}
```

### Better: the boundary creates a trusted value

The parser owns the validation rule, and internal code receives the parsed value.

```typescript title="src/users/email-address.ts"
export class EmailAddress {
  private constructor(readonly value: string) {}

  static parse(value: string): EmailAddress {
    if (!value.includes("@")) {
      throw new Error("invalid email");
    }

    return new EmailAddress(value);
  }
}
```
