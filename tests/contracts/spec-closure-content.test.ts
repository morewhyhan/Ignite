import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'
import { contentGaps } from '../../scripts/ignite/content-contract.mjs'
import { validatePlan } from '../../scripts/ignite/state.mjs'

const read = (path: string) => readFileSync(join(repositoryRoot, path), 'utf8')

describe('plan content contract', () => {
  it('[AC-SPEC-008] the plan template carries substantive analysis sections', () => {
    const gaps = contentGaps(read('docs/plans/_template.md'))
    expect(gaps, '[AC-SPEC-008] target template analysis gaps').toEqual([])
  })

  it('[AC-SPEC-008] empty or boilerplate sections are rejected', () => {
    const empty = '# p\n\n## 主要矛盾\n\n## 次要矛盾\n\n## 决策原则\n\n## 方案比较\n\n## 约束绑定矩阵\n\n## 回退\n'
    expect(contentGaps(empty).length, '[AC-SPEC-008] target empty sections').toBeGreaterThan(0)
    expect(contentGaps('# p\n\n## 主要矛盾\n\n按 推进规则 说明以下判断\n').join(' '), '[AC-SPEC-008] target boilerplate').toContain('boilerplate')
    const headerOnly = '# p\n\n## 约束绑定矩阵\n\n| Source | Task |\n| --- | --- |\n'
    expect(contentGaps(headerOnly).join(' '), '[AC-SPEC-008] target empty table').toContain('约束绑定矩阵')
  })
  it('[AC-SPEC-008] plan validation rejects a gutted analysis section', () => {
    const path = 'docs/plans/20261106-spec-closure-content.md'
    const content = read(path)
    const meta = JSON.parse(content.match(/<!-- ignite-plan\n([\s\S]*?)\n-->/)![1])
    const plan = { path: join(repositoryRoot, path), relativePath: path, content, metadata: meta }
    expect(contentGaps(content), '[AC-SPEC-008] target plan sections').toEqual([])
    const intact = validatePlan(plan as never, { allowLegacy: false }).filter((error) => error.includes('主要矛盾'))
    expect(intact, '[AC-SPEC-008] target intact plan').toEqual([])
    const broken = { ...plan, content: content.replace(/## 主要矛盾[\s\S]*?(?=\n## )/, '## 主要矛盾\n\n') }
    const failures = validatePlan(broken as never, { allowLegacy: false })
    expect(failures.some((error) => error.includes('主要矛盾')), '[AC-SPEC-008] target gutted section').toBe(true)
  })
})