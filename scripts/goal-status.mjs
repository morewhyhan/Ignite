import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const goalPath = join(root, 'docs/GOAL.md')
const source = readFileSync(goalPath, 'utf8')
const lines = source.split(/\r?\n/)

const args = process.argv.slice(2)
const evidenceAt = args.indexOf('--evidence')
const run = args.includes('--run')

const entries = []
let current = null
for (let i = 0; i < lines.length; i += 1) {
  const match = /^\s*- (AC-[A-Z]+-\d+)（([^）]*)）：(.*)$/.exec(lines[i])
  if (match) {
    current = { id: match[1], reqs: match[2], lineIndex: i, detailIndex: i + 1, file: '', evidence: null, state: '有测试' }
    entries.push(current)
    continue
  }
  if (current && /^\s*- \*\*测试用例\*\*：/.test(lines[i]) && i === current.lineIndex + 1) {
    const body = lines[i]
    const verify = /\(([^)]*tests\/[^)]+)\)/.exec(body)
    if (verify) current.file = verify[1]
    const evidence = /(?:证据：\[查看\]|\[证据\]|\[查看\])\(([^)]+)\)/.exec(body)
    if (evidence) current.evidence = evidence[1]
    current.note = /说明：([^｜]+)/.exec(body)?.[1]?.trim() ?? ''
  }
}

if (evidenceAt >= 0) {
  const id = args[evidenceAt + 1]
  const path = args[evidenceAt + 2]
  const target = entries.find((entry) => entry.id === id)
  if (!id || !path || !target) {
    console.error('usage: pnpm goal:status --evidence <AC-ID> <path>')
    process.exit(1)
  }
  const line = lines[target.detailIndex]
  lines[target.detailIndex] = /证据：\[查看\]\([^)]+\)/.test(line)
    ? line.replace(/证据：\[查看\]\([^)]+\)/, '证据：[查看](' + path + ')')
    : line + ' ｜ 证据：[查看](' + path + ')'
  writeFileSync(goalPath, lines.join('\n'))
  console.log('evidence 已登记：' + id)
  process.exit(0)
}

let verifiedAt = null
if (run) {
  const dir = join(root, 'docs/others/evidence/goal-runs')
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ').replace(/[: ]/g, '-')
  const logPath = join(dir, stamp + '.txt')
  const result = spawnSync('pnpm', ['exec', 'vitest', 'run'], { cwd: root, encoding: 'utf8' })
  const passed = result.status === 0
  writeFileSync(logPath, 'result: ' + (passed ? 'passed' : 'failed') + '\\n\\n' + (result.stdout ?? '') + (result.stderr ?? ''))
  verifiedAt = stamp
}

const counts = {}
for (const entry of entries) {
  const browser = /tests\/e2e\//.test(entry.file)
  const image = entry.evidence ? /\.(png|jpg|jpeg)$/i.test(entry.evidence) : false
  if (!entry.file) entry.state = '缺测试'
  else if (!entry.evidence) entry.state = browser ? '缺截图' : '缺证据'
  else if (browser) entry.state = image ? '已验证' : '缺截图'
  else {
    const target = resolve(root, 'docs', entry.evidence)
    if (!existsSync(target)) entry.state = '缺证据'
    else {
      const body = readFileSync(target, 'utf8')
      entry.state = /result: passed/.test(body) ? '已验证' : /result: failed/.test(body) ? '失败' : '有测试'
    }
  }
  counts[entry.state] = (counts[entry.state] ?? 0) + 1
}

for (const entry of entries) {
  const line = lines[entry.detailIndex]
  if (!line || !line.includes('状态：')) continue
  lines[entry.detailIndex] = line.replace(/状态：[^｜]*/, '状态：' + entry.state)
}

const summary = '合计 ' + entries.length + ' 条：' + Object.entries(counts).map(([key, value]) => key + ' ' + value).join('，') + (verifiedAt ? '（验证于 ' + verifiedAt + '）' : '')
const joined = lines.join('\n')
const summaryBlock = '<!-- goal-summary -->\n' + summary + '\n<!-- /goal-summary -->'
const next = /<!-- goal-summary -->[\s\S]*?<!-- \/goal-summary -->/.test(joined)
  ? joined.replace(/<!-- goal-summary -->[\s\S]*?<!-- \/goal-summary -->/, summaryBlock)
  : joined.includes('## 四、文字金字塔')
    ? joined.replace('## 四、文字金字塔', '## 四、文字金字塔\n\n' + summaryBlock)
    : joined.replace(/^- \*\*目标\*\*/m, summaryBlock + '\n\n- **目标**')
writeFileSync(goalPath, next)
console.log('goal status: ' + entries.length + ' ACs, ' + Object.entries(counts).map(([key, value]) => key + ' ' + value).join('，'))