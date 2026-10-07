---
name: create-verification-skill
description: Generate a project-local verification skill that drives your app the
  way a user does — any language, framework, or platform. Use for /create-verification-skill,
  "make a control skill for this repo", or when a project has no scripted way to prove
  UI/CLI/service behavior.
---

> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Create a verification skill

Teach the next agent how to launch, inspect, drive and clean up the real Ignite application. A control skill explains execution; it does not create another requirements or acceptance system.

## 1. Interview the repo

Read the applicable runtime/adoption/testing rules, package scripts, Feature REQ/AC, docs/others/test-cases/ and existing Playwright tests. Observe the actual surface, startup command, required configuration, authentication, stable selectors, isolation and possible evidence. Ask only about necessary information that cannot be observed.

Prefer the existing test harness and `pnpm ignite check --plan <IGT-ID> --level auto`. Do not install tools or change environments merely to generate a skill. If startup is unavailable, describe the concrete limitation and leave affected execution unverified; an environmental failure is not a behavior assertion.

## 2. Generate one canonical skill

Create `.ai/skills/verify-<app>/SKILL.md`, with portable name and description frontmatter and actual commands grounded in this checkout. Use the host's skill-creator. Existing discovery directories contain only metadata and links, never the method body. After adding or changing a canonical skill, run `node scripts/pstack-sync.mjs --write` to synchronize discovery entries, catalog and local source hashes; without --write that command is read-only.

Write these sections:

- **Launch:** documented runtime and command, required local test state, readiness predicate, ownership of the process and teardown. Respect the project's environment checks and keep Windows/WSL dependency trees separate.
- **Doctor:** read-only instance checks for expected revision, origin, process ownership, configuration and authentication. Run before driving and after unexpected failures.
- **Drive:** existing Playwright tests or a supported host control recipe, with actual stable roles, accessible names or source selectors. Use real user paths, not internal setters or test-only endpoints to manufacture success.
- **Evidence:** link applicable Feature REQ/AC, existing test cases, required layers and native runs. Capture action and result, including persistence or other relevant side effects. Temporary exploratory clicks/screenshots are supplementary observations, not formal AC, Plan or Release evidence. Follow docs/others/evidence/README.md for retained run artifacts.
- **Cleanup:** stop only instances started by this work and remove owned temporary data. Do not kill by process name, disturb a shared user session or delete proof artifacts.
- **Helpers:** only when an actual execution gap requires one; state supported runtime, side effects and invocation. A shipped helper must be executable where that runtime requires it.

## 3. Reference existing coverage

Do not create another maintained feature map. If navigation assistance is useful, keep a small link index in the control skill pointing to existing docs/features/ REQ/AC, docs/others/test-cases/ recipes, executable tests and relevant stable selectors. Do not copy acceptance wording, coverage lists or passed status into that index.

The inherited [example index](references/feature-map-example/README.md), [create-note recipe](references/feature-map-example/create-note.md) and [search recipe](references/feature-map-example/search.md) illustrate driving technique only. Their imaginary app, commands and sub-feature IDs are not Ignite specifications or commands to execute.

## 4. Check the execution recipe

Within the current authorization and applicable Plan, exercise a relevant existing path through launch, doctor, drive, evidence and cleanup. Reuse current evidence for unchanged inputs; do not run the entire application merely to author method text. If no execution is possible or the user deferred testing, mark the recipe unverified and retain the verification task. A temporary manual path cannot replace the formal runner.

## 5. Maintain on relevant changes

Use maintain-verification-skill when an affected command, selector or user path changes. Do not activate a scheduled maintenance loop unless requested.
