
# The pstack guide

pstack works best when you stop micromanaging the agent. You describe what you want and how you'll know it's done. `/poteto-mode` picks the playbook, runs the other skills as the steps need them, and shows you the evidence. This guide teaches that habit with realistic prompts. Document maintenance starts at its [existing owner](../../../../docs/README.md) and required core methods, even without invoking poteto-mode. Simple work uses the shortest relevant steps while retaining required records; the AI chooses only branches whose stated conditions hold.

Here's what you'll learn:

1. [Set up pstack](./01-setup.md). Use the project entries and optionally choose host-supported models.
2. [Route work through `/poteto-mode`](./02-poteto-mode.md). Give it a goal and watch it pick a playbook.
3. [Understand the code](./03-understand.md). A read-only investigation, then `/how`, `/why`, `/teach`, and `/recall` before you edit anything.
4. [Design the change](./04-design.md). `/architect`, `/arena`, `/swarm`, `/interrogate`, prototypes, and plans before code locks in a shape.
5. [Build and clean the change](./05-build-and-clean.md). The build playbooks, `/tdd`, `/unslop`, and `/no-comments`.
6. [Verify and ship](./06-verify-and-ship.md). Prove behavior on the real app, vet numbers with `/benchmark-checklist`, then prepare a focused PR and drive it to merged when publishing and merging are authorized.
7. [Run work while you sleep](./07-overnight.md). Trust before loops, an overnight contract, decisions in the existing Plan, and optional host-supported delegation and automation.
8. [Steer with principle names](./08-principles.md). The 24 names that redirect an agent mid-task.
9. [Make it yours](./09-make-it-yours.md). Your own mode, `/correct` for repeated mistakes, and when a real skill behavior comparison is useful.
10. [Recipes and pitfalls](./10-recipes-and-pitfalls.md). Prompts to copy and mistakes to skip.

Read the pages in order the first time. After that, each page stands alone.

When you're stuck, or can't tell which skill fits, type [`/poteto-help`](../../skills/poteto-help/SKILL.md) with your question:

```text
/poteto-help which skill should i use to review this branch?
```

It answers, hands you a prompt to send, and links the skill or guide page the answer came from. It doesn't start the work, because a pstack run spends real tokens, so you send the prompt when you're ready. It runs only when you type it.

## If you only remember one thing

Give the agent a goal and a way to check it, in your own words:

```text
/poteto-mode the export writes duplicate rows when a retry lands mid-run. repro first, then fix and verify.
```

You don't need to name a playbook or list skills. "repro first" and a checkable outcome are all the routing signal `/poteto-mode` needs. It matches the Bug fix playbook, maps needed steps into the existing Plan tasks, and calls the right skills as each step fires.

Next: [Set up pstack](./01-setup.md).
