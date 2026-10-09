
### Session pickup

**You own the resume point. Read the prior trail, don't redo it.**

1. Locate the prior trail. Use the current task history through the host's available history tools, an explicitly supplied workspace transcript, a referenced agent URL, or the task branch. Do not assume an `agent-transcripts/` path exists or scan global transcript directories and unrelated private chats. Read the metadata overview and last messages first, then scan back for decision points. Delegate a long transcript only when it forms a useful independent read scope; otherwise read bounded portions. Keep the reduced timeline in the main thread under **principle-guard-the-context-window**.
2. Read the applicable native Plan with pnpm ignite next --plan <ID>, its tasks, dependency contracts, handoff and original evidence; inspect Release scope when relevant. Reconstruct operational state. The branch and worktree, what already landed (`git log`, `git diff` against the base), the open todos, the decisions made. Native requirements, Plan state and original versioned evidence are authoritative; the transcript is contextual input. Resist the bias to re-derive it.
3. Diff done vs pending. Compare what shipped against what was planned, name the resume point, do not re-run the prior repro or redo completed work. Reuse unchanged valid runs under native evidence rules; verify disputed or stale claims against current artifacts.
4. Route the remaining work to the matching playbook and pick the verdict: continue the execution, ship a finished recommendation, ratify or override a prior conclusion, or postmortem a failed run. The pickup playbook ends here. The routed playbook owns the rest.
5. Verify the inherited claims against the original goal on the real artifact (the **principle-prove-it-works** skill). A passing prior self-report is not the proof.

**Reply:** where the prior agent stopped, what you inherited vs redid (ideally nothing redone), the resume point, and the outcome.
