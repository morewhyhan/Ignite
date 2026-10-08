
> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Run work while you sleep

This is the payoff for everything before it. An agent you can trust to verify its own work is an agent you can leave alone with a hard task. What makes that safe isn't hope. It's a checkable finish condition, an isolated worktree or cloud agent, and decision records in the existing Plan that you can review in the morning.

![She waves goodnight from the door while robots keep the factory running, one updating a DECISION LOG wall board under a BUILD LOOP ACTIVE sign.](./images/overnight.jpg)

## Earn the trust before the loop

A loop you don't trust just produces unchecked work faster, and the mess compounds with every iteration. Before you leave one running, check that it has earned it:

- You've done the task once by hand, or watched an agent do it, so you know what good looks like.
- The agent has the tools and signals you'd use yourself: the verification skill, the profiler, the logs.
- Every stage proves its work and can stop the line when the work misses the bar.
- You've read a few transcripts and turned the repeated failures into tools, skills, or checks.

Make the loop autonomous only after all four hold. Until then, run it while you watch.

## The overnight contract

A good handoff has the goal, the finish condition, permissions, and an escape hatch. It doesn't need to be long:

```text
/poteto-mode im going to bed. migrate every caller to the new parser in a fresh worktree off <base>.
done means zero old callers, all parser fixtures pass, old api deleted.
record decisions and evidence in the existing Plan. don't ask me before committing.
/loop until done. if you're truly stuck after a few hours, stop and write up why.
```

Walk through what each line buys you:

- "im going to bed" asks the agent to continue within existing scope and authorization. It does not grant external writes or override verification rules.
- "done means..." turns the goal into checks every iteration can run.
- "fresh worktree off `<base>`" keeps the run from colliding with anything else you have open.
- "don't ask me before committing" pre-answers the permission the agent would otherwise block on.
- `/loop` is a Cursor-specific wake mechanism. In another host use its actual authorized goal or automation facility. Codex scheduling requires the available automation tool; do not invent Slack event support or a workaround polling job.
- The escape hatch lets it stop at a genuine dead end and write up why, which beats eight hours of creative goal reinterpretation.

Because you'll review this work after stepping away, `/poteto-mode` routes it through [`/figure-it-out`](../../skills/figure-it-out/SKILL.md), which maps the needed phases into the existing Plan tasks and keeps reasons and evidence in that Plan.

To stop a run on purpose, tell the agent to pause, or that you're about to go offline or restart Cursor. The [Pause safely playbook](../../skills/poteto-mode/playbooks/pause-safely.md) finishes or backs out of the current step, commits a work-in-progress checkpoint, and writes the resume point in the existing Plan. A fresh chat picks the work up from that note through the Session pickup playbook. Saying "keep going" never triggers a pause.

## What the loop does all night

```mermaid
flowchart TD
    A[Check the finish condition] --> B[Make the smallest justified change]
    B --> C[Verify against the real artifact]
    C --> D{Progress?}
    D -->|Yes| E[Commit]
    D -->|No| F[Discard]
    E --> G[Update existing Plan and evidence]
    F --> G
    G --> A
```

For each meaningful change, inspect its actual result and update the existing Plan with the decision and evidence. Reuse passed checks for identical inputs. Changes that didn't help get discarded, not left to ride. A plateau means pivot, not stop, and the finish condition never quietly relaxes to declare victory.

## The morning audit

[show-me-your-work](../../skills/show-me-your-work/SKILL.md) records a meaningful decision, its reason, evidence, and result in the existing Plan's decision or state record. A durable architectural tradeoff belongs in ADR; actual system facts belong in Design. Raw experiment files may be local evidence attachments, but do not create `decisions.tsv` or `.audit` as another decision or progress ledger.

When you return, ask for a review of the goal, changes, actual run evidence, and remaining gaps. Read the Plan and evidence it points to. Independent reviewers are optional when useful and authorized; do not require a different model family or a review ceremony for every handoff.

## When the night holds a queue, not a task

The contract above drives one task to one finish condition. Some nights hold more, a queue of independent changes or a whole program. Three playbooks scale the same trust up.

In Ignite, queue ownership and dependencies stay in existing Plan collaboration fields, task status comes from `tasks`, and Release defines combined acceptance. Native checks and actual versioned evidence are required alongside any independent review. No verifier verdict grants merge permission; the prompt must actually authorize merging. Do not initialize another orchestration ledger or require a fleet of agents merely because a queue exists.

[Autopilot-full](../../skills/poteto-mode/playbooks/autopilot-full.md) runs a queue of independent PRs to merged. Each PR gets one owner agent that carries it from build through merge, and no owner merges on its own verdict. A swarm of fresh verifiers starts a round at the owner's code-ready head and again at every later push that changes the patch. Only a clean verdict on the patch that merges authorizes the merge:

```text
/poteto-mode full autopilot on this queue. each item is independent. i want them merged by morning.
```

[Autopilot-stack](../../skills/poteto-mode/playbooks/autopilot-stack.md) runs the same owner loop but ships nothing. You wake up to one linear base-branch stack with a verifier's verdict on every link, and you review and land it yourself. Pick it over Autopilot-full when the changes are coupled, or when you want your own eyes on the work before anything merges:

```text
/poteto-mode autopilot these five changes but stack them, don't ship. i'll land the stack in the morning.
```

[Orchestrate](../../skills/poteto-mode/playbooks/orchestrate.md) is for a program that outlives any single agent: multi-day, many stacked PRs, fleets of subagents under one standing coordinator chat. The coordinator authors briefs, collects what its subagents finish, keeps the lowest unmerged PR green, and never writes code itself. It's deliberately heavy machinery. If one agent could finish the work in a session, the playbook itself routes you back to the overnight contract above:

```text
/poteto-mode orchestrate the store migration. own it until every package is converted and merged. i'll check in twice a day.
```

## Run many projects in parallel

A [Cursor Project](https://cursor.com/blog/projects) is an upstream hosting option for a persistent coordinator. It is not required or automatically enabled by Ignite. The coordinator uses the current host's actual capabilities. Cloning these files does not make work run in the cloud or continue after the local host stops. That's the shape the Orchestrate playbook expects. Start your prompts to the coordinator with `/poteto-mode`, and the subagents it spawns follow the playbooks.

A few habits help:

- Give each body of work its own Project, such as a feature, a migration, a perf push, or a tech-debt cleanup. Several can run side by side.
- Drag related chats into the Project, finished ones included. They become context for every agent in it.
- Give each PR a verification swarm before it merges, and let Autopilot-stack or Autopilot-full carry the queue.
- Ask the coordinator for a plan backed by data, and have it answer open questions with prototypes before it asks you.

One prompt can carry a whole Project, from research through execution:

```text
/poteto-mode refactor this repo so its architecture is more agent friendly. use /correct and /architect on past commits and review comments to find the mistakes agents make most here. use /recall for context from past chats. answer open questions with prototypes instead of asking me. come back with a plan backed by real data. once i approve it, run it with autopilot-stack or autopilot-full, and ask me which.
```

**Pitfall:** a duration is not a finish condition. "work on this for 4 hours" gives the agent nothing to check, and you'll wake up to four hours of motion instead of a result. Give `/loop` a predicate that can pass or fail.

Next: [Steer with principle names](./08-principles.md).
