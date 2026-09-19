import { randomInt } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)
const slug = args[0]
const releaseIndex = args.indexOf('--release')
const releaseId = releaseIndex >= 0 ? args[releaseIndex + 1] : `${slug}-v1`
if (
  !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug || '') ||
  !/^[a-z0-9][a-z0-9-]*$/.test(releaseId || '')
) {
  throw new Error('Usage: pnpm create:change <kebab-name> [--release <release-id>]')
}

const root = resolve(process.env.IGNITE_ROOT || process.cwd())
const git = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: root,
  encoding: 'utf8',
  windowsHide: true,
})
const baseCommit = git.status === 0 ? git.stdout.trim() : ''
if (!/^[0-9a-f]{40}$/i.test(baseCommit)) throw new Error('A committed Git baseline is required.')

const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date())
const planPath = join(root, 'docs', 'plans', `${date.replaceAll('-', '')}-${slug}.md`)
const releasePath = join(root, 'docs', 'plans', 'releases', `${releaseId}.json`)
if (existsSync(planPath)) throw new Error(`Plan already exists: ${planPath}`)
if (existsSync(releasePath)) throw new Error(`Release already exists: ${releasePath}`)

const existing = new Set()
for (const entry of readdirSync(join(root, 'docs', 'plans'), { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.md')) continue
  const contents = readFileSync(join(root, 'docs', 'plans', entry.name), 'utf8')
  const id = contents.match(/"id"\s*:\s*"(IGT-\d+)"/)?.[1]
  if (id) existing.add(id)
}
let id
do {
  id = `IGT-${Date.now()}${String(randomInt(1_000_000)).padStart(6, '0')}`
} while (existing.has(id))

const metadata = {
  schema: 2,
  id,
  release: releaseId,
  status: 'draft',
  outcome: `完成 ${slug} 的一项可独立验收的存量改动`,
  contract_version: 2,
  goals: [],
  constraints: [],
  non_goals: [],
  authorization: { source: '等待填写用户已确定的具体请求' },
  deliverables: [],
  remaining_work: ['填写并完成目标行为的实际验收'],
  change_type: '存量改动',
  base_commit: baseCommit,
  requirements: [],
  acceptance: [],
  depends_on: [],
  owner: 'assigned-worker',
  risk: 'feature',
  write_scope: [`docs/plans/${date.replaceAll('-', '')}-${slug}.md`],
  required_evidence: ['check-integration', 'check-release'],
  evidence: [],
  blocker: null,
  open_questions: ['填写目标、受影响的现有 Feature/Design、验收标准与写入范围'],
  integrated_commit: null,
  updated_at: date,
}
const release = {
  schema: 2,
  id: releaseId,
  plan_ids: [id],
  must_pass: ['check-integration', 'check-release'],
  excluded: [],
  updated_at: date,
}
writeFileSync(
  planPath,
  `<!-- ignite-plan
${JSON.stringify(metadata, null, 2)}
-->

# Ignite 实施计划：${slug}

## 目标

填写用户可验证的结果，并将每个目标映射到既有或新增的 REQ/AC。

## 原始目标与覆盖核对

| 用户原话或可追溯来源 | 本轮目标 | REQ | AC | 处理结果 |
| --- | --- | --- | --- | --- |
| 待逐条填写 | 待填写 | 待填写 | 待填写 | 保留 / 明确排除 / 待确认 |

## 非目标

填写本次不触及的现有行为和数据。

## 变更类型

- 类型：\`[存量改动]\`
- 影响的现有路径：待识别。
- 兼容性、数据迁移和回滚影响：待检查。

## 输入规格

- Feature：待填写。
- Design：待填写。

## 测试与验收设计

先写会因缺少目标行为而失败的测试，再实现。

## 实现任务

- [ ] 缩小写入范围、关闭开放问题，再进入 ready。
- [ ] 实施、验证、回写当前 Design。

## 状态记录

| 时间 | 状态 | 说明 |
| --- | --- | --- |
| ${date} | draft | 建立存量改动草稿 |
`,
  'utf8',
)
writeFileSync(releasePath, `${JSON.stringify(release, null, 2)}\n`, 'utf8')
console.log(
  `Created ${id}: ${planPath}\nNext: close the draft questions, then pnpm ignite plan validate ${id}`,
)
