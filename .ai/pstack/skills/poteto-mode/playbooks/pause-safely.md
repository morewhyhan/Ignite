
### Pause safely

**You own a clean stop. Leave a checkpoint a cold-start agent can resume from.** This is explicit only. On "keep going", "going to bed, keep going", or "don't stop", do not pause.

1. Stop at a safe boundary. Finish the current atomic step or back out of it. Start nothing new, and cancel any nested subagents.
2. Take no irreversible action to pause. No new PR or push solely to pause; an existing PR does not itself authorize further publication.
3. Make the work durable. Inspect ownership and the user's current commit instructions. Save edits on disk and record their paths and state. Commit only task-owned changes when authorized; do not include another contributor's edits or force a `wip:` commit. A checkpoint can describe uncommitted files and a broken tree without committing them.
4. Record durable intent, completed work, pending tasks, evidence and resume action in the existing Plan handoff/judgment. Do not create a second long-lived work log. If context transfer needs a temporary note, use an available temporary directory and point at the existing Plan trail. Context compaction or restart alone is not a pause instruction; save the resume point and continue authorized work.

**Reply:** where you are in the loop, what's on disk versus still in your head (paths, no diff dumps), the commits you made and whether the tree is clean, and the first action on resume. This is a pause, not a final report.
