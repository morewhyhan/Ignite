
> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Reproduce automation prompt

> Source material for setup. Generate a live prompt only for an explicitly authorized, supported event-provider integration. Do not copy this introduction or its relative adapter header into the generated prompt. Include the canonical repository-relative operational path. A scheduler alone does not supply Slack events.

Read and follow `.ai/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md` for this run.

Configuration source. Include this repository-relative path only when it is committed in the same target repository. Otherwise paraphrase the configured values. Never use a plugin source or cache path:

```text
{{BENNY_CONFIG_PATH}}
```

Trigger:

```json
{
	"source_channel_id": "{{SLACK_CHANNEL_ID}}",
	"ts": "{{SLACK_MESSAGE_TS}}",
	"thread_ts": "{{SLACK_THREAD_TS_OR_EMPTY}}"
}
```

The creation intent should describe the actual supported event provider delivering a new top-level report in the configured source Slack channel. Include the configured repository, default branch, issue tracker, control adapter, operation guidance referencing native Feature AC and test cases, and authorized draft pull request capability. Do not create a scheduled polling substitute for an unavailable event provider.

Treat the source channel and root thread timestamp as immutable. If either is missing or does not match configuration, stop without posting.

Wait for a configured triage marker from the configured triage identity in this exact thread. Proceed only for `[benny:bug]` or `[benny:performance]`.

Require the configured control-adapter skill before attempting a repro. Reproduce the exact discriminating symptom twice through the real UI. Verify existing pull requests or commits without authoring over them. Attempt a bounded fix only after a confirmed repro and the operational file's fix gate.

The coordinator is the only Slack poster. Every child prompt must forbid `SendSlackMessage`, `PostToSlack`, `chat.postMessage`, and all other Slack writes. Children return findings only.

Never post a root message in the source channel.
