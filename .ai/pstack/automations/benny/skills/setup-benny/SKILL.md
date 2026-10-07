---
name: setup-benny
description: Optional Benny automation setup/operations when requested. Configure
  Benny and prepare its triage and repro automations. Use when installing Benny or
  changing its Slack, tracker, repository, routing, control, model, or budget settings.
---

> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Set up Benny

Benny is dormant. Three optional entry skills are discoverable in Ignite, while an authorized live automation reads the two canonical operational files directly. Setup does not activate bots, install plugins, connect services, or write external messages by itself.

## 1. Confirm target and canonical files

Use the already selected target repository. Ask only when it is genuinely unknown. In Ignite, the pack is already at `.ai/pstack/automations/benny/`; use it in place. Do not copy it to `.cursor/automations/benny/` or modify platform plugin settings.

For a requested installation into another project, carry the adapted library at `.ai/pstack/` with its adapter and shared methods. Preserve destination-only files and inspect conflicting local edits. Check canonical files and project-relative links in the target; do not assume the source checkout or current session is available to a fresh run.

Confirm that the target can read the shared methods `how`, `why`, `tdd`, `unslop`, and the referenced principles through canonical files or project discovery. Project discovery is convenient, but does not register an event provider or a native agent type.

## 2. Generate user configuration

Read these examples:

- [configuration fields](../../templates/configuration.example.yaml)
- [control paths](../reproduce-and-fix-issues/references/feature-map.example.md)
- [routing fields](../triage-issue-reports/references/routing.example.md)

Generate secret-free files under `.ai/benny/`, normally `configuration.yaml`, optional `routing.md`, and `control-paths.md`. Generate the required fields and instructions, not a verbatim copy of an example's introduction or relative adapter header. A source note may name `.ai/pstack/automations/benny/` from repository root. Do not edit source-managed examples to store local user values. Keep secret values in the configured host secret store or environment.

When creating that user-owned directory, include `.ai/benny/README.md` using the existing `.ai/` registration rules. State each file's purpose, canonical source, disabled or configured state, authorized read/write actions, event provider, secret handling, and verification method. Point to the matching Plan, native Feature REQ/AC, test cases, and evidence locations. The README is an asset-use declaration, not another task or acceptance ledger. Register the directory through the existing AI workbench index rather than adding a parallel registry.

Control paths link to existing Feature REQ/AC and actual test cases, plus launch, operation, reset, selectors, and observation instructions that are not already documented. They do not duplicate acceptance wording, task state, or pass status. Changed behavior updates the native Feature/Plan/tests/Design first.

Prefer secret-free committed project references when an external checkout must read them. Verify those exact files exist on its configured branch. Do not reference a plugin cache or a different local repository in a live prompt.

## 3. Resolve choices and authorization

Read existing configuration and obtain only missing decisions:

- Source channel and triage identity
- Optional operations channel and allowed writes
- Repository URL and actual default branch
- Tracker adapter, team/project/status/labels and compensation capability
- Optional routing, with owner pings off by default
- App-control skill and native behavior references
- Draft PR capability and publication authorization
- Artifact location and retention, and bounded effort
- Actual event provider and event-to-run binding

Models read `.ai/pstack/config.json`, defaulting to `inherit-current-host`. Role values can be strings or requested panel lists; `auto` and `inherit-parent` are inheritance aliases. Confirm actual IDs and reasoning support with the current host. Configuration alone does not launch or switch agents.

Do not treat intent examples as permission for Slack writes, tracker writes, or opening a PR. Reuse direct user authorization already given; do not repeatedly request permission for ordinary reversible configuration within the requested scope.

## 4. Check real integration capabilities

Triage needs channel/thread reads, relevant attachment access, authorized thread replies, and the tracker search/read/create/update/compensation operations. Reproduction needs repository history, the configured app-control adapter, source-thread reads, authorized replies, optional operations updates, and draft PR capability if publication is authorized.

Use only tools actually exposed by the current host or configured provider. Do not prefer Cursor actions on another host, invent APIs, install integrations, or expose tokens to workers. Missing write actions disable the affected write; missing required reproduction capabilities disable repro.

## 5. Verify control instructions

Read [the control contract](../reproduce-and-fix-issues/references/control-adapter.md) and the configured native behavior references. Confirm app launch, actual UI navigation, appropriate states and safe fixture setup, read-only state inspection, screenshots, recording when required, reset for independent attempts, and cleanup.

Keep expected results in Feature AC and test cases. A control-path guide cannot redefine them. A missing route or capability is a block, not evidence that the product passed.

## 6. Prepare supported automation only when requested

Read [FOR_AGENTS.md](../../FOR_AGENTS.md) and the matching [triage](../../templates/triage-automation-prompt.md) or [repro](../../templates/reproduce-automation-prompt.md) source template. Generate a clear prompt referencing the corresponding canonical file under `.ai/pstack/automations/benny/skills/` and the actual configured user files.

Use the current host's real creation/update capability. In Codex, inspect the available `automation_update` schema. Its heartbeat or schedule support is not Slack event support. A separate supported event provider must deliver the configured report with `source_channel_id`, `ts`, and optional `thread_ts`. Without it, leave both workflows disabled. Do not create a polling workaround or pretend a scheduler receives Slack events.

For an existing automation, inspect and update the matching one through the host's actual tools or editor. Preserve unrelated settings; do not create duplicates. No universal Cursor editor handoff, hidden backend call, or fabricated deep link is required.

## 7. Check before normal traffic

Only with authorization for the external test, use a harmless report in a test channel. Verify:

1. Triage freezes the original root coordinates and posts exactly one thread reply with one marker.
2. Repro accepts the marker only from the configured identity in that original thread.
3. No source-channel root post occurs and no worker has Slack write tools or credentials.
4. Missing coordinates, missing/deleted parent, or failed preflight creates no post or tracker issue.
5. The actual event provider supplies the agreed `ts` contract and a live run can read its canonical project files.

Until prerequisites and the authorized thread-safety checks succeed, retain disabled status. Native product repair still follows the matching Plan, behavioral red, layered checks, and actual evidence. Do not label bot setup as product acceptance.
