---
name: swarm
description: Fan out N parallel workers, drain them, and return one report. Use for
  /swarm, 'swarm this', or parallel coverage, races, gauntlets, and exploration.
---

# Swarm

Fan out N parallel workers through the current host. They may cover separate slices, race the same brief, or mix both. The parent waits, aggregates, and returns one report.

## Start

For implementation work, map these phases into the owning Ignite Plan tasks before launching. A read-only report can track them in the chat; do not create a second project task ledger.

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A: Frame

1. State the done predicate and the artifact or report the swarm must return.
2. Choose the shape. Partition into slices, race N workers on identical briefs, or mix both. For a race or mixed shape, declare `first pass`, `rank all`, or `best-of` before spawning.
3. Set N from the user or derive it from the shape. N is total workers, not the cloud concurrency limit.
4. Read .ai/pstack/config.json roles["swarm workers"]. Missing, auto or inherit-parent means omit model. Use only explicitly configured IDs available in the current host; unsupported values inherit with a stated limitation. A model race requires an actual requested comparison, not every task.
5. Give each worker its own writable output when it writes. When workers verify or measure commits, each brief names the exact SHAs. A measurement brief also names the method (sample count, what one sample is, order). The worker records both in its result.

## Phase B: Fan out

Spawn useful independent workers through the actual host API with scoped writes and the step 4 selection. Use an available local/cloud environment according to required resources; do not force a Cursor-specific environment.

When a worker must start from a particular branch or commit, select it using the actual host checkout or worktree facility and include the exact revision in the brief. Do not pass unsupported Cursor-specific parameters. If delegation is unavailable, complete the slices directly and report that no parallel workers ran.

Every brief stands alone. Include the goal, scope, exact slice or race arm, how to verify, and what to report. Reports use `PASS`, `ISSUES`, or `BLOCKED` with evidence. A worker that can prove a defect reports `ISSUES` and lists every issue it can prove, not only the first.

If a worker drops out, proceed with N-1 and note it.

## Phase C: Aggregate

Read the terminal results. Drop a result that does not record the SHAs and method its brief names, and respawn that worker once. After a second miss, record a gap. A gap does not count as a pass. For coverage, every required slice needs a result. For a race, apply the selection rule declared up front. Use first pass, rank all, or best-of. Do not paste raw worker dumps.

Keep a compact result table, one-line evidenced issues, and explicit gaps or dropouts.

## Phase D: Report

Return one consolidated in-chat report with the table, issue one-liners, gaps or dropouts, and the race rule when used.
