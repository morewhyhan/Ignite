
> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Benny

Benny provides methods for two cooperating Slack-report automations. Triage reads a report, classifies it, checks duplicates, and may register a confirmed new bug. Reproduction waits for trusted triage, drives the real UI, verifies an existing fix or prepares a bounded draft fix.

This pack is disabled in Ignite. Its three optional setup and operation entries are discoverable; discovery is not activation. An explicitly configured, authorized automation reads its canonical operational file directly.

## Set it up when requested

1. Read [FOR_AGENTS.md](./FOR_AGENTS.md) and [setup-benny](./skills/setup-benny/SKILL.md). Use this pack at `.ai/pstack/automations/benny/`; do not copy it into a second platform directory or enable a plugin.
2. Generate secret-free user configuration under `.ai/benny/` from [configuration.example.yaml](./templates/configuration.example.yaml). Secrets stay in the host's secret store or environment.
3. Use [the control-path example](./skills/reproduce-and-fix-issues/references/feature-map.example.md) to reference existing Feature REQ/AC and actual test cases. It is operation guidance, not another specification or pass-status map.
4. Confirm an actual Slack event provider and the current host's supported automation and connector tools. A scheduling tool does not imply Slack event support. Without it, retain the disabled state; do not create a polling workaround.
5. Only after explicit activation authorization, configure the supported trigger, channel/tracker/control permissions, and exact canonical prompt paths. Verify thread safety in an authorized harmless check before normal traffic.

The current pack supplies instructions and examples. It does not establish that a connector, event provider, app-control adapter, or live bot is already configured.
