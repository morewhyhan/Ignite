
> Ignite adaptation: Before following this inherited method, read [ADAPTER.md](../../ADAPTER.md). Its project, scope, permission, tool and model mappings take precedence over incompatible upstream execution instructions.

# Verify the result and open a PR

"It compiles" is not evidence. The [Prove It Works principle](../../skills/principle-prove-it-works/SKILL.md) makes the agent check the real artifact before it reports success, and your job is to make "the real artifact" checkable. This page covers stating a finish condition, vetting a measured number, generating a verification skill for your app, opening the PR, and driving it to merged.

Verification is the slowest step in most agent work, because it's the step that usually waits on a human. Make the agent able to do it, and you stop being the bottleneck. Skip it, and running more agents only gets you more unchecked work to review.

![A prototype plane flies a real test course while she times it with a stopwatch and robots film and checklist the run; the terminal reads verify: pass, evidence: captured.](./images/verification.jpg)

## State the finish condition up front

Put what done means in the first prompt, in whatever words fit:

```text
/poteto-mode add json output to this command. text output stays byte-identical, the json parses, both run against the sample project. show me the evidence.
```

Now the agent has three checks it can run, not a mood to satisfy. The reply should connect the result to REQ/AC, actual run records, and the tested revision. Commands and artifacts support that explanation instead of replacing it. If a check couldn't run, a good reply says "inconclusive", and you should treat a confident reply without evidence as a red flag.

Match the check to the change:

- A CLI change runs the real command.
- A UI change walks the changed flow in the running app. When it must match a reference pixel for pixel, the [Visual parity playbook](../../skills/poteto-mode/playbooks/visual-parity.md) diffs screenshots against a frozen baseline instead of judging by eye.
- A parser or migration replays a saved input.
- A perf change compares before and after profiles.
- A storage change reads back the written value.

Ask for the proof as an artifact you can inspect yourself: the failing test and then the passing one, a before-and-after video, the trace, the screenshot. If the fix already merged, ask for the same check again on main. An artifact beats a plausible explanation, because you can challenge it without replaying the whole run.

For a small diff you don't fully trust, [`/blast-radius`](../../skills/blast-radius/SKILL.md) finds what it could break elsewhere. It picks the one fact the change is safe because of and proves it by running code instead of writing an essay about it.

## Vet a measured number with `/benchmark-checklist`

A before-and-after number is the easiest evidence to get wrong by accident. A warm cache, a debug build on one side, or work that never ran inside the timed region can each produce a convincing speedup. Before you report or act on a number, type:

```text
/benchmark-checklist vet the export speedup before it goes in the pr
```

[`/benchmark-checklist`](../../skills/benchmark-checklist/SKILL.md) asks seven questions and wants evidence from a run for each:

1. What limits the number, and why isn't it double?
2. Did every side run tuned the way production runs?
3. Does the result break a physical limit, like disk bandwidth or core count?
4. Did anything error or return wrong output?
5. Does it reproduce over alternating runs, with a median and a range?
6. Does it matter end to end, on the path a user waits on?
7. Did the work actually happen inside the timed region?

The verdict comes back as faster, slower, no measurable difference, or inconclusive, with the run count, range, and limiter. It says inconclusive when it can't name the limiter or a side ran untuned. `/poteto-mode` already runs the checklist inside the Perf issue and Hillclimb playbooks, so you type it yourself when you measured something outside them, or when someone else's number looks too good. It's the working form of the [Explain the Number principle](../../skills/principle-explain-the-number/SKILL.md).

## Create a project verification skill

The UI bullet above hides a real requirement. The agent needs a scripted way to drive your app. If your project has one, great. If not, run:

```text
/create-verification-skill
```

[`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md) interviews the repository, not you. It works out what a user touches, how the app launches locally, what can drive it (an existing harness first, otherwise browser and CDP, a PTY, or plain HTTP), what evidence proves behavior, and whether two instances can run side by side. It asks you only what the code can't answer.

It writes project-specific control instructions under `.ai/skills/verify-<app>/`, with Launch, Doctor, Drive, Evidence, and Cleanup sections. Synchronize discovery entries using `node scripts/pstack-sync.mjs` for a read-only preview and `node scripts/pstack-sync.mjs --write` to apply. Instructions reference existing Feature REQ/AC, tests, and Plan-required layers. The [worked example](../../skills/create-verification-skill/references/feature-map-example/) explains user paths and interaction states; it is not a second requirement or pass-status source.

Reuse existing Playwright tests and native checks rather than rebuilding them. A control skill can help an agent exercise an unfamiliar surface, but screenshots and a self-reported verified result cannot replace native AC evidence.

For actual engineering work use `pnpm ignite check --plan <IGT-ID> --level auto`. Reuse an active or passed run for the same inputs. After included Plans are complete, Release verification runs on the same final version under the existing rules. State which layers actually passed; unit checks against a mock database do not prove real persistence or browser behavior.

## Keep the verification instructions current

Use [maintain-verification-skill](../../skills/maintain-verification-skill/SKILL.md) when changed behavior or observed drift affects launch, operation, or observation. Do not schedule daily maintenance by default.

Update control instructions and references alongside the affected Feature, Plan, tests, and actual Design. Coverage and completion stay in those native records. If an app regression appears, report or fix it through the matching Plan instead of changing the instructions to hide it. No verification script or skill is required merely to adopt a thinking method.

## Open the PR

```text
/poteto-mode open the pr. small ordered commits, evidence in the description.
```

When creating a PR is authorized, the [Opening a PR playbook](../../skills/poteto-mode/playbooks/opening-a-pr.md) prepares a reviewable diff and evidence. Preserve existing commits and user work. Split only where the result can be reviewed and integrated independently; do not manufacture extra PRs or Plans for ceremony.

## Drive the PR to merge-ready with Babysit

An open PR starts collecting blockers immediately. Checks fail, reviewers comment, trunk moves. Hand that churn to the [Babysit playbook](../../skills/poteto-mode/playbooks/babysit.md):

```text
/poteto-mode babysit this pr. get it green.
```

Babysit can observe a PR through available host tools. The bundled watcher is an optional GitHub status helper, not an Ignite acceptance checker; READY or exit code zero cannot establish Plan or Release completion. Take blockers in order: conflicts, review findings, then CI. Within existing authorization, known fixes can batch into one push, so the checks restart once instead of after every fix. The comment triage is skeptical, because humans and bots file real catches and noise in the same list. A real finding gets a fix, and noise gets dismissed with the disproof recorded for review. Posting a reply requires authorization. When all you want is status, ask smaller and Babysit answers without starting the loop:

```text
/poteto-mode check on pr 123. anything outstanding?
```

Babysit stops at merge-ready. It never merges, even with everything green, because merging is a different decision.

## Land the stack with Shipping

Green is not the same as safe. When you're ready to land, say so:

```text
/poteto-mode land the stack.
```

The [Shipping playbook](../../skills/poteto-mode/playbooks/shipping.md) verifies each PR independently before it arms anything. Use independent review when useful and authorized, alongside native Plan/Release evidence. A fresh agent verdict cannot replace required runs. Only with explicit merge authorization does Shipping land the contiguous verified run from the bottom, one PR at a time through GitHub by default or Origin when its CLI is available, and reports the first PR that breaks the chain. A verified PR sitting above an unverified one waits, because merging it would pull the gap in underneath.

Next: [Run work while you sleep](./07-overnight.md).
