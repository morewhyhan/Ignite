---
name: principle-test-behavior-not-implementation
description: Apply when you write, change, or keep a test. Call the code the way its
  users do and assert the observed result. Judge assertions by the defects they
  detect, including absence contracts with a contrasting condition or fault injection.
---

# Test Behavior, Not Implementation

A test calls the code the way its users do and asserts the expected result or observable effect. Internal call counts and restated constants alone usually do not prove that behavior. An external interaction can be the promised effect when its payload and outcome are observed.

Before keeping a test, name the defect its assertion detects and confirm the subject actually runs. Replacing the subject with a no-op is one useful sensitivity check, not a universal verdict. A legitimate absence contract may return `undefined` or an empty collection; test the triggering condition and a contrasting presence case or relevant fault injection.

**Why:** A test that cannot fail for a defect costs CI time and review attention and catches nothing. A constant pin also fails when someone edits the constant or the prompt it restates, so it prevents that edit.

**Five shapes to inspect for weak defect sensitivity:**

- **Weak or no assertion.** No observed result, or an assertion too broad to catch the target defect. Evaluate `toBeDefined`, `toBeTruthy`, `not.toThrow`, `toBeInstanceOf`, and `toBeGreaterThan(0)` by the promised behavior.
- **Mock or absence only.** A call count or empty result without evidence that the subject exercised the relevant condition. `toBeUndefined`, `toEqual([])`, and `toHaveLength(0)` can be valid negative assertions. Confirm their sensitivity with a contrasting presence condition or relevant fault injection rather than banning the matcher.
- **Self-referential.** The expected value comes from the code under test: `expect(f(a)).toBe(f(a))`, `expect(parsed.url).toBe(buildUrl(...))`.
- **Constant pin.** The assertion restates a hand-maintained constant, config default, table row, or prompt string: `expect(LIMITS.maxTools).toBe(8)`, `expect(PROMPT).toContain("You are")`.
- **Fixture asserts fixture.** The assertion reads data the test built or a value computed in `beforeEach`, and the subject never runs inside the body.

**The fix:** call the subject with a concrete input and assert the expected output or observable effect, `expect(slugify("Hello, World!")).toBe("hello-world")`. For an absence, pair the negative case with the condition that produces presence or a relevant faulty implementation that the assertion rejects. For a constant, test the mechanism that reads it instead of restating the value. For a mock, assert the payload or resulting state when that is the promised behavior. Rewrite or remove a test only when it cannot detect a relevant defect.

**Keep** a test of a relation across a table's rows (a key present in two tables, a parent that exists), and a compile-time check in a `*.test-d.ts` file.
