import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const goalPath = join(root, 'docs/GOAL.md')
const raw = readFileSync(goalPath, 'utf8')
const lines = raw.split(/\r?\n/)
const problems = []

const goalLine = lines.find((line) => line.trimStart().startsWith('- **目标**'))
if (!goalLine) problems.push('A1 目标缺失')
else if (/页面|接口|数据库|算法|框架/.test(goalLine)) problems.push('A1 目标里出现方案词')

const domains = []
let domain = null
let req = null
for (const line of lines) {
  const text = line.trim()
  const indent = line.length - line.trimStart().length
  const domainMatch = /^- \*\*(.+?)\*\*/.exec(text)
  if (domainMatch && indent === 2 && domainMatch[1].includes('领域')) {
    domain = { name: domainMatch[1], reqs: [], acs: [] }
    domains.push(domain)
    req = null
    continue
  }
  const reqMatch = /^- \*\*(REQ-[A-Z]+-\d+)/.exec(text)
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
for (const item of domains) {
  if (item.name.includes('非领域')) continue
  if (item.reqs.length === 0) problems.push('A7 领域“' + item.name + '”没有 REQ')
  const boundary = lines.some((line) => line.includes('边界：'))
  if (!boundary) problems.push('A2 领域“' + item.name + '”没有写边界')
  for (const r of item.reqs) {
    reqCount += 1
    if (r.acs.length === 0) problems.push('A3 ' + r.id + ' 没有 AC')
    acCount += r.acs.length
  }
  const edges = item.acs.filter((ac) => /未|失败|拒绝|为空|并发|重复|超过|越权|不合法/.test(ac.text))
  if (edges.length === 0) problems.push('A5 领域“' + item.name + '”没有异常或边界场景')
  for (const ac of item.acs) {
    if (/返回 *`?(200|401|404|422)|状态码|字段|表结构/.test(ac.text)) problems.push('A4 ' + ac.id + ' 验收的是实现细节')
  }
}

const reasonCount = (raw.match(/为什么这样切：/g) ?? []).length
const realDomains = domains.filter((d) => !d.name.includes('非领域')).length
if (reasonCount < realDomains) problems.push('A8 每个领域都要写“为什么这样切”（缺 ' + (realDomains - reasonCount) + ' 个）')

const termRows = lines.filter((line) => /^\| TERM-/.test(line.trim()))
if (termRows.length < 2) problems.push('A6 术语表不足 2 条')

const recordAt = process.argv.indexOf('--record')
if (recordAt >= 0) {
  const verdict = process.argv[recordAt + 1]
  if (!verdict) { console.error('usage: pnpm goal:audit --record "<结论>"'); process.exit(1) }
  if (problems.length > 0) { console.error('结构审计未通过，不能记录'); process.exit(1) }
  const goalSha = createHash('sha256').update(raw.replace(/<!-- goal-status -->[\s\S]*?<!-- \/goal-status -->/, '').replace(/<!-- goal-current -->[\s\S]*?<!-- \/goal-current -->/, '').replace(/<!-- goal-summary -->[\s\S]*?<!-- \/goal-summary -->/, '')).digest('hex').slice(0, 16)
  const commit = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim()
  const at = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const dir = join(root, 'docs', 'others', 'evidence', 'goal-audit')
  mkdirSync(dir, { recursive: true })
  const name = at.replace(/[: ]/g, '-') + '.json'
  writeFileSync(join(dir, name), JSON.stringify({ at, commit, goal_sha: goalSha, verdict, findings: [] }, null, 2) + String.fromCharCode(10))
  console.log('语义审计已记录：' + name + '（goal ' + goalSha + '）')
}

if (problems.length > 0) {
  console.error('需求审计未通过：')
  for (const problem of [...new Set(problems)]) console.error('- ' + problem)
  process.exitCode = 1
} else {
  console.log('需求审计通过：' + realDomains + ' 个领域，' + reqCount + ' 条 REQ，' + acCount + ' 条 AC')
}