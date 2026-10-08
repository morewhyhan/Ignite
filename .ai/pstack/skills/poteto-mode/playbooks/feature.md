
### Feature

**You own the design. Plan, implement or delegate useful independent work, review, verify.**

1. `how` over the affected subsystem.
2. Use architect when competing shapes or consequential boundaries need a design decision; small clear changes do not require parallel exploration.
3. Record the applicable execution choices in the existing Plan judgment, without creating a second todo list:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **separate-before-serializing-shared-state** principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Name the data shape and organizing structure before logic. Implement directly when one owner is enough. Delegate only useful independent scopes with actual paths, REQ/AC, constraints and available roles["feature, refactoring"] from .ai/pstack/config.json, defaulting to host inheritance. Use arena when meaningful alternative designs warrant comparison, not for every error handler. Keep shared writes exclusive and review the actual diff.
5. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Rebase into small, ordered commits. Stack follow-ups.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each small unit before the next.
7. If the design is contested, `interrogate` before shipping.
8. Use Opening a PR when a PR is within the authorized delivery; otherwise deliver the local change with native evidence.

Code-coupled work (one feature, one migration) goes to a single owner with the checkpoint inline. That owner fans out internally after the blocking phase. Parent-level fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments). Rewrite the checkpoint at phase boundaries. Spawn a fresh owner rather than chaining interrupts.

**Reply:** what you built, what you chose and why, the throughput checkpoint, open decisions. Tables for design alternatives.
