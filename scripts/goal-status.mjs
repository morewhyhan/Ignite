import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const goalPath = join(root, 'docs/GOAL.md')
const args = process.argv.slice(2)
const evidenceAt = args.indexOf('--evidence')

if (evidenceAt >= 0) {
  const id = args[evidenceAt + 1]
  const target = args[evidenceAt + 2]
  if (!id || !target) {
    console.error('usage: goal:status --evidence <AC-ID> <path>')
    process.exit(1)
  }
  const fileLines = readFileSync(goalPath, 'utf8').split(/\r?\n/)
  const at = fileLines.findIndex((line) => line.startsWith('- ' + id + '（'))
  if (at < 0) {
    console.error('unknown AC ' + id)
    process.exit(1)
  }
  const detail = at + 1
  if (!/说明：/.test(fileLines[detail] || '')) {
    console.error('AC has no 说明 line')
    process.exit(1)
  }
  if (!/证据：/.test(fileLines[detail])) fileLines[detail] += ' ｜ 证据：[查看](' + target + ')'
  writeFileSync(goalPath, fileLines.join('\n'))
  console.log('evidence recorded for ' + id + ': ' + target)
  process.exit(0)
}

const run = args.includes('--run')
const text = readFileSync(goalPath, 'utf8')
const lines = text.split(/\r?\n/)
const entries = []
for (let i = 0; i < lines.length; i += 1) {
  const match = /^- (AC-[A-Z]+-\d+)（(.*?)）：(.*)$/.exec(lines[i])
  if (!match) continue
  const detail = lines[i + 1] || ''
  const link = /\(([^)]*tests\/[^)]+)\)/.exec(detail)
  const note = /说明：([^｜]*)/.exec(detail)
  const evidence = /证据：\[查看\]\(([^)]+)\)/.exec(detail)
  let state = '缺测试'
  let file = '-'
  if (link) {
    file = link[1]
    const target = resolve(root, 'docs', file)
    if (existsSync(target) && readFileSync(target, 'utf8').includes('[' + match[1] + ']'))
      state = '有测试'
    else if (existsSync(target)) state = '测试缺编号'
  }
  entries.push({
    id: match[1],
    requirement: match[2],
    file,
    state,
    note: note ? note[1].trim() : '未写说明',
    detailIndex: i + 1,
    evidence: evidence ? evidence[1] : null,
  })
}

let verifiedAt = ''
if (run) {
  const files = [...new Set(entries.map((row) => row.file).filter((file) => file !== '-'))]
  if (files.length > 0) {
    const result = spawnSync('pnpm', ['exec', 'vitest', 'run', ...files], {
      cwd: root,
      encoding: 'utf8',
    })
    const passed = result.status === 0
    verifiedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const head = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).stdout.trim()
    const dir = join(root, 'docs', 'others', 'evidence', 'goal-runs')
    mkdirSync(dir, { recursive: true })
    const logName = verifiedAt.replace(/[: ]/g, '-') + '.txt'
    writeFileSync(
      join(dir, logName),
      'commit: ' +
        head +
        '\ncommand: pnpm exec vitest run ' +
        files.join(' ') +
        '\nresult: ' +
        (passed ? 'passed' : 'failed') +
        '\n\n' +
        (result.stdout || '').slice(-4000),
    )
    for (const row of entries) {
      if (row.state !== '有测试') continue
      row.state = passed ? '已验证' : '失败'
      if (passed && !row.evidence) {
        lines[row.detailIndex] += ' ｜ 证据：[查看](docs/others/evidence/goal-runs/' + logName + ')'
        row.evidence = 'docs/others/evidence/goal-runs/' + logName
      }
    }
  }
}

for (const row of entries) {
  if (!['有测试', '已验证', '失败'].includes(row.state)) continue
  const browser = /(^|\/)tests\/e2e\//.test(row.file)
  if (!row.evidence) {
    row.state = '缺证据'
    continue
  }
  const image = /\.(png|jpg|jpeg)$/i.test(row.evidence)
  if (browser && !image) {
    row.state = '缺截图'
    continue
  }
  if (browser && image) {
    row.state = '已验证'
    continue
  }
  const evidencePath = resolve(root, 'docs', row.evidence)
  if (row.state !== '失败' && existsSync(evidencePath)) {
    const log = readFileSync(evidencePath, 'utf8')
    if (/result: passed/.test(log)) row.state = '已验证'
    if (/result: failed/.test(log)) row.state = '失败'
  }
}

const counts = entries.reduce((acc, row) => {
  acc[row.state] = (acc[row.state] || 0) + 1
  return acc
}, {})
const summary = Object.entries(counts)
  .map(([key, value]) => key + ' ' + value)
  .join('，')
const block = [
  '<!-- goal-status -->',
  '（本块由 pnpm goal:status 生成，勿手改；--run 跑测试并写运行证据，--evidence 登记截图）',
  '',
  '| AC | 需求 | 测试 | 状态 | 验证说明 |',
  '| --- | --- | --- | --- | --- |',
  ...entries.map(
    (row) =>
      '| ' +
      row.id +
      ' | ' +
      row.requirement +
      ' | ' +
      row.file +
      ' | ' +
      row.state +
      ' | ' +
      row.note +
      ' |',
  ),
  '',
  '合计 ' +
    entries.length +
    ' 条：' +
    summary +
    (verifiedAt ? '（验证于 ' + verifiedAt + '）' : ''),
  '<!-- /goal-status -->',
].join('\n')
writeFileSync(
  goalPath,
  lines.join('\n').replace(/<!-- goal-status -->[\s\S]*?<!-- \/goal-status -->/, block),
)
console.log('goal status: ' + entries.length + ' ACs, ' + summary)
