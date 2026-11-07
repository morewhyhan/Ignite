#!/usr/bin/env node
// 补齐新建计划缺的语义字段：REQ、AC 映射、release scope。
// 写入范围不自动改：纯文档计划要求全部路径在 docs/ 下，自动加测试路径会破坏该判定。
// 用法：node scripts/fill-plan.mjs --plan docs/plans/<file>.md --req REQ-X --ac AC-Y [--test tests/contracts/x.test.ts]
import { readFileSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const value = (flag) => {
  const index = args.indexOf(flag)
  return index >= 0 ? String(args[index + 1] || '').trim() : ''
}
const planPath = value('--plan')
if (!planPath) {
  console.error('Usage: node scripts/fill-plan.mjs --plan <plan.md> --req REQ-X --ac AC-Y')
  process.exit(2)
}
const slug = planPath
  .split('/')
  .pop()
  .replace(/^\d{8}-/, '')
  .replace(/\.md$/, '')
const split = (raw) =>
  raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
const requirements = split(value('--req'))
const acceptance = split(value('--ac'))
const testPath = value('--test') || 'tests/contracts/' + slug + '.test.ts'

const raw = readFileSync(planPath, 'utf8')
const end = raw.indexOf('-->')
const meta = JSON.parse(raw.slice(raw.indexOf('{'), end))

if (requirements.length) meta.requirements = requirements
const existing = new Map((meta.acceptance || []).map((item) => [item.id, item]))
if (acceptance.length) {
  meta.acceptance = acceptance.map(
    (id) =>
      existing.get(id) || {
        id,
        title: id,
        required_layers: ['unit'],
        tests: [testPath + '::[' + id + ']'],
        checks: [{ test: testPath + '::[' + id + ']', layer: 'unit' }],
      },
  )
}
meta.open_questions = []
for (const task of meta.tasks || []) {
  if (acceptance.length && (task.phase === 'red' || task.phase === 'implement')) {
    task.acceptance = acceptance
  }
}
writeFileSync(
  planPath,
  '<!-- ignite-plan\n' + JSON.stringify(meta, null, 2) + '\n-->' + raw.slice(end + 3),
)

const releasePath = 'docs/plans/releases/' + meta.release + '.json'
const release = JSON.parse(readFileSync(releasePath, 'utf8'))
for (const goal of release.scope || []) {
  if (requirements.length) goal.requirements = requirements
  if (acceptance.length) goal.acceptance = acceptance
}
writeFileSync(releasePath, JSON.stringify(release, null, 2) + '\n')
console.log('filled ' + requirements.length + ' REQ, ' + acceptance.length + ' AC -> ' + planPath)
console.log('还需手工确认 write_scope：纯文档计划必须全部在 docs/ 下')
