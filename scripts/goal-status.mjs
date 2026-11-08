import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const run = process.argv.includes('--run')
const goalPath = join(root, 'GOAL.md')
const text = readFileSync(goalPath, 'utf8')
const lines = text.split(/\r?\n/)
const rows = []
for (let i = 0; i < lines.length; i += 1) {
  const match = /^- (AC-[A-Z]+-\d+)（(.*?)）：(.*)$/.exec(lines[i])
  if (!match) continue
  const id = match[1]
  const detail = lines[i + 1] || ''
  const link = /\((tests\/[^)]+)\)/.exec(detail)
  let state = '缺测试'
  let file = '-'
  if (link) {
    file = link[1]
    const path = join(root, file)
    if (existsSync(path) && readFileSync(path, 'utf8').includes('[' + id + ']')) state = '有测试'
    else if (existsSync(path)) state = '测试缺编号'
  }
  rows.push({ id, requirement: match[2], file, state })
}
let verifiedAt = ''
if (run) {
  const files = [...new Set(rows.map((row) => row.file).filter((file) => file !== '-'))]
  if (files.length > 0) {
    const result = spawnSync('pnpm', ['exec', 'vitest', 'run', ...files], { cwd: root, encoding: 'utf8' })
    const passed = result.status === 0
    verifiedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
    for (const row of rows) {
      if (row.state === '有测试') row.state = passed ? '已验证' : '失败'
    }
  }
}
const counts = rows.reduce((acc, row) => { acc[row.state] = (acc[row.state] || 0) + 1; return acc }, {})
const summary = Object.entries(counts).map(([key, value]) => key + ' ' + value).join('，')
const block = [
  '<!-- goal-status -->',
  '（本块由 pnpm goal:status 生成，勿手改；加 --run 会真的跑测试并标记已验证）',
  '',
  '| AC | 需求 | 测试 | 状态 |',
  '| --- | --- | --- | --- |',
  ...rows.map((row) => '| ' + row.id + ' | ' + row.requirement + ' | ' + row.file + ' | ' + row.state + ' |'),
  '',
  '合计 ' + rows.length + ' 条：' + summary + (verifiedAt ? '（验证于 ' + verifiedAt + '）' : ''),
  '<!-- /goal-status -->',
].join('\n')
const next = text.replace(/<!-- goal-status -->[\s\S]*?<!-- \/goal-status -->/, block)
writeFileSync(goalPath, next)
console.log('goal status: ' + rows.length + ' ACs, ' + summary)