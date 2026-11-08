import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const text = readFileSync(join(root, 'docs/GOAL.md'), 'utf8')
const lines = text.split(/\r?\n/)
const problems = []

const goalLine = lines.find((line) => /^> 让|^> /.test(line)) || ''
if (!goalLine) problems.push('A1 目标缺失：需要一个一句话目标')
if (/页面|接口|数据库|算法|框架/.test(goalLine))
  problems.push('A1 目标里出现方案词：' + goalLine.slice(0, 40))

const domainRows = lines.filter((line) => /^\| (认证|任务|外壳)/.test(line))
if (domainRows.length === 0) problems.push('A2 领域表为空')
for (const row of domainRows) {
  const cells = row
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean)
  if (cells.length < 5) problems.push('A2 领域行缺少“管什么/不管什么”：' + row.slice(0, 40))
}

const reqs = []
let current = null
for (const line of lines) {
  const req = /^\*\*(REQ-[A-Z]+-\d+)\b(.*)$/.exec(line)
  if (req) {
    current = { id: req[1], text: req[2], acs: [] }
    reqs.push(current)
    continue
  }
  const ac = /^- (AC-[A-Z]+-\d+)（[^）]*）：(.*)$/.exec(line)
  if (ac && current) current.acs.push({ id: ac[1], text: ac[2] })
}
if (reqs.length === 0) problems.push('A3 没有 REQ')
for (const req of reqs) {
  if (req.acs.length < 1) problems.push('A3 ' + req.id + ' 没有 AC')

  if (/支持|优化|完善/.test(req.text)) problems.push('A3 ' + req.id + ' 写成了功能名')
}

for (const req of reqs) {
  for (const ac of req.acs) {
    if (/返回 *`?(200|401|404|422)|状态码|字段|表结构/.test(ac.text))
      problems.push('A4 ' + ac.id + ' 验收的是实现细节，不是用户看到的结果')
  }
}

const termRows = lines.filter((line) => /^\| TERM-/.test(line))
if (termRows.length < 2) problems.push('A6 术语表不足 2 条')

const index = lines.indexOf('## 领域')
const sections = lines.slice(index).filter((line) => /^### 领域：/.test(line))
for (const section of sections) {
  const name = section.replace('### 领域：', '').trim()
  const startAt = lines.indexOf(section)
  const nextAt = lines.findIndex((line, i) => i > startAt && /^### /.test(line))
  const body = lines.slice(startAt, nextAt === -1 ? undefined : nextAt).join('\n')
  if (name.includes('非领域')) continue
  if (!/\*\*REQ-/.test(body)) problems.push('A7 领域“' + name + '”没有任何 REQ')
}

// A5 领域级：每个领域至少一条异常/边界 AC。
for (const section of sections) {
  const name = section.replace('### 领域：', '').trim()
  if (name.includes('非领域')) continue
  const startAt = lines.indexOf(section)
  const nextAt = lines.findIndex((line, i) => i > startAt && /^### /.test(line))
  const body = lines.slice(startAt, nextAt === -1 ? undefined : nextAt)
  const edges = body.filter(
    (line) => /^- AC-/.test(line) && /未|失败|拒绝|为空|并发|重复|超过|越权|不合法/.test(line),
  )
  if (edges.length === 0) problems.push('A5 领域“' + name + '”没有异常或边界场景')
}

if (problems.length > 0) {
  console.error('需求审计未通过：')
  for (const problem of [...new Set(problems)]) console.error('- ' + problem)
  process.exitCode = 1
} else {
  console.log(
    '需求审计通过：' +
      reqs.length +
      ' 条 REQ，' +
      reqs.reduce((sum, req) => sum + req.acs.length, 0) +
      ' 条 AC',
  )
}

const recordAt = process.argv.indexOf('--record')
if (recordAt >= 0) {
  const verdict = process.argv[recordAt + 1]
  if (!verdict) { console.error('usage: pnpm goal:audit --record "<语义审计结论>"'); process.exit(1) }
  if (problems.length > 0) {
    console.error('结构审计未通过，不能记录审计结论')
    process.exit(1)
  }
  const { createHash } = await import('node:crypto')
  const { mkdirSync, writeFileSync } = await import('node:fs')
  const { spawnSync } = await import('node:child_process')
  const goalSha = createHash('sha256').update(readFileSync(join(root, 'docs/GOAL.md'), 'utf8').replace(/<!-- goal-status -->[\s\S]*?<!-- \/goal-status -->/, '').replace(/<!-- goal-current -->[\s\S]*?<!-- \/goal-current -->/, '')).digest('hex').slice(0, 16)
  const commit = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim()
  const at = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const dir = join(root, 'docs', 'others', 'evidence', 'goal-audit')
  mkdirSync(dir, { recursive: true })
  const name = at.replace(/[: ]/g, '-') + '.json'
  writeFileSync(join(dir, name), JSON.stringify({ at, commit, goal_sha: goalSha, verdict, findings: [] }, null, 2) + String.fromCharCode(10))
  console.log('语义审计已记录：' + name + '（goal ' + goalSha + '）')
}
