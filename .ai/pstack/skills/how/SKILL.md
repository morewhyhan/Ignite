---
name: how
description: Trace current behavior, ownership and runtime flow from source. Use for walkthroughs, placement questions, and Feature or Design maintenance under their owning README. Use why when historical intent is disputed.
---

# How

Reconstruct what the system does now. Trace a relevant entry point through data, interfaces, ownership and observable result. Do not infer behavior from names or infer historical motivation from code.

## Ground the question

Start with the original user promise, relevant Feature, current Design and actual source. For Feature maintenance follow [Feature rules](../../../../docs/features/README.md) and pair this method with [experience-first](../principle-experience-first/SKILL.md). For Design maintenance follow [Design rules](../../../../docs/designs/README.md) and pair it with [prove-it-works](../principle-prove-it-works/SKILL.md). These core methods apply by default when maintaining those documents, even without an explicit skill invocation.

Read only the paths needed to answer the question. A simple change uses the shortest trace that establishes the affected promise or fact, retaining the necessary source and Plan references. It does not skip the owning README's required method or acceptance.

## Trace and reconcile

1. Find the actual trigger and entry point.
2. Follow inputs, transformations, reads, writes and returned results through the relevant code.
3. Inspect the types and interfaces that establish responsibility and boundaries.
4. Compare the trace with the existing promise or documented fact. Record unresolved differences in the owning Plan.
5. Recheck contradictions in source before presenting an explanation or updating current facts.

Expand only when a missing connection, changed ownership or observed contradiction affects the result. Use [why](../why/SKILL.md) when an existing promise or historical reason is disputed and would change the decision.

## Optional independent exploration

Work directly for a narrow question. For a substantial cross-cutting question, authorized read-only delegates may explore independent slices. Use [explorer-prompt.md](references/explorer-prompt.md) and [explainer-prompt.md](references/explainer-prompt.md) only for that branch. A file count alone does not require agents.

Before authorized delegation, read the relevant roles in .ai/pstack/config.json and check actual host capabilities. Missing, auto, inherit-parent or unsupported choices inherit the host model. Delegates may read only the assigned scope and cannot write files or external state. Without delegation, perform the same trace directly and do not claim independent review.

## Explain or maintain

Lead with the current behavior and cite the source needed to check it. Add flow, locations, boundaries and surprising behavior only when useful. Use a diagram when it clarifies the connection. No fixed section list is required.

Feature preserves user intent; Design preserves implemented facts. Update them only within authorized scope under their README. Keep ordinary judgments and unresolved gaps in the matching Plan, not a second exploration ledger. Apply technical-writing and unslop to the prose.
