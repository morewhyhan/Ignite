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
    '[AC-SPEC-018] target template orders reality before terms',
  ).toBe(true)
  expect(plansReadme.includes('七类来源'), '[AC-SPEC-018] target plans list seven sources').toBe(
    true,
  )
  expect(
    plansReadme.includes('不适用理由'),
    '[AC-SPEC-018] target plans record why a source does not apply',
  ).toBe(true)
})

it('[AC-SPEC-019] 回写、失败回流、ADR 与交接各有唯一出处', () => {
  expect(
    ddd.includes('回到主要矛盾'),
    '[AC-SPEC-019] target reflow returns to main contradiction',
  ).toBe(true)
  expect(ddd.includes('重新建立绑定'), '[AC-SPEC-019] target ADR rebinds specs').toBe(true)
  const agents = read('docs/standards/ai-agents.md')
  expect(agents.includes('验证后的回写'), '[AC-SPEC-019] target write-back has one owner').toBe(
    true,
  )
  expect(ddd.includes('文档模块之间的交接'), '[AC-SPEC-019] target handoff documented once').toBe(
    true,
  )
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
    expect(text.includes('模块目标'), '[AC-SPEC-020] target ' + path + ' states module goal').toBe(
      true,
    )
    expect(text.includes('交接'), '[AC-SPEC-020] target ' + path + ' states handoff').toBe(true)
  }
})

it('[AC-SPEC-021] 定稿状态、编号与设计承载规则一致', () => {
  expect(ddd.includes('定稿状态'), '[AC-SPEC-021] target draft and final states defined').toBe(
    true,
  )
  expect(
    ddd.includes('设计必须能承载目标'),
    '[AC-SPEC-021] target single design carrying rule',
  ).toBe(true)
  expect(
    ddd.includes('D0–D6 已定义') || !ddd.includes('D0'),
    '[AC-SPEC-021] target numbering defined or removed',
  ).toBe(true)
})

it('[AC-SPEC-022] 设计文档有事件与命令章节', () => {
  const design = read('docs/designs/' + designFiles[0])
  expect(
    design.includes('事件与命令'),
    '[AC-SPEC-022] target design records events and commands',
  ).toBe(true)
})

it('[AC-SPEC-023] 验收标准带模块路径字段', () => {
  const template = read('docs/plans/_template.md')
  expect(template.includes('module'), '[AC-SPEC-023] target acceptance carries module path').toBe(
    true,
  )
})
