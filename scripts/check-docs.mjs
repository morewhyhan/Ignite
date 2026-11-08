import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, relative, dirname, resolve } from 'node:path'

const root = process.cwd()
const fail = (message) => {
  throw new Error(message)
}
const failures = []
const record = (message) => failures.push(message)
const read = (path) => readFileSync(join(root, path), 'utf8')

const walk = (dir) => {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const docsRoot = join(root, 'docs')
const markdownFiles = walk(docsRoot).filter((path) => path.endsWith('.md'))
markdownFiles.push(join(root, 'README.md'))

// 1. 本地链接必须能打开
for (const file of markdownFiles) {
  const body = readFileSync(file, 'utf8')
  for (const match of body.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)) {
    let target = match[1].trim()
    if (target.startsWith('#') || target.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(target))
      continue
    target = target.split('#')[0]
    if (!target) continue
    const resolved = resolve(dirname(file), target)
    if (!existsSync(resolved))
      record(relative(root, file).replaceAll('\\', '/') + ': broken link ' + match[1])
  }
}

// 2. standards：必须有状态行且为定稿
for (const file of walk(join(docsRoot, 'standards'))) {
  if (!file.endsWith('.md')) continue
  const body = readFileSync(file, 'utf8')
  const status = /文档状态\s*[|：:]\s*([^|\n]*)/.exec(body)
  if (!status) record(relative(root, file) + ': missing 文档状态')
  else if (!/定稿/.test(status[1])) record(relative(root, file) + ': not 定稿')
}

// 3. 设计文档必须有 关联需求，且引用的 REQ 存在
const featureFiles = walk(join(docsRoot, 'features')).filter(
  (path) => path.endsWith('.md') && !/README|_template/.test(path),
)
const knownReqs = new Set()
for (const file of featureFiles)
  for (const match of readFileSync(file, 'utf8').matchAll(/REQ-[A-Z]+-\d+/g))
    knownReqs.add(match[0])
for (const file of walk(join(docsRoot, 'designs'))) {
  if (!file.endsWith('.md') || file.endsWith('README.md')) continue
  const body = readFileSync(file, 'utf8')
  if (!/关联需求/.test(body)) record(relative(root, file) + ': design must declare 关联需求')
  for (const match of body.matchAll(/REQ-[A-Z]+-\d+/g))
    if (!knownReqs.has(match[0])) record(relative(root, file) + ': unknown ' + match[0])
}

// 4. Feature：每条 REQ 至少一条 AC
const acToReqs = new Map()
for (const file of featureFiles) {
  const body = readFileSync(file, 'utf8')
  for (const match of body.matchAll(/^- (AC-[A-Z]+-\d+)（([^）]*)）/gm)) {
    const reqs = [...match[2].matchAll(/REQ-[A-Z]+-\d+/g)].map((item) => item[0])
    acToReqs.set(match[1], reqs)
  }
}
for (const req of knownReqs) {
  const covered = [...acToReqs.values()].some((reqs) => reqs.includes(req))
  if (!covered) record(req + ': every REQ needs at least one AC')
}

// 5. GOAL 与 Feature 同步
const goal = read('docs/GOAL.md')
const goalAcs = new Map()
for (const match of goal.matchAll(/^- (AC-[A-Z]+-\d+)（([^）]*)）：(.*)$/gm))
  goalAcs.set(match[1], { reqs: match[2], text: match[3] })
for (const [id, entry] of goalAcs) {
  if (!acToReqs.has(id)) record(id + ': GOAL lists an AC that no Feature defines')
}
const goalPrefixes = new Set([...goalAcs.keys()].map((id) => id.split('-')[1]))
for (const [id, reqs] of acToReqs) {
  const prefix = id.split('-')[1]
  if (!goalPrefixes.has(prefix)) continue
  if (!goalAcs.has(id)) record(id + ': Feature defines an AC that GOAL does not list')
}

// 6. 每条 AC 必须有测试链接与四段说明
const lines = goal.split(/\r?\n/)
for (let index = 0; index < lines.length; index += 1) {
  const match = /^- (AC-[A-Z]+-\d+)（/.exec(lines[index])
  if (!match) continue
  const detail = lines[index + 1] || ''
  if (!/\(([^)]*tests\/[^)]+)\)/.test(detail)) record(match[1] + ': missing test link')
  if (!/说明：/.test(detail)) record(match[1] + ': missing 说明')
  if (!/不过：/.test(detail)) record(match[1] + ': 说明 needs 不过：')
  if (!/未覆盖：/.test(detail)) record(match[1] + ': 说明 needs 未覆盖：')
}

// 7. AGENTS 必读入口仍在
const agents = read('AGENTS.md')
if (!/GOAL\.md/.test(agents)) record('AGENTS.md must point at docs/GOAL.md')
if (!/PROMPT\.md/.test(agents)) record('AGENTS.md must point at PROMPT.md')

// 需求必须有语义审计记录，且记录的是当前 GOAL。
const auditDir = join(root, 'docs', 'others', 'evidence', 'goal-audit')
const goalHash = createHash('sha256').update(read('docs/GOAL.md').replace(/<!-- goal-status -->[\s\S]*?<!-- \/goal-status -->/, '').replace(/<!-- goal-current -->[\s\S]*?<!-- \/goal-current -->/, '')).digest('hex').slice(0, 16)
const auditRecords = existsSync(auditDir) ? readdirSync(auditDir).filter((name) => name.endsWith('.json')) : []
const audited = auditRecords.some((name) => {
  try { return JSON.parse(readFileSync(join(auditDir, name), 'utf8')).goal_sha === goalHash } catch { return false }
})
if (!audited) record('docs/GOAL.md 没有对应的语义审计记录：运行 pnpm goal:audit，审计通过后执行 pnpm goal:audit --record "<结论>"')

// GOAL 必须包含状态块，否则看板被删了没人发现。
const goalBody = read('docs/GOAL.md')
if (!/<!-- goal-status -->[\s\S]*?<!-- \/goal-status -->/.test(goalBody)) record('docs/GOAL.md 缺少 goal-status 块：运行 pnpm goal:status 重新生成')

const sourceFiles = markdownFiles.length
if (failures.length > 0) {
  console.error('Documentation checks failed:')
  for (const failure of [...new Set(failures)]) console.error('- ' + failure)
  process.exitCode = 1
} else {
  console.log(
    'Documentation checks passed (' +
      sourceFiles +
      ' Markdown files, ' +
      featureFiles.length +
      ' feature specs)',
  )
}
