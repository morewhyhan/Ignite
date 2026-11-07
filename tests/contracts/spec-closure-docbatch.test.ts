import { readFileSync, readdirSync } from 'node:fs'
import { expect, it } from 'vitest'

const read = (path: string) => readFileSync(path, 'utf8')
const featureTemplate = read('docs/features/_template.md')
const plansReadme = read('docs/plans/README.md')
const ddd = read('docs/standards/specification-to-implementation-ddd.md')

it('[AC-SPEC-018]', () => {
  expect(plansReadme.includes('七类来源'), '[AC-SPEC-018] target plans list seven sources').toBe(
    true,
  )
  expect(plansReadme.includes('不适用理由')).toBe(true)
  expect(featureTemplate.indexOf('现有行为')).toBeLessThan(featureTemplate.indexOf('业务规则'))
})

it('[AC-SPEC-019]', () => {
  expect(
    ddd.includes('回到主要矛盾'),
    '[AC-SPEC-019] target reflow returns to main contradiction',
  ).toBe(true)
  expect(ddd.includes('重新建立绑定')).toBe(true)
  expect(read('docs/standards/ai-agents.md').includes('验证后的回写')).toBe(true)
  expect(ddd.includes('文档模块之间的交接')).toBe(true)
})

it('[AC-SPEC-020]', () => {
  const readmes = [
    'docs/features/README.md',
    'docs/plans/README.md',
    'docs/designs/README.md',
    'docs/others/README.md',
  ]
  const missing = readmes.filter((path) => {
    const text = read(path)
    return !text.includes('模块目标') || !text.includes('交接')
  })
  expect(missing, '[AC-SPEC-020] target four module readmes answer the ten questions').toEqual([])
})

it('[AC-SPEC-021]', () => {
  expect(ddd.includes('定稿状态'), '[AC-SPEC-021] target draft and final states defined').toBe(true)
  expect(ddd.includes('设计必须能承载目标')).toBe(true)
  expect(ddd.includes('D0–D6 已定义') || !ddd.includes('D0')).toBe(true)
})

it('[AC-SPEC-022]', () => {
  const designFiles = readdirSync('docs/designs').filter((name) => name.endsWith('.md'))
  const missing = designFiles.filter((name) => !read('docs/designs/' + name).includes('事件与命令'))
  expect(missing, '[AC-SPEC-022] target designs record events and commands').toEqual([])
})

it('[AC-SPEC-023]', () => {
  expect(
    read('docs/plans/_template.md').includes('module'),
    '[AC-SPEC-023] target acceptance carries module path',
  ).toBe(true)
})
it('[AC-SPEC-024]', () => {
  const source = read('scripts/ignite/state.mjs')
  expect(
    source.includes('allowsDocOnlyReleaseEvidence'),
    '[AC-SPEC-024] target releases accept doc evidence',
  ).toBe(true)
})
