
### Bug fix

**You own this task. Plan, review, verify.** Delegate investigation and the fix to subagents, stay in the lead.

Be scientific. Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is a hypothesis, not a fix. It does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships, nothing more.

1. Reproduce it yourself on the matching surface via the control skill (Non-negotiables), even when a debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a stated, specific reason the control surface cannot reach the target, and only after driving it as far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed them with `how` over the affected subsystem and the **why** skill for regression history. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs. Don't guess. Keep a long or stubborn hunt running in the current session; use the actual host automation facility only for requested scheduled continuation. Confirm the surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent using the available configured role "bug-fix" in .ai/pstack/config.json, defaulting to host inheritance with a specific scope.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history. For a new Ignite Plan, record the actual behavioral red with `pnpm ignite tdd red --plan <ID> --ac <AC>` before implementation, using the same test path for the later green. Cost or an unclear harness is a gap to resolve, not permission to skip the required red. If the user explicitly defers test execution, implement within that instruction and leave verification pending; do not mark the Plan done.
   This is the canonical **sequence-verifiable-units** principle skill, the failing test first and the fix on top.
6. Use **Opening a PR** when publication is authorized; otherwise deliver the local diff with native evidence.

**Reply:** what was broken, root cause, fix, how you verified. Paste failing-then-passing repro output verbatim.
