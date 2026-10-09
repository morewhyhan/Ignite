---
name: principle-build-the-lever
description: 'Apply to non-trivial work that benefits from a repeatable tool. Reuse
  an existing command or helper that does or proves the work; build a small helper
  only for an uncovered need. Keep the tool and its actual result reviewable.'
---

# Build the Lever

When the work isn't trivial, use a repeatable tool that does or proves it. Prefer an existing native command or helper that already covers the outcome.

**Why:** Two payoffs. Throughput: a codemod, generator, or script does the work the same way every time and reruns for free. Confidence: the tool is one artifact a reviewer can read and rerun to check the work. Hand-done changes can only be re-verified by redoing them. A deterministic script turns "trust me" into "run this".

**Pattern:** First inspect the available tools and actual uncovered work. Reuse a sufficient tool and retain its actual result. Build a small helper only when it makes an uncovered operation or check repeatable. A couple of obvious edits can execute directly.

- Do the first unit by hand to learn the recipe, then build the tool. Prove it by rerunning it on that unit and diffing against your hand-done version. Make the lever safe to rerun.
- Codemod or script for edits, generator for repetitive files, a dump-to-sqlite query for analysis, a rerunnable check for verification.
- A deterministic lever beats fan-out. If the tool can process every unit in one pass, run it yourself. Don't fan out delegates to hand-apply what a script can do.
- When useful independent work is delegated, reuse the canonical method and existing Plan brief for the recipe, verification contract, and write boundaries. Add a helper or skill only for a real uncovered reusable need, and keep the shared contract outside delegates' write scope.
- Applying this principle produces rerunnable work and reviewable evidence. An existing native command and its result qualify; a new file is not required. Do not create an adapter or helper merely to satisfy a file count.
- Commit the lever when the work outlives the session.

**Balance:** A one-off can benefit from a repeatable tool when that tool makes the outcome checkable. Per the [Laziness Protocol](../principle-laziness-protocol/SKILL.md), reuse the sufficient tool or build the smallest missing helper, never a framework.

Distinct from [Encode Lessons in Structure](../principle-encode-lessons-in-structure/SKILL.md), which makes a recurring instruction a durable guardrail. This is throughput and reviewability on the work in front of you. For scripting the verification itself, see [Prove It Works](../principle-prove-it-works/SKILL.md).
