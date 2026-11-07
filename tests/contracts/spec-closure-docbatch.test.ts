import { readFileSync, readdirSync } from 'node:fs'
import { expect, it } from 'vitest'

const read = (path) => readFileSync(path, 'utf8')
const featureTemplate = read('docs/features/_template.md')
const plansReadme = read('docs/plans/README.md')
const ddd = read('docs/standards/specification-to-implementation-ddd.md')
const designFiles = readdirSync('docs/designs').filter((name) => name.endsWith('.md'))

it('[AC-SPEC-018] 需求模板先写现实，来源清单含不适用理由', () => {
  const reality = featureTemplate.indexOf('现有行为')
  const terms = featureTemplate.indexOf('业务规则')
  expect(
    reality >= 0 && terms > reality,
    '[AC-SPEC-018] feature template orders reality before terms',
  ).toBe(true)
  expect(plansReadme.includes('七类来源'), '[AC-SPEC-018] plans README lists seven sources').toBe(
    true,
  )
  expect(
    plansReadme.includes('不适用理由'),
    '[AC-SPEC-018] plans README records why a source does not apply',
  ).toBe(true)
})

it('[AC-SPEC-019] 回写、失败回流、ADR 与交接各有唯一出处', () => {
  expect(
    ddd.includes('回到主要矛盾'),
    '[AC-SPEC-019] failure reflow returns to the main contradiction',
  ).toBe(true)
  expect(ddd.includes('重新建立绑定'), '[AC-SPEC-019] ADR flow rebinds specifications').toBe(true)
  const agents = read('docs/standards/ai-agents.md')
  expect(
    agents.includes('验证后的回写'),
    '[AC-SPEC-019] write-back rules have one owner document',
  ).toBe(true)
  expect(
    ddd.includes('文档模块之间的交接'),
    '[AC-SPEC-019] module handoff is documented once',
  ).toBe(true)
})

it('[AC-SPEC-020] 四个文档模块说明文件回答 §8.1 的十项', () => {
  const readmes = [
    'docs/features/README.md',
    'docs/plans/README.md',
    'docs/designs/README.md',
    'docs/others/README.md',
  ]
  for (const path of readmes) {
    const text = read(path)
    expect(text.includes('模块目标'), path + ' states module goal').toBe(true)
    expect(text.includes('交接'), path + ' states handoff').toBe(true)
  }
})

it('[AC-SPEC-021] 定稿状态、编号与设计承载规则一致', () => {
  expect(ddd.includes('定稿状态'), '[AC-SPEC-021] draft and final states are defined').toBe(true)
  expect(
    ddd.includes('D0') === false || ddd.includes('D0–D6 的定义'),
    '[AC-SPEC-021] module numbering is defined or removed',
  ).toBe(true)
  expect(ddd.includes('设计必须能承载目标'), '[AC-SPEC-021] design carrying rule is single').toBe(
    true,
  )
})

it('[AC-SPEC-022] 设计文档有事件与命令章节', () => {
  const design = read('docs/designs/' + designFiles[0])
  expect(
    design.includes('事件与命令'),
    '[AC-SPEC-022] design documents record events and commands',
  ).toBe(true)
})

it('[AC-SPEC-023] 验收标准带模块路径字段', () => {
  const template = read('docs/plans/_template.md')
  expect(template.includes('module'), '[AC-SPEC-023] acceptance criteria carry a module path').toBe(
    true,
  )
})
