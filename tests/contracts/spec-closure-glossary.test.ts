import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const glossary = readFileSync('docs/others/glossary.md', 'utf8')
const p0 = readFileSync('docs/others/spec-closure/p0-conclusions.md', 'utf8')

it('[AC-SPEC-014]', () => {
  const pairs = ['原始目标', '矛盾', '绑定']
  const missing = pairs.filter((word) => !glossary.includes(word))
  expect(
    glossary.includes('evidence binding') && missing.length === 0,
    '[AC-SPEC-014] target glossary lists the three term pairs',
  ).toBe(true)
})

it('[AC-SPEC-015]', () => {
  const sections = ['### Plan 状态', '### 证据状态', '### Release 状态']
  const missing = sections.filter((heading) => !glossary.includes(heading))
  const states = glossary.includes('不能互相冒充')
  expect(
    missing.length === 0 && states,
    '[AC-SPEC-015] target three state tables and no-impersonation rule',
  ).toBe(true)
})

it('[AC-SPEC-016]', () => {
  const needs = ['文档定稿状态机', '领域事件', '触发条件', '非目标']
  const missing = needs.filter((word) => !glossary.includes(word))
  expect(missing.length === 0, '[AC-SPEC-016] target both deferred items have a disposition').toBe(
    true,
  )
})
