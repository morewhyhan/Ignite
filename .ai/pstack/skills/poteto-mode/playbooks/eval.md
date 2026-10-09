
### Eval

**You own the experiment design. Plan, blind, run, synthesize.**

Use this playbook only for an explicit model-effect evaluation goal. Ordinary method maintenance checks resources, links, metadata, native compatibility, and meaningful helper behavior; it does not automatically launch model experiments. For an actual evaluation, follow [AI-agent standards](../../../../../docs/standards/ai-agents.md). Freeze the task and variant versions, permissions, budget, repetition count, rubric, and independent generalization tasks before running. Record key human review and evaluation limits in the existing Plan.

**Non-negotiables for blinding:**

- No `eval`, `test`, `judge`, `experiment`, `rubric`, `score`, `compare`, `benchmark`, `candidate`, or `arena` in any directory, file, or prompt the candidate sees.
- The candidate prompt looks like an organic user request. State the goal, not the meta.
- No chain-eliciting cues. Don't ask the candidate to list which skills, principles, or files they applied. Ask for design notes generally and grade chain-following from code shape, not self-report.
- Sanitize directory and slug names. Use project-shaped names a user might pick.
- Don't tell the candidate other candidates exist.
- The judge can know it's judging but sees outputs by sanitized label only, never by model name.
- Comparing two variants: one judge scores both sets in a single pass on one scale, blind to which set each came from.

**Steps:**

1. **Frame.** State what variant is under test and what behavior counts as success. Write the rubric (3-6 concrete criteria) for the judge only. Hold it back from candidates.
2. **Set up sanitized environments.** Per-candidate working dir with the variant in place. Plant any context an organic task would have: a project skeleton, the skills the candidate would naturally read.
3. **Author one organic prompt.** What a user would type. No leakage of what's being measured.
4. **Spawn N parallel candidates** per the **arena** skill's Phase B, using only models available in the actual host and the project role configuration. Use different models when the comparison calls for them and they are available; inherit the current host otherwise and state the limitation. Each works in its own sanitized dir. Same prompt to each.
5. **Spawn one blinded judge** per the **arena** skill's Phase C. Use a different available model family when possible; do not claim a multi-model comparison when the host provides only one. Judge sees outputs by sanitized label and the rubric, never a model name.
6. **Verify the chain from transcripts, not self-report.** Read candidate tool traces exposed by the actual host or explicitly supplied transcripts within the experiment scope. Do not assume a local transcript path or scan global private chats. Grade observed file reads and code shape, never the candidate's own claims. If traces are unavailable, report chain-following as unobserved rather than inventing evidence.
7. **Read every candidate output yourself** end to end. Compare to the judge's verdict. Disagreement means a model is biased or the rubric is ambiguous. Synthesize.

**Reply:** variant under test, rubric, per-candidate notes, judge's verdict, your synthesis, and a recommendation for whether to promote the variant.
