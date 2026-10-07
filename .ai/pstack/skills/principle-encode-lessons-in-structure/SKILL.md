---
name: principle-encode-lessons-in-structure
description: Apply when you catch yourself writing the same instruction a second time,
  or notice a recurring correction. Encode the rule as a lint, metadata flag, runtime
  check, or script instead of more text.
---

> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.


# Encode Lessons in Structure

Encode recurring fixes in mechanisms (tools, code, metadata, automation) instead of textual instructions. Every error, human correction, and unexpected outcome is a learning signal. Capture it, route it, and close the loop.

**Why:** Textual instructions are easy to miss. They require the reader to notice, remember, and comply. Structural mechanisms (lint rules, metadata flags, runtime checks, automation scripts) enforce the rule without cooperation.

**Pattern:**
When you catch yourself writing the same instruction a second time:
1. Ask: can this be a lint rule, a metadata flag, a runtime check, or a script?
2. If yes, encode it. Update the owning professional standard to explain its scope when needed; remove redundant prose only after preserving useful rationale and links.
3. If no (requires judgment), clarify the existing professional rule or canonical skill in place and add a useful failure example. Do not append a second rule table to AGENTS.md.

**Pick the strongest mechanism.** When more than one mechanism would work, choose the strongest the situation allows (an unrepresentable state that cannot compile, then a lint or banned API that fails CI, then a canonical helper, then a runtime check), because agents copy whatever the surrounding code already does and a weaker guard becomes the next template.

**Corollary:** If the fix is structural, only use the structural fix. The instruction is the symptom.

**Feedback loop:**
- **Capture every correction.** When the human intervenes or tests fail, decide if it's a one-off or a pattern.
- **Route to the right layer.** One-off decisions go in the current Plan. Recurring enforceable mistakes go to the owning code, lint, type or check; judgment guidance goes to the existing professional standard or canonical skill. Long-lived architecture choices go to ADR and implemented facts to Design. No separate brain-note store or rules ledger.
- **Close the loop.** Apply the authorized fix now or retain a concrete task in the current Plan.tasks. Do not create a parallel todo ledger.

**Anti-patterns:**
- Acknowledging without recording ("I'll keep that in mind" does not persist)
- Recording without routing (a brain note about a lint rule that should exist is wasted unless the lint rule gets implemented)
- Fixing without generalizing (fixing one instance while leaving the recurring pattern intact)
