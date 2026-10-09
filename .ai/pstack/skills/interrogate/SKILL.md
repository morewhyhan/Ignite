---
name: interrogate
description: Adversarially review a concrete change against its original intent and evidence. Use for interrogate, challenge this, blind-spot or explicit independent review requests. Multiple reviewers are conditional on requested or useful authorized delegation.
---

# Interrogate

Return a grounded verdict on a concrete diff or artifact. Review is read-only and does not automatically apply changes.

## Establish scope and intent

Use the caller's files or diff, otherwise the verified branch base and relevant working-tree changes. Read the original user goal, relevant Feature promise, Plan scope and current Design before deriving intent from code. A commit or implementation cannot silently narrow the original promise.

Follow [Plan rules](../../../../docs/plans/README.md) for accepted follow-up work and [testing standards](../../../../docs/standards/testing.md) for required evidence layers. Name a genuine unresolved product decision, but continue independent read-only investigation when the record already establishes intent.

## Review the concrete path

Use [rubric.md](references/rubric.md) and [code-quality-review.md](references/code-quality-review.md) for relevant lenses. Trace the caller or real path needed to prove each finding. Check missing promises and evidence as well as defects in changed code. Do not invent theoretical callers or convert a style preference into a correctness issue.

Review directly for a narrow change. A requested independent or multi-model review, or a substantial change with useful independent reading, can use authorized delegates with [reviewer-prompt.md](references/reviewer-prompt.md). All reviewers receive the same original intent, concrete artifacts and relevant evidence obligations.

Before authorized delegation, read .ai/pstack/config.json roles["interrogate reviewers"] and actual host capabilities. Missing, auto, inherit-parent or unsupported choices inherit the host model. A configured panel does not launch itself. Do not claim model diversity from same-model reviewers or independent review from a direct pass.

## Judge the evidence

Read [lead-judgment.md](references/lead-judgment.md). Deduplicate findings and verify the actual path. Reviewer agreement is a lead, not proof; a lone finding with a real reproduction can be stronger.

Classify useful findings as act on, consider, noted or dismissed. Explain the consequence and evidence, and give a short reason for consequential dismissals. Record reviewer provenance only for reviewers that actually ran. Accepted work stays with the owning Plan; new scope needs the appropriate authorization.

## Return the verdict

Lead with the result, then actionable findings, actual review scope and remaining uncertainty. Include reviewer provenance or disagreements when they help assessment. Omit empty buckets and fixed agreement maps. State missing native evidence without claiming review establishes acceptance. Apply technical-writing and unslop.
