---
name: tdd
description: Establish a real failing behavior assertion before implementation, then verify the same test after the change. Required for new Ignite Plan red evidence and test or evidence maintenance under the owning README; also use for explicit TDD or focused regression work.
---

# TDD

Make the intended behavior executable before changing the implementation. The test must fail because the promised behavior is absent or wrong, then pass against the resulting implementation.

## Follow the evidence owner

Use [test-case rules](../../../../docs/others/test-cases/README.md), [evidence rules](../../../../docs/others/evidence/README.md) and [testing standards](../../../../docs/standards/testing.md). Pair this method with [test-behavior-not-implementation](../principle-test-behavior-not-implementation/SKILL.md) and [prove-it-works](../principle-prove-it-works/SKILL.md) by default when maintaining tests or evidence.

For a new Ignite Plan, record the required red with `pnpm ignite tdd red --plan <IGT-ID> --ac <AC-ID>` before implementation. Keep the concrete test path consistent from red to green. Expensive setup, unclear reproduction and integration requirements do not waive this contract. Environment errors, placeholder failures and assertions written after implementation are not behavioral red evidence.

If the user explicitly postpones testing, keep verification pending, do not run checks or claim red/green evidence, and do not mark the Plan done.

## Use the smallest real behavior path

1. Derive the expected result from the original promise and relevant AC, including required layers.
2. Choose the closest existing executable path that can observe that result. Call it as its users do and assert a concrete expected value or state.
3. Add or update the focused assertion before implementation.
4. Run it through the required native red route. Confirm the actual failure proves the missing behavior. Correct unrelated failures before claiming red.
5. Implement the scoped fix without weakening the promise or assertions.
6. Run the same behavior check through the Plan's native verification route and inspect the actual evidence.

A narrow path is enough for a simple change if it proves the required result. Mock database tests prove the unit layer, not persistence. Browser and external obligations remain required when declared.

Outside a native Plan obligation, impractical new harness setup can use a targeted existing reproduction or verification instead. State when no failing-before assertion was demonstrated. This conditional fallback cannot bypass Ignite's required red or layers.

## Preserve evidence and intent

Do not rewrite tests to bless wrong behavior or reduce assertions merely to turn green. Changed expected behavior needs the user's authorized promise and corresponding Feature/Plan update. Prefer deterministic behavior checks over timing, broad mocks or fixture churn.

Reuse active or passed runs with the same inputs. Read actual run records and distinguish assertion failure, environment error, stale version, skipped checks and passing results. Manual captures supplement native evidence.

Report the REQ/AC, failing-before and passing-after runs, tested version and consequential gaps. Apply technical-writing and unslop; do not create a second pass table.
