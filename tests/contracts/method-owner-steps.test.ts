import { expect, it } from 'vitest'
import { makeFixture, runCli, write } from './ignite-fixture'

it('[AC-METHOD-006] includes the owning fixed steps with required skill bodies without loading conditional methods', () => {
  const fixture = makeFixture()
  try {
    write(
      fixture.root,
      'docs/plans/README.md',
      '# Plan\n\n## 固定维护方法\n\n涉及本类文档时，先读取以下必需方法：[plan-method](../../.ai/pstack/skills/plan-method/SKILL.md)。\n\n1. Write the Plan and its Release scope together.\n2. Preserve the original requirements before implementation.\n\n有竞争方向时才使用 [optional](../../.ai/pstack/skills/optional/SKILL.md)。\n',
    )
    write(
      fixture.root,
      'docs/standards/ai-agents.md',
      '# Rules\n\n## 固定维护方法\n\n涉及文档写作时，必须读取 [technical-writing](../../.ai/pstack/skills/technical-writing/SKILL.md) 与 [unslop](../../.ai/pstack/skills/unslop/SKILL.md)，保留原职责。\n',
    )
    for (const name of ['plan-method', 'technical-writing', 'unslop', 'optional'])
      write(
        fixture.root,
        `.ai/pstack/skills/${name}/SKILL.md`,
        `# ${name}\nComplete ${name} body.\n`,
      )
    const result = runCli(fixture.root, 'skill', 'read', '--for', 'docs/plans/README.md')
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('1. Write the Plan and its Release scope together.')
    expect(result.stdout).toContain('2. Preserve the original requirements before implementation.')
    for (const name of ['plan-method', 'technical-writing', 'unslop'])
      expect(result.stdout).toContain(`Complete ${name} body.`)
    expect(result.stdout).not.toContain('Complete optional body.')
  } finally {
    fixture.cleanup()
  }
})
