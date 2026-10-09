import { expect, it } from 'vitest'
import { makeFixture, read, runCli, write } from './ignite-fixture'

it('[AC-METHOD-004] reads all owner-required methods and writing methods without optional branches or partial success', () => {
  const fixture = makeFixture()
  try {
    write(
      fixture.root,
      'docs/plans/README.md',
      '# Plan\n\n## 固定维护方法\n\n涉及本类文档时，先读取以下必需方法：[plan-first](../../.ai/pstack/skills/plan-first/SKILL.md)、[plan-second](../../.ai/pstack/skills/plan-second/SKILL.md)。\n\n有竞争方向时才使用 [optional](../../.ai/pstack/skills/optional/SKILL.md)。\n',
    )
    write(
      fixture.root,
      'docs/standards/ai-agents.md',
      '# Rules\n\n## 固定维护方法\n\n涉及文档写作时，必须读取 [technical-writing](../../.ai/pstack/skills/technical-writing/SKILL.md) 与 [unslop](../../.ai/pstack/skills/unslop/SKILL.md)，保留原文档职责。\n',
    )
    for (const name of ['plan-first', 'plan-second', 'technical-writing', 'unslop'])
      write(fixture.root, `.ai/pstack/skills/${name}/SKILL.md`, `# ${name}\nFull ${name} body.\n`)

    const result = runCli(fixture.root, 'skill', 'read', '--for', 'docs/plans/README.md')
    expect(result.status, result.stderr).toBe(0)
    for (const name of ['plan-first', 'plan-second', 'technical-writing', 'unslop'])
      expect(result.stdout).toContain(`Full ${name} body.`)
    expect(result.stdout).not.toContain('optional/SKILL.md')
    expect(read(fixture.root, '.ai/pstack/skills/plan-first/SKILL.md')).toBe(
      '# plan-first\nFull plan-first body.\n',
    )

    write(
      fixture.root,
      'docs/plans/README.md',
      '# Plan\n\n## 固定维护方法\n\n涉及本类文档时，先读取以下必需方法：[plan-first](../../.ai/pstack/skills/plan-first/SKILL.md)、[missing](../../.ai/pstack/skills/missing/SKILL.md)。\n',
    )
    const missing = runCli(fixture.root, 'skill', 'read', '--for', 'docs/plans/README.md')
    expect(missing.status).not.toBe(0)
    expect(missing.stderr).toContain('missing')
    expect(missing.stdout).not.toContain('Full plan-first body.')
    const outside = runCli(fixture.root, 'skill', 'read', '--for', '../README.md')
    expect(outside.status).not.toBe(0)
    expect(outside.stderr).toContain('outside')
  } finally {
    fixture.cleanup()
  }
})
