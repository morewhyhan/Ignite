---
name: correct
description: Find the mistakes agents keep repeating in this repo and make each one
  impossible. Try architecture first, then types, then a lint whose error names the
  fix, then a test, and write docs last. Prove each check fails on a real past mistake.
  Repeat this each time the operator corrects you. Use for /correct.
---

# Correct

The operator keeps correcting agents in this repo for the same mistakes. Change the repo so the next agent can't make them.

Assume every contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Design the repo so a change that looks right from one file is right for the whole repo.

## Default rule maintenance

When invoked by [rule-maintenance duties](../../../../docs/standards/ai-agents.md), classify the supplied defect or rule gap using the matching Plan and affected source. A single ambiguity, entry-point defect, or new rule does not require a history census or two past failures. Follow the owning fixed steps: fix the actual source, prefer a reliable structural guard where possible, and verify affected entries and behavior. Do not alter application architecture solely to edit guidance. The repeated-mistake investigation below applies only when repeated failures are the authorized problem; its class report is unnecessary for a scoped rule edit.

## Find the mistake classes

First, read recent commits, reverts, review comments, agent instruction files, and comments that explain workarounds. Group the mistakes into classes. A class counts once it has happened twice.

## Fix each class at the highest level that works

1. **Eliminate it with architecture.** Give each piece of state one owner and each task one supported way. Hide internals so the wrong import fails. Replace hand-synced lists with one source of truth. Delete old ways and dead code an agent would copy.
2. **Enforce it with types so the bad state can't be written.** If bad code still compiles, add a lint or CI check whose error names the file, type, or function to use instead. If the pattern is already common, fail only when a change adds more.
3. **Test the behavior.** Fix or delete any test that would still pass if every function it calls returned nothing.
4. **Write docs or agent rules last, only for judgment calls.** Nothing fails when an agent skips them.

## Fix and prove

Then fix the most frequent classes within the existing Plan covering the authorized outcome. Do not create a Plan for each repair or closure step. Commit grouping follows the project's delivery boundaries. Prove each new check fails on a real past mistake. Use the applicable native behavior checks and existing CI entry points; do not claim a CI run that did not occur. Exceptions follow the owning standard and existing authorization rather than inventing a second approval policy.

## Update the owning truth

Route the durable rule to its existing professional source: docs/standards/ for engineering standards, the relevant directory README for document contracts, Feature for requirements, and Design for actual architecture. Preserve AGENTS.md as the shared execution entry point; do not mechanically append a rule/enforcement table there on every correction. Prefer the highest reliable structural guard. Explain the correction, evidence and any deferred guard in the current Plan's judgment/status record. Future skill guidance links the rule instead of duplicating it.

**Reply:** each class with its evidence, the level you picked, and why a higher level didn't work.
