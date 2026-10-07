
> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Benny automation intent

This file describes the optional workflow. Reading it or cloning the repository does not authorize activation, external messages, ticket writes, or PR publication. Enter through this file or the discoverable [setup-benny](./skills/setup-benny/SKILL.md) when the user requests setup.

## Triage issue reports

A supported event provider supplies a new top-level report from the configured Slack channel. Read its thread and relevant attachments, classify the report, trace the likely owning layer, and check the configured tracker for duplicates. Create an issue only for a clear new bug. A configured authorized run posts one verdict inside the original thread, ending in one trusted Benny marker. Never post a root message in the source channel.

## Reproduce and fix confirmed bugs

The second workflow keeps the same source coordinates and waits for the configured triage identity's marker. Stop when a person owns the fix. Verify a linked PR or commit instead of writing a competing fix. Reproduce the distinguishing symptom twice through an actual UI adapter, capture before-and-after evidence, and attempt only a bounded authorized fix. New Plan work follows Ignite's native behavioral red and verification rules; cheap-test preferences do not override them. A draft PR requires both checks and publication authorization. Never merge or deploy from this workflow.

## Project integration

- Canonical pack location is `.ai/pstack/automations/benny/`. Use it directly in this project. Do not add a duplicate under `.cursor/automations/` or enable a Cursor plugin.
- In another explicitly chosen project, install the adapted pstack library at the same `.ai/pstack/` layout, preserve destination-only work, review conflicts, and check project-relative dependencies. Carry the adapter and shared canonical skills; copying only this directory breaks its relative links.
- Setup generates configuration under `.ai/benny/` from the fields in [the example](./templates/configuration.example.yaml). It does not copy Markdown introduction text or a relative adapter header into generated user files. Keep an explicit canonical-source path in generated notes instead.
- Routing and control-operation data remain user-owned. Control paths reference the target project's existing Feature REQ/AC and test cases. Expected behavior and completion remain in those native records.
- Decisions and effort limits belong in the matching Plan. Long-lived architecture choices belong in ADR; actual system facts belong in Design. There is no Benny-specific progress ledger.
- Models follow `.ai/pstack/config.json`, defaulting to the current host. Confirm any requested actual model ID with that host; no global or private defaults are carried over.
- Only the coordinator can perform explicitly authorized external writes. Workers, if useful and authorized, receive no Slack credentials and no posting tools.
- Live prompts read canonical operational files rather than plugin-cache paths or copied instruction bodies.

## Activation prerequisites

Confirm the target repository, source channel, triage identity, tracker actions, optional routing, app-control adapter, native behavior references, bounded effort, and permissions from actual configuration. Never infer them from placeholders. Secrets belong in a secret store or environment.

Use the current host's actual automation tools. Codex `automation_update` supports the triggers described by its current schema; it does not by itself register a Slack event trigger. If the required event provider is unavailable, leave Benny disabled and explain the missing capability. Do not invent a service or polling job.

For an authorized external automation checkout, canonical files and secret-free referenced configuration must exist on its actual branch. Preserve existing automations and update the matching one instead of duplicating it. Before normal traffic, verify original-thread replies, trusted marker identity, immutable coordinates, no worker writes, and fail-closed behavior for missing or deleted parents.
