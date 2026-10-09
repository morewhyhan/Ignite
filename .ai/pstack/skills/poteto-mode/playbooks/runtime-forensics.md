
### Runtime forensics

**You own the diagnosis. Instrument the live process, don't theorize from source.** The deliverable is a cited diagnosis, not a fix.

1. Capture the live signal on the matching surface via the control skill: a CPU profile for a spinning process, a heap snapshot for a leak, a CDP trace for a visual glitch. A real artifact, not a guess.
2. Reduce the artifact to the function on the hot path, the retainer chain from the leaked object to a GC root, or the loop firing without input. Delegate a large artifact only when it forms a useful independent read scope; otherwise query it in bounded chunks. Keep the reduced finding in the main thread.
3. Separate passive observation from experiments that change the process. Use captured profiles, logs, and existing instrumentation first. If a hypothesis needs CDP injection or a hot change, use an isolated disposable process within authorization and record the intervention and its limits. A production or shared process is not read-only when instrumented this way; this diagnostic playbook does not authorize changing it. Without confirming evidence, label the mechanism a hypothesis.
4. Map the finding back to source: file, symbol, the line that allocates or schedules.
5. Record the relevant execution choice and evidence limits when they affect the diagnosis.

**Reply:** the signal captured, the reduced finding, how you proved the mechanism, the source location, artifact paths. No fix unless asked. Hand back to Bug fix or Perf once the cause is known.
