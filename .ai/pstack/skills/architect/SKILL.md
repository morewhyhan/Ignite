---
name: architect
description: Sketch types, signatures, and module structure before code, then stay
  in the loop while implementation fills in. Use for /architect, 'architect this',
  'design this', or non-trivial work where jumping to code would lock in the wrong
  shape.
---

# Architect

Design before implementing. Sketch types, function signatures, class shapes, and module boundaries with `not implemented` bodies and pseudocode. Compare distinct viable shapes when the problem warrants it, then fill in code against the chosen sketch. If implementation proves the sketch wrong, throw it out and redesign.

For ADR-only maintenance, ground the actual decision and explain its viable options with why under [ADR rules](../../../../docs/others/adr/README.md). Editing an accepted rationale does not enter sketch/implementation phases or authorize code changes. Use how only on a relevant fact gap; do not redesign settled architecture to refresh documentation. The phases below apply when a new or changed code shape is authorized.

## Start

Follow [Plan rules](../../../../docs/plans/README.md) for the existing Plan.tasks and judgments. For a lasting rationale, follow [ADR rules](../../../../docs/others/adr/README.md) and pair architect with why by default. Implemented facts follow [Design rules](../../../../docs/designs/README.md). Do not create a second task or rationale ledger. A constrained choice uses the shortest grounded sketch while retaining the required reasoning.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A: Ground the problem

Build a real mental model of every system the new code touches. Run the **how** skill over the relevant subsystems.

Naming a file is not grounding. Trace the affected promise, actual callers and current ownership with how. Use why when historical reasons are disputed or a lasting ADR needs them. Do not require history investigation merely because an ordinary implementation boundary changes.

Skip Phase A only when the work is genuinely greenfield with no surrounding system to integrate.

## Phase B: Sketch

For a consequential unresolved architecture, compare at least two structurally distinct viable candidates, not two versions of the same point fix. Work locally unless delegation is authorized and useful. For a constrained small change, a grounded usage/type sketch is enough. If using authorized arena candidates, pass references/runner-prompt.md and references/rationale-template.md as the design format. Read .ai/pstack/config.json roles["architect runners"] and current host capabilities for optional role preferences. A missing, auto, inherit-parent or unsupported value means omit the model argument and inherit the current host; never try a fixed Grok/Opus fallback. Do not read or generate a second Cursor model-rule file, force a model family, or claim unavailable parallel models were used.

Screen every candidate against [`references/design-red-flags.md`](references/design-red-flags.md) before synthesis. Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repo.

Compare viable candidates on interface depth. Prefer the design that hides more complexity behind a smaller, simpler public surface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers.

Compare candidates and record the selected shape and rejected alternatives in the original Plan; only a lasting architecture decision warrants an ADR. The rationale template is a section outline, not a requirement for another permanent proposal document.

## Phase C: Agree (opt-in)

Default: proceed directly to implementation with the synthesized design. No human checkpoint.

Opt in to a checkpoint when the invoker explicitly asks: "/architect with checkpoint," "stop and show me before implementing," or similar. Then surface the synthesized design and pause for sign-off.

The synthesis can ship as its own commit either way, as the "scaffold first" mode of the **foundational-thinking** principle skill. Planned and scoped breakage during fill-in is fine, per the **outcome-oriented-execution** principle skill. For adversarial pressure on the design before implementing, run the **interrogate** skill on the synthesized sketch.

If the human pushes back on the shape (in a checkpoint or after the fact), treat that as Phase A evidence. Re-ground and re-run Phase B before writing more code.

## Phase D: Implement against the sketch

Replace `not implemented` bodies with code, pseudocode with logic. The synthesized sketch is the contract.

Deviations from the sketch are signal worth surfacing, not friction to absorb silently. If a function needs a parameter the sketch didn't anticipate, ask whether the sketch was wrong, the requirement was missed, or the implementation is overreaching.

## Phase E: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out. Don't bolt fixes onto a wrong design, per the **redesign-from-first-principles** and **fix-root-causes** principle skills.

The signal is a *pattern*, not single instances. Tells:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types that need escape hatches (`any`, casts, optional fields always set in practice) to compile.
- The "we need a lock" reflex when the sketch said the state wasn't shared.
- Callers having to know the abstraction's internal rules to use it.
- Two or more independent Phase D deviations of the same shape across the implementation.

Use judgment. A few edge cases don't condemn an architecture. Some problems are legitimately complex. Complexity in the data is not complexity in the design.

When you scrap:

1. Re-run the **how** skill over what's been built.
2. Redesign as if the new constraints had been day-one assumptions, per redesign-from-first-principles.
3. Subtract before adding, per the **subtract-before-you-add** principle skill. The new sketch should be smaller than the old one before it grows.
4. Return to Phase B and compare the newly viable shapes; another arena is optional and requires authorized delegation.

## Outputs

Derive caller usage from the authorized Feature promise first, then derive the type sketch. Preserve Ignite's module Hook → Hono Typed RPC → route → Prisma boundary and AppType as the business type source. Avoid duplicate transport schemas; an established typed RPC interface is not accidental leakage. One file with new types and signatures for small changes. Module map plus type definitions for larger work. Use references/rationale-template.md for the rationale in the existing Plan or warranted ADR, including the usage sketch and selection reason. Scratch candidates are temporary working artifacts, not another authoritative design history. After implementation, update the relevant Design with current facts. Never commit an incomplete sketch as a completed product; any planned intermediate breakage stays scoped to the original Plan and cannot pass its completion gate.
