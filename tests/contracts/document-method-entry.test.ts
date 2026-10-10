import { expect, it } from 'vitest'
import { makeFixture, read, runCli, write } from './ignite-fixture'

it('[AC-METHOD-014] provides a safe tool output budget for every canonical body and the index itself', () => {
  const fixture = makeFixture()
  try {
    write(
      fixture.root,
      'docs/plans/README.md',
      '# Plan\n\n## 固定维护方法\n\n涉及本类文档时，先读取以下必需方法：[large-method](../../.ai/pstack/skills/large-method/SKILL.md)。\n',
    )
    write(
      fixture.root,
      'docs/standards/ai-agents.md',
      '# Rules\n\n## 固定维护方法\n\n涉及文档写作时，必须读取 [unslop](../../.ai/pstack/skills/unslop/SKILL.md)。\n',
    )
    const content = '# Large\n' + '完整正文 must not be cut.\n'.repeat(400)
    write(fixture.root, '.ai/pstack/skills/large-method/SKILL.md', content)
    write(fixture.root, '.ai/pstack/skills/unslop/SKILL.md', '# Unslop\nRead me.\n')
    const result = runCli(fixture.root, 'skill', 'read', '--for', 'docs/plans/README.md', '--list')
    expect(result.status, result.stderr).toBe(0)
    const index = JSON.parse(result.stdout)
    expect(index.required[0].tool_options?.max_output_tokens ?? 0).toBeGreaterThan(
      Buffer.byteLength(content, 'utf8'),
    )
    expect(index.tool_options?.max_output_tokens ?? 0).toBeGreaterThan(
      Buffer.byteLength(result.stdout, 'utf8'),
    )
    expect(index.required[1].tool_options?.max_output_tokens ?? 0).toBeGreaterThanOrEqual(4096)
    expect(index.required[0].read_command).toBe('node scripts/ignite.mjs skill read large-method')
    expect(result.stdout).not.toContain('完整正文 must not be cut.')
  } finally {
    fixture.cleanup()
  }
})

it('[AC-METHOD-013] lists large required resources without expanding them and reads each canonical body separately', () => {
  const fixture = makeFixture()
  try {
    write(
      fixture.root,
      'docs/plans/README.md',
      '# Plan\n\n## 固定维护方法\n\nKeep the original goal before implementation.\n\n涉及本类文档时，先读取以下必需方法：[plan-method](../../.ai/pstack/skills/plan-method/SKILL.md)。\n',
    )
    write(
      fixture.root,
      'docs/standards/ai-agents.md',
      '# Rules\n\n## 固定维护方法\n\n涉及文档写作时，必须读取 [technical-writing](../../.ai/pstack/skills/technical-writing/SKILL.md) 与 [unslop](../../.ai/pstack/skills/unslop/SKILL.md)。\n',
    )
    const names = ['plan-method', 'technical-writing', 'unslop']
    for (const name of names)
      write(
        fixture.root,
        `.ai/pstack/skills/${name}/SKILL.md`,
        `# ${name}\n${'A complete method paragraph.\n'.repeat(800)}`,
      )
    const result = runCli(fixture.root, 'skill', 'read', '--for', 'docs/plans/README.md', '--list')
    expect(result.status, result.stderr).toBe(0)
    const index = JSON.parse(result.stdout)
    expect(index.instructions).toContain('Keep the original goal before implementation.')
    expect(index.required.map((item: { name: string }) => item.name)).toEqual(names)
    expect(result.stdout.length).toBeLessThan(4000)
    for (const name of names) {
      const body = runCli(fixture.root, 'skill', 'read', name)
      expect(body.status, body.stderr).toBe(0)
      expect(body.stdout).toBe(read(fixture.root, `.ai/pstack/skills/${name}/SKILL.md`))
    }
    write(
      fixture.root,
      'docs/plans/README.md',
      read(fixture.root, 'docs/plans/README.md').replace('skills/plan-method/', 'skills/missing/'),
    )
    const missing = runCli(fixture.root, 'skill', 'read', '--for', 'docs/plans/README.md', '--list')
    expect(missing.status).not.toBe(0)
    expect(missing.stdout).toBe('')
  } finally {
    fixture.cleanup()
  }
})

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
