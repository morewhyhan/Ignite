---
name: principle-guard-the-context-window
description: 'Apply when context is filling up: large outputs, long files, repeated
  reads, fan-out planning. Filter or read bounded chunks; delegate only useful
  independent scopes. Keep reduced findings and relevant evidence in the main thread.'
---

# Guard the Context Window

The context window is finite and non-renewable within a session. Every token should be worth its cost.

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress.

**Pattern:**
- **Isolate large payloads.** Delegate a useful independent read scope only when authorization and host capabilities allow it. Otherwise filter or read bounded chunks with existing tools. Keep the relevant evidence and reduced findings in the main context; a large payload alone does not require a subagent.
- **Keep frequently used content inline.** Templates and references used on every invocation belong in the skill file, not in separate files that cost a read each time.
- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.
