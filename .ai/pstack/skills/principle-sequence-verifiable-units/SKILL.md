---
name: principle-sequence-verifiable-units
description: Apply to multi-step work (sweeps, migrations, runs of similar edits)
  and to how you stack commits and PRs. Break work into small units that each end
  in a verifiable state, check each before the next, and order delivery so the sequence
  proves itself to a reviewer.
---

# Sequence work into verifiable units

Order work as small units with explicit verification boundaries. Advance when the checks required at the current boundary are satisfied.

**Why:** A break caught at the unit that caused it is cheap to localize. A break caught after a batch is buried, and you have already built further on a broken base. Sequencing those same units into a delivery a reviewer can replay turns "trust me" into "watch it go red, then green."

**Execution.** In a sweep, migration, or run of similar edits, establish the actual baseline and verify each meaningful unit before dependent work. Reuse valid active or passing runs for unchanged inputs under native evidence rules. Run the necessary checks when inputs change; do not mechanically rerun the whole suite for every edit. Rebase only when integration needs it and authorization covers that branch, preserving shared work. A planned migration can contain scoped reversible breakage between declared boundaries under **principle-outcome-oriented-execution**; its current required checks and final acceptance remain mandatory.

**Delivery.** Stack commits and PRs in the order that proves the work. The canonical shape is the failing test first, then the fix on top. Other story orders are a subtraction before the reshape, a baseline capture before the treatment, the scaffold before the feature. Each commit lands on its own and the sequence reads as an argument.

The sequencing complement to the **prove-it-works** principle skill, which keeps each check real, and the **build-the-lever** principle skill, which makes the per-unit check cheap.
