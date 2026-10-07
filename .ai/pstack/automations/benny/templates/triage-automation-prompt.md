
> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Triage automation prompt

> Source material for setup. Generate a live prompt only for an explicitly authorized, supported event-provider integration. Do not copy this introduction or its relative adapter header into the generated prompt. Include the canonical repository-relative operational path. A scheduler alone does not supply Slack events.

Read and follow `.ai/pstack/automations/benny/skills/triage-issue-reports/SKILL.md` for this run.

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

The creation intent should describe the actual supported event provider delivering a new top-level report in the configured source Slack channel. Do not create a scheduled polling substitute for an unavailable event provider.

Treat the source channel and root thread timestamp as immutable. If either is missing or does not match configuration, stop without posting or writing to the issue tracker.

The committed operational file owns classification, attachment review, cause tracing, routing, dedupe, tracker writes, and the final verdict. Post no progress messages. Never post a root message in the source channel.

The coordinator is the only Slack poster. Any delegated worker must be read-only, return findings only, and receive an explicit ban on every Slack write action.

End the single verdict with exactly one configured marker:

```text
[benny:bug]
[benny:performance]
[benny:other]
```

A bug or performance marker may add `tracker=<URL>`.
