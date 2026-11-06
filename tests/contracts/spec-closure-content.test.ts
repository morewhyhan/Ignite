import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'
import { contentGaps } from '../../scripts/ignite/content-contract.mjs'
import { validatePlan } from '../../scripts/ignite/state.mjs'

const read = (path: string) => readFileSync(join(repositoryRoot, path), 'utf8')
const PLAN_PATH = 'docs/plans/20261106-spec-closure-content.md'

describe('plan content contract', () => {
  it('[AC-SPEC-008] declared content contracts are enforced on template and plans', () => {
    const gaps: string[] = []
    gaps.push(...contentGaps(read('docs/plans/_template.md')).map((gap) => 'template ' + gap))

    const empty =
      '# p\n\n## 主要矛盾\n\n## 次要矛盾\n\n## 决策原则\n\n## 方案比较\n\n## 约束绑定矩阵\n\n## 回退\n'
    if (!contentGaps(empty).length) gaps.push('empty sections accepted')
    if (
      !contentGaps('# p\n\n## 主要矛盾\n\n按 推进规则 说明以下判断\n')
        .join(' ')
        .includes('boilerplate')
    )
      gaps.push('boilerplate accepted')
    if (!contentGaps('# p\n\n## 主要矛盾\n\nTODO\n').join(' ').includes('boilerplate'))
      gaps.push('TODO accepted')
    if (!contentGaps('# p\n\n## 主要矛盾\n\n待确认\n').join(' ').includes('boilerplate'))
      gaps.push('待确认 accepted')
    if (!contentGaps('# p\n\n## 主要矛盾\n\n  待填写  \n').join(' ').includes('boilerplate'))
      gaps.push('spaced placeholder accepted')
    if (
      !contentGaps('# p\n\n## 约束绑定矩阵\n\n| Source | Task |\n| --- | --- |\n| TODO | 待确认 |\n')
        .join(' ')
        .includes('boilerplate')
    )
      gaps.push('table placeholder accepted')
    if (
      !contentGaps('# p\n\n## 约束绑定矩阵\n\n| Source | Task |\n| --- | --- |\n')
        .join(' ')
        .includes('约束绑定矩阵')
    )
      gaps.push('header-only table accepted')

    const content = read(PLAN_PATH)
    gaps.push(...contentGaps(content).map((gap) => 'plan ' + gap))
    const meta = JSON.parse(content.match(/<!-- ignite-plan\n([\s\S]*?)\n-->/)![1])
    const plan = {
      path: join(repositoryRoot, PLAN_PATH),
      relativePath: PLAN_PATH,
      content,
      metadata: meta,
    }
    const gutted = {
      ...plan,
      content: content.replace(/## 主要矛盾[\s\S]*?(?=\n## )/, '## 主要矛盾\n\n'),
    }
    if (
      !validatePlan(gutted as never, { allowLegacy: false }).some((error) =>
        error.includes('主要矛盾'),
      )
    )
      gaps.push('validatePlan ignores gutted section')

    expect(gaps, '[AC-SPEC-008] target content contract gaps').toEqual([])
  })
})
