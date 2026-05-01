---
title: >-
  Time-Of-Check to Time-Of-Use
summary: >-
  A bug shape where code checks a fact, later uses that fact, and something can change in between.
status: seed
tags:
  - "state"
  - "correctness"
  - "concurrency"
relatedPatterns:
  - "make-state-transitions-explicit"
  - "keep-async-boundaries-explicit"
  - "make-invalid-states-hard-to-express"
---

## Why it matters

Time-of-check to time-of-use bugs happen when code verifies a fact and then relies on that fact
after the world has had a chance to change. The gap may be a thread switch, an `await`, a callback,
an external file update, a database write from another request, or a lifecycle transition hidden in
another method.

The same shape appears outside classic concurrency bugs. A change can update one path that checks a
state but miss another path that later uses the old assumption. The code still has a check, but the
check and the use are no longer one reviewable unit.

## How to apply it

Look for permission checks, existence checks, cache freshness checks, and lifecycle checks that are
separated from the operation they authorize. Keep the check and use in one boundary when possible;
otherwise re-check, lock, version, or encode the state so stale facts are rejected.

## Examples

### Split check and use: permission can change between steps

The code checks permission, then waits before using the checked fact.

```ts title="src/files/delete-file.ts"
export async function deleteFile(user: User, fileId: string) {
  if (!await canDelete(user, fileId)) {
    throw new Error("not allowed");
  }

  await auditDeletionRequest(user, fileId);
  await files.delete(fileId);
}
```

### Better: authorize at the operation boundary

The operation re-checks the fact at the point where it matters.

```ts title="src/files/delete-file.ts"
export async function deleteFile(user: User, fileId: string) {
  await files.deleteIfAllowed(user.id, fileId);
}
```
