---
name: why
description: Investigate historical intent and lasting design rationale using cited evidence. Use for why questions, disputed history or ADR maintenance. Start with native records and expand to relevant authorized sources only when the answer needs them.
---

# Why

Explain which constraints and decisions shaped the current system. Code establishes mechanics, not its own motivation. Keep direct evidence, supported conclusions, inference and unknowns distinct using [epistemics.md](references/epistemics.md).

## Start with the existing owner

Read the original question, relevant Feature, Plan judgments, ADR and source history. For ADR maintenance, follow [ADR rules](../../../../docs/others/adr/README.md) and pair this method with [architect](../architect/SKILL.md). This is the default core method for a lasting rationale, not a reason to create an ADR for ordinary choices.

For Feature maintenance, use why only when the original promise or historical reason is disputed and affects behavior, scope or acceptance. Current mechanics use [how](../how/SKILL.md). A simple rationale can be established by one cited decision and a check that its constraint still applies.

## Investigate the unanswered question

1. Anchor the target in the relevant files, symbols, decision and version.
2. Read the native decision record and the relevant git commits or blame. Follow renames when lineage matters.
3. Read referenced PR discussions or other records when available and needed. Use gh or an actual configured connector; neither is guaranteed.
4. Expand only when a concrete unanswered question, contradiction or referenced lead could change the conclusion. Choose the matching source playbook from [source-playbook.md](references/source-playbook.md).
5. Stop when the scoped question is supported or its consequential gaps are explicit.

Source categories are options, not a mandatory coverage sweep. Connector availability does not authorize unrelated searches. Use only authorized relevant records. Report missing access when it limits the answer, and distinguish an unsearched source from a searched source that returned nothing. Do not treat a null result as proof that no rationale exists.

If the target is defensive code and an incident could explain it, use [incident-postmortem.md](references/sources/incident-postmortem.md) within the relevant source. Defensive syntax alone does not require every observability system.

## Optional independent investigation

Use direct investigation for a narrow question. When substantial independent sources need separate reading and delegation is authorized, assign bounded read-only slices with [investigator-prompt.md](references/investigator-prompt.md). The coordinator can synthesize directly with [synthesizer-prompt.md](references/synthesizer-prompt.md). No fixed investigator count or synthesizer agent is required.

Before authorized dispatch read .ai/pstack/config.json roles and actual host capabilities. Missing, auto, inherit-parent or unsupported choices inherit the host model. Do not invent models or claim model diversity. Delegates do not modify files or external state.

## Preserve the evidence

Cite actual sources, surface contradictions and explain each inference. Do not retrofit a clean motive onto code that merely makes sense today. Treat the user's hypothesis as a candidate to check.

Report the conclusion, its support, consequential unknowns and the sources actually consulted. Keep only useful sections from the synthesis outline. For a change, carry forward the constraints to preserve, authorized changes and unresolved risks in the matching Plan. Lasting rationale belongs in ADR; implemented facts belong in Design. Apply technical-writing and unslop without removing uncertainty supported by the evidence.
