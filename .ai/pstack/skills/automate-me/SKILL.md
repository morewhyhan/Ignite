---
name: automate-me
description: Use for "automate me", "create/update/refresh my -mode skill", "turn/capture
  my preferences or working style into a skill", or wanting agents to follow how the
  user works. Drafts or revises a personal -mode skill via skill-creator + unslop,
  optionally pulling fresh evidence from recent transcripts.
---

# Automate me

Turn the user's established working preferences into one concise mode skill. Use the host's skill-creator for authoring and unslop for prose. A preference skill does not replace Ignite's requirements, standards or execution rules.

## 0. Find the actual existing skill

Look first in .ai/skills/ and .ai/pstack/skills/, or resolve a discovered platform entry to its canonical target. Do not edit the bridge as though it owns the method. Reuse the matching skill when the user requested an update; do not ask again. New project skills belong at `.ai/skills/<handle>-mode/SKILL.md`. A user-level installation is a separate explicit choice, not a default project mutation.

## 1. Gather evidence within authorized history

Use the current conversation and authorized host thread history. If an actual workspace-scoped transcript is provided, read only the relevant conversations; do not glob user-global Cursor directories or unrelated private chats. When history is unavailable, work from the available conversation and say so. Multiple readers are optional for substantial authorized scope, not a required mining ceremony.

Look for recurring response style, autonomy, verification, process and tool preferences. Distinguish explicit user instructions from inference. An explicit current preference can be recorded; an inferred pattern needs repeated evidence and must not override contrary statements. On update, focus on changes since the existing skill's revision.

## 2. Resolve only necessary preferences

Use facts already given. Ask a concise optional question only if a consequential preference is genuinely missing, using the current host's supported question interface. Do not require a broad questionnaire, a freeform round or a Cursor-only AskQuestion tool.

## 3. Route findings before writing

Keep personal working conventions in the mode skill. Requirements belong in Feature, current implementation facts in Design, project engineering rules in docs/standards/ or the owning directory README, and work decisions/tasks in the existing Plan. Link those truths from the mode instead of duplicating their bodies. Do not capture private examples, credentials or unrelated personal facts as default template content.

## 4. Author the canonical skill

Use skill-creator with portable lowercase name and a description scoped to the chosen handle, mode command and intent to work in that style. Avoid generic triggers such as every request to write code. Preserve existing sections the user has not contradicted. Keep only specific, useful conventions; the user does not need to repeat standard defaults.

Do not use platform-specific frontmatter such as disable-model-invocation as a portable activation guarantee. Explicit universal activation is a separate project-rule decision. After canonical content or description changes, run `node scripts/pstack-sync.mjs --write` to regenerate the two necessary discovery directories, catalog and local hashes. The command without --write only checks; it does not install, enable services or activate a mode on every turn.

## 5. Review and finish

Use unslop and show the concrete draft if user feedback is needed. Already-authorized reversible edits proceed without another approval loop. Commit, push and PR actions follow actual task authorization; authoring a skill alone is not permission to publish it.

A mode skill is subjective guidance. Do not run model benchmarks or description-optimization loops as a delivery prerequisite. Check the concrete packaging, paths and trigger wording proportionately; investigate trigger accuracy only if a real missed invocation occurs. State actual edits and any unverified host behavior plainly.

## When not to use

For a task-specific skill, use skill-creator directly. One narrow workflow does not require history mining or a broad mode. Project rules belong in their professional truth, not in a personal preference layer.
