
> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Set up pstack in Ignite

Ignite already carries the methods in `.ai/pstack/` and discovery entries for Codex, Claude Code, Cursor, and OpenCode. Cloning carries these files. Do not install the upstream Cursor plugin or change global settings to use them.

## Find the project skills

Open the repository in your host and check project skill discovery. Codex uses `.agents/skills/`; the other hosts use their project entries. A host without automatic discovery can follow the project rules to the canonical skill. Discovery does not prove every optional helper can run.

Use [poteto-help](../../skills/poteto-help/SKILL.md) to choose a method. Use [poteto-mode](../../skills/poteto-mode/SKILL.md) for a task needing a multi-step workflow. Small, clear changes can proceed directly.

## Choose models only when needed

Agents read the project convention in `.ai/pstack/config.json`. Its default is `inherit-current-host`; an empty `roles` object keeps the current host model. [setup-pstack](../../skills/setup-pstack/SKILL.md) can change project choices when requested.

A role can contain a model ID or a list of IDs for a requested panel. `auto` and `inherit-parent` mean inheritance, not model IDs. Confirm actual model IDs and supported reasoning settings with the current host. A list does not launch agents by itself. This file is an agent reading convention, not a scheduler or model installer.

Do not write a global Cursor model rule or force upstream Grok/Opus defaults. Delegation needs the current host's capabilities and authorization.

## Reuse Ignite verification

Ignite already has Feature AC, contract tests, browser checks, and native Plan/Release verification. Reuse them first. [create-verification-skill](../../skills/create-verification-skill/SKILL.md) can supply missing launch, drive, observation, and cleanup instructions. Reference existing Feature REQ/AC and test cases instead of creating another acceptance map.

Project-specific skill bodies belong in `.ai/skills/<name>/SKILL.md`. Inspect entry changes with `node scripts/pstack-sync.mjs`; apply them with `node scripts/pstack-sync.mjs --write`. Do not write method bodies into a platform bridge folder.

## Run the first task

Describe a small real result and its constraints:

```text
/poteto-mode add JSON output to this command. keep text output unchanged. use the existing Feature and Plan to define and verify both forms.
```

Reuse a matching unfinished Plan. Map workflow steps into its `tasks`; update with `pnpm ignite task set-status` and regenerate progress with `pnpm ignite plan refresh`. Chat todos are temporary navigation, not another project status record.

Persistent modes, keyboard shortcuts, and wake mechanisms depend on the host. Do not assume Cursor Custom Modes or `/loop` exist elsewhere.

Next: [Route work through poteto-mode](./02-poteto-mode.md).
