---
name: show-me-your-work
description: Keep a reviewable decision trail in the existing Ignite Plan, with rationale and evidence; lasting architecture choices belong in ADR. Use for /show-me-your-work or long-running work reviewed after a handoff.
---

# Show me your work

Keep a reviewable account of decisions: what changed, why, the evidence, and the actual result. In Ignite the existing Plan is that account; do not create a parallel decision or progress ledger.

## Where the record belongs

- Ordinary choices, scope changes, reversals and blockers go in the current docs/plans/ Plan's overall judgment and status record, under its existing directory rules.
- Task state belongs only to the Plan's structured tasks. Update it through `pnpm ignite task set-status <ID> <task> <todo|doing|done>`; generated progress is not hand-maintained.
- A lasting architecture tradeoff belongs in docs/others/adr/ when future maintainers need its rationale. Link it from the Plan. Do not require an ADR for routine implementation choices.
- The implemented system's current facts belong in docs/designs/. Do not describe an unimplemented proposal there as current behavior.
- Actual check results belong to existing execution evidence. Cite their run, tested version and REQ/AC from the Plan; do not write a second pass/fail table.

## What to record

At a meaningful decision or checkpoint, write a short entry in plain language:

1. What was chosen, completed, reversed or blocked.
2. Why, including the observation that changed the choice.
3. An evidence pointer: relevant source location, commit, run, screenshot or trace.
4. The actual result and any remaining uncertainty.

For example: “Kept the existing task Hook because both screens share the RPC contract. See the Hook and the AC run recorded by this Plan. The browser path remains unverified.” Do not invent green evidence or treat a worker's summary as proof.

Record pivots and consequential checkpoints, not every file read. Reuse the current Plan across turns and handoffs. A new conversation is not a reason for a new Plan or log. Retain material past decisions and explain corrections rather than rewriting history to look successful.

## Optional raw attachments

The inherited references/decision-log-template.tsv and scripts/log.sh remain source tools for a task that explicitly needs raw experiment data. They are not the Ignite default and must not own task status, decisions or acceptance. An explicitly needed local attachment can be linked from the Plan; do not invoke the helper merely to satisfy this skill.

## Audit and hand back

Compare entries with the artifacts and the current conversation or authorized thread history actually available to this host. Never search unrelated private transcripts or claim a transcript audit without access. Correct weak evidence in the Plan, keeping the earlier material decision and its correction visible.

Independent review is useful when risk or a requested review warrants it and delegation is authorized. It is not a mandatory cross-model ceremony. Use available host tools and models, disclose unverified claims, and do not fabricate a reviewer. Finish with the result, relevant Plan/evidence pointers and any consequential remaining gap. Other skills route their decision trail here by reusing the same Plan.
