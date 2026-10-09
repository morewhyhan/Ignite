---
name: figure-it-out
description: 'Design an auditable playbook when no narrower one fits: a large migration,
  an ambitious multi-part change, or work a human reviews after stepping away. Scales
  rigor to the task, runs a hypothesis loop, and logs decisions via show-me-your-work.
  Use for /figure-it-out, ''figure it out'', a large migration, or when no narrower
  playbook applies.'
---

# Figure it out

When no narrower playbook fits, design a workflow that matches the actual result and risk. Keep its phases and decisions in the existing Ignite Plan, not a second playbook document or task list.

For default [Plan maintenance](../../../../docs/plans/README.md), use the native framing, sequence and decision duties below within the existing fixed workflow. Do not design another workflow or require an otherwise missing playbook. The broader custom workflow branch applies only when no narrower existing path fits the actual outcome.

## Start

Read the relevant principles in poteto-mode and the project rules. Reuse the unfinished Plan covering the result. Only a genuinely independent delivery needs another Plan; one API/page/test/fix/verification result stays together. Use the Plan's structured tasks for the phases below and native task commands for status.

## Phase A: Frame

Before changing anything, state the observable definition of done, affected scope, constraints and known blockers. Map the original user goals to Feature REQ/AC and Plan acceptance. Choose rigor by consequence: irreversible or broad changes need stronger evidence; a reversible document correction needs proportionate checks. Do not bias every task toward a long experiment.

Describe major tradeoffs in a concise update. Continue already authorized reversible work. A genuinely missing product or destructive-data decision needs user input; ordinary implementation choices do not.

## Phase B: Design the workflow

Break the result into small verifiable units and address the riskiest unknown first. Write the sequence, dependencies and handoff boundaries into the original Plan. Use existing contracts, Playwright paths and check commands before inventing a harness. Capture a relevant pre-change observation when comparison is needed.

Use architect for a consequential unresolved shape, not mechanical work. Compare distinct designs locally where useful; delegate only when authorized and isolation or explicit file ownership makes concurrent writes safe. A request to use this method alone does not require multiple agents or models.

## Phase C: Execute and observe

For each unit, state what observable result the change should produce, make the smallest useful change, and inspect the real artifact. Keep a successful change; correct or reverse one that does not advance the goal. Follow the project's TDD and verification rules where applicable, without turning subjective method writing into a benchmark.

Verify important units before building on them. Reuse an active or passed native check for unchanged inputs instead of repeatedly running it. Judge delegated work from source and evidence, not self-report. A false gate must be corrected under the same delivery's Plan; do not create an extra closure Plan. An inconclusive or skipped result is not a pass.

## Phase D: Keep the decision trail

Use show-me-your-work to record consequential choices in the same Plan's judgment/status record. Link native evidence. Long-lived architecture rationale goes to ADR; actual implementation facts go to Design. No default TSV or separate workflow ledger.

## Phase E: Verify and hand back

Assess the whole against the original user outcome, the applicable REQ/AC and actual run evidence. A useful structural guard for a repeated error belongs in the owning code or professional rule, not a duplicate checklist. Keep tasks and Plan/Release state consistent with what was really verified.

Reply with the concrete result, why the chosen scope was sufficient, the existing Plan/evidence pointers and what remains. Do not call an unrun check or unresolved dependency complete.
