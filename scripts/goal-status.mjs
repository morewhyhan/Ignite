import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const goalPath = join(root, 'GOAL.md')
const args = process.argv.slice(2)
const evidenceAt = args.indexOf('--evidence')

if (evidenceAt >= 0) {
  const id = args[evidenceAt + 1]
  const path = args[evidenceAt + 2]
  if (!id || !path) { console.error('usage: goal:status --evidence <AC-ID> <path>'); process.exit(1) }
  const fileLines = readFileSync(goalPath, 'utf8').split(/\r?\n/)
  const at = fileLines.findIndex((line) => line.startsWith('- ' + id + '（'))
  if (at < 0) { console.error('unknown AC ' + id); process.exit(1) }
  const detail = at + 1
  if (!/说明：/.test(fileLines[detail] || '')) { console.error('AC has no 说明 line'); process.exit(1) }
  if (!/证据：/.test(fileLines[detail])) fileLines[detail] += ' ｜ 证据：[查看](' + path + ')'
  writeFileSync(goalPath, fileLines.join('\n'))
  console.log('evidence recorded for ' + id + ': ' + path)
  process.exit(0)
}

const run = args.includes('--run')
const text = readFileSync(goalPath, 'utf8')
const lines = text.split(/\r?\n/)
const rows = []
for (let i = 0; i < lines.length; i += 1) {
  const match = /^- (AC-[A-Z]+-\d+)（(.*?)）：(.*)$/.exec(lines[i])
  if (!match) continue
  const id = match[1]
  const detail = lines[i + 1] || ''
  const link = /\((tests\/[^)]+)\)/.exec(detail)
  const note = /说明：([^｜]*)/.exec(detail)
  let state = '缺测试'
  let file = '-'
  if (link) {
    file = link[1]
    const target = join(root, file)
    if (existsSync(target) && readFileSync(target, 'utf8').includes('[' + id + ']')) state = '有测试'
    else if (existsSync(target)) state = '测试缺编号'
  }
  rows.push({ id, requirement: match[2], file, state, note: note ? note[1].trim() : '未写说明' })
}
let verifiedAt = ''
if (run) {
  const files = [...new Set(rows.map((row) => row.file).filter((file) => file !== '-'))]
  if (files.length > 0) {
    const result = spawnSync('pnpm', ['exec', 'vitest', 'run', ...files], { cwd: root, encoding: 'utf8' })
    const passed = result.status === 0
    verifiedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
    for (const row of rows) if (row.state === '有测试') row.state = passed ? '已验证' : '失败'
  }
}
const counts = rows.reduce((acc, row) => { acc[row.state] = (acc[row.state] || 0) + 1; return acc }, {})
const summary = Object.entries(counts).map(([key, value]) => key + ' ' + value).join('，')
const block = [
  '<!-- goal-status -->',
  '（本块由 pnpm goal:status 生成，勿手改；--run 真的跑测试，--evidence 登记证据）',
  '',
  '| AC | 需求 | 测试 | 状态 | 验证说明 |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map((row) => '| ' + row.id + ' | ' + row.requirement + ' | ' + row.file + ' | ' + row.state + ' | ' + row.note + ' |'),
  '',
  '合计 ' + rows.length + ' 条：' + summary + (verifiedAt ? '（验证于 ' + verifiedAt + '）' : ''),
  '<!-- /goal-status -->',
].join('\n')
writeFileSync(goalPath, text.replace(/<!-- goal-status -->[\s\S]*?<!-- \/goal-status -->/, block))
console.log('goal status: ' + rows.length + ' ACs, ' + summary)