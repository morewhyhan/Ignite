---
name: maintain-verification-skill
description: Keep an Ignite verification skill aligned with affected source and existing Feature AC/test cases. Use for /maintain-verification-skill or audit the verify skill; scale live checks to the requested scope.
---

> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Maintain a verification skill

Keep execution instructions aligned with affected application behavior. Requirements and acceptance remain in Feature and test-case documents; the control skill owns only Launch/Doctor/Drive/Evidence/Cleanup instructions and any justified helper.

## Locate and scope

Find the canonical verification skill under .ai/skills/ (or resolve an existing discovery bridge to its canonical file). Reuse the Plan covering the change. Define affected user paths from the original goal, changed source and Feature REQ/AC. A request for a complete audit covers all its stated paths; a small change does not silently become a full live sweep or a recurring daily job.

## Read and reconcile

Trace relevant source and existing test cases. Check commands, prerequisites, runtime, stable selectors, evidence locations and cleanup. A convenience index contains links only; fix broken links rather than generating another feature inventory. Read directly for ordinary scope. Authorized independent readers can divide larger reviews by explicit ownership; no mandatory one-agent-per-feature fan-out.

Classify each discrepancy:

- Execution recipe drift: update the canonical skill/helper.
- Requirement or acceptance change: update the owning Feature, Plan and existing test-case path through the normal project workflow.
- Implemented fact changed: update Design with actual behavior.
- Product regression: record and fix under the owning Plan where authorized; never weaken the stated requirement to make the control recipe look correct.

## Verify proportionately

Use relevant existing Playwright/native checks and `pnpm ignite check --plan <IGT-ID> --level auto`, reusing current runs for unchanged inputs. If exploring manually, drive only an instance this run owns or has explicit permission to use. Doctor before use and after surprises; restore known state rather than proceeding through a wedged UI. Preserve evidence and clean owned processes/data even on failure.

A missing account, external prerequisite or unavailable runtime means the path is unverified, with the attempted route and missing condition recorded. Do not label an unreachable path passed. Re-drive a changed execution recipe when possible; deferred execution remains a task and is not a completed validation.

## Record and hand back

Record decisions, scope and limitations in the existing Plan; formal results come from native evidence and its tested version. Keep exploratory artifacts supplementary. After canonical/frontmatter changes, synchronize discovery with `node scripts/pstack-sync.mjs --write` (the no-flag mode only checks). Do not edit platform bridge bodies as method sources.

Report whether scoped instructions were unchanged, corrected or remain blocked/unverified, with actual coverage and evidence. A local maintenance task does not automatically create or push a PR or enable automation.
