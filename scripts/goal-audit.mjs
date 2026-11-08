import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const lines = readFileSync(join(root, 'docs/GOAL.md'), 'utf8').split(/\r?\n/)
const problems = []
const indentOf = (line) => line.length - line.trimStart().length

const goalLine = lines.find((line) => line.trimStart().startsWith('- **目标**'))
if (!goalLine) problems.push('A1 目标缺失')
else if (/页面|接口|数据库|算法|框架/.test(goalLine)) problems.push('A1 目标里出现方案词')

const domains = []
let domain = null
let req = null
for (const line of lines) {
  const text = line.trim()
  const indent = indentOf(line)
  if (indent === 2 && /^- \*\*.+\*\*$/.test(text)) {
    domain = { name: /^- \*\*(.+)\*\*$/.exec(text)[1], reqs: [], acs: [] }
    domains.push(domain)
    req = null
    continue
  }
  const reqMatch = /^- \*\*(REQ-[A-Z]+-\d+)[^*]*\*\*$/.exec(text)
  if (reqMatch && domain && indent >= 4) {
    req = { id: reqMatch[1], acs: [] }
    domain.reqs.push(req)
    continue
  }
  const acMatch = /^- (AC-[A-Z]+-\d+)（([^）]*)）：(.*)$/.exec(text)
  if (acMatch && domain) {
    const entry = { id: acMatch[1], reqs: acMatch[2], text: acMatch[3] }
    domain.acs.push(entry)
    if (req) req.acs.push(entry)
    continue
  }
}

if (domains.length === 0) problems.push('A2 没有领域')
let reqCount = 0
let acCount = 0
for (const domain of domains) {
  if (domain.name.includes('非领域')) continue
  if (domain.reqs.length === 0) problems.push('A7 领域“' + domain.name + '”没有 REQ')
  for (const item of domain.reqs) {
    reqCount += 1
    if (item.acs.length === 0) problems.push('A3 ' + item.id + ' 没有 AC')
    acCount += item.acs.length
  }
  const edges = domain.acs.filter((ac) => /未|失败|拒绝|为空|并发|重复|超过|越权|不合法/.test(ac.text))
  if (edges.length === 0) problems.push('A5 领域“' + domain.name + '”没有异常或边界场景')
  for (const ac of domain.acs) {
    if (/返回 *`?(200|401|404|422)|状态码|字段|表结构/.test(ac.text))
      problems.push('A4 ' + ac.id + ' 验收的是实现细节')
  }
}

const termRows = lines.filter((line) => /^\| TERM-/.test(line.trim()))
if (termRows.length < 2) problems.push('A6 术语表不足 2 条')

const recordAt = process.argv.indexOf('--record')
if (recordAt >= 0) {
  const verdict = process.argv[recordAt + 1]
  if (!verdict) { console.error('usage: pnpm goal:audit --record "<结论>"'); process.exit(1) }
  if (problems.length > 0) { console.error('结构审计未通过，不能记录'); process.exit(1) }
  const { createHash } = await import('node:crypto')
  const { mkdirSync, writeFileSync } = await import('node:fs')
  const { spawnSync } = await import('node:child_process')
  const raw = readFileSync(join(root, 'docs/GOAL.md'), 'utf8')
  const goalSha = createHash('sha256')
    .update(raw.replace(/<!-- goal-status -->[\s\S]*?<!-- \/goal-status -->/, '').replace(/<!-- goal-current -->[\s\S]*?<!-- \/goal-current -->/, ''))
    .digest('hex')
    .slice(0, 16)
  const commit = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim()
  const at = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const dir = join(root, 'docs', 'others', 'evidence', 'goal-audit')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, at.replace(/[: ]/g, '-') + '.json'), JSON.stringify({ at, commit, goal_sha: goalSha, verdict, findings: [] }, null, 2) + '\n')
  console.log('语义审计已记录：goal ' + goalSha)
}

if (problems.length > 0) {
  console.error('需求审计未通过：')
  for (const problem of [...new Set(problems)]) console.error('- ' + problem)
  process.exitCode = 1
} else {
  console.log('需求审计通过：' + domains.length + ' 个领域，' + reqCount + ' 条 REQ，' + acCount + ' 条 AC')
}