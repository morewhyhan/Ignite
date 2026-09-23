import { randomInt } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { renderPlanProgressContent } from './ignite/execution-contract.mjs'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const releaseIndex = args.indexOf('--release')
const positionalArguments = args.filter(
  (argument, index) =>
    !argument.startsWith('--') && (releaseIndex < 0 || index !== releaseIndex + 1),
)
const [slug] = positionalArguments
const releaseId = releaseIndex >= 0 ? args[releaseIndex + 1] : `${slug}-v1`
if (
  positionalArguments.length !== 1 ||
  args.some(
    (argument) => argument.startsWith('--') && !['--dry-run', '--release'].includes(argument),
  ) ||
  args.filter((argument) => argument === '--release').length > 1 ||
  !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug || '') ||
  !/^[a-z0-9][a-z0-9-]*$/.test(releaseId || '')
) {
  throw new Error('Usage: pnpm create:change <kebab-name> [--release <release-id>] [--dry-run]')
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
const planTemplate = readFileSync(join(root, 'docs', 'plans', '_template.md'), 'utf8')
const planBodyStart = planTemplate.indexOf('-->')
if (planBodyStart < 0) throw new Error('docs/plans/_template.md is missing ignite-plan metadata')
const planBody = planTemplate
  .slice(planBodyStart + 3)
  .replaceAll('<change-name>', slug)
  .replaceAll('REQ-FEATURE-001', '待填写')
  .replaceAll('AC-FEATURE-001', '待填写')
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
  execution_contract: 1,
  goals: [],
  constraints: [],
  non_goals: [],
  authorization: { source: '等待填写用户已确定的具体请求' },
  deliverables: [],
  remaining_work: ['原始目标尚未细化，无法确认完整验收场景'],
  change_type: '存量改动',
  base_commit: baseCommit,
  requirements: [],
  acceptance: [],
  verification_requirements: ['unit'],
  tasks: [
    { id: 'T1', title: '识别现有行为、写入边界和原始目标', status: 'todo' },
    { id: 'T2', title: '补充需求和目标行为测试', status: 'todo' },
    { id: 'T3', title: '实施最小存量修改', status: 'todo' },
    { id: 'T4', title: '验证兼容性并回写设计', status: 'todo' },
  ],
  depends_on: [],
  dependency_contracts: [],
  shared_files: [],
  handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
  owner: 'assigned-worker',
  risk: 'feature',
  write_scope: [
    `docs/plans/${date.replaceAll('-', '')}-${slug}.md`,
    `docs/plans/releases/${releaseId}.json`,
  ],
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
  coverage_version: 1,
  plan_ids: [id],
  scope: [
    {
      id: 'GOAL-001',
      text: '待填写原始目标',
      source: '待填写来源',
      requirements: [],
      plan_ids: [id],
      disposition: 'included',
      reason: '',
      authorization: '',
    },
  ],
  must_pass: ['check-integration', 'check-release'],
  excluded: [],
  updated_at: date,
}
console.log(`${dryRun ? 'Would create' : 'Creating'}:\n- ${planPath}\n- ${releasePath}`)
if (dryRun) {
  console.log(
    'Preview only; no files or release membership were changed. Remove --dry-run to create this draft.',
  )
} else {
  mkdirSync(dirname(releasePath), { recursive: true })
  writeFileSync(
    planPath,
    `<!-- ignite-plan\n${JSON.stringify(metadata, null, 2)}\n-->${renderPlanProgressContent(planBody, metadata)}`,
    'utf8',
  )
  writeFileSync(releasePath, `${JSON.stringify(release, null, 2)}\n`, 'utf8')
  console.log(`Created draft ${id}; Release ${releaseId} includes this Plan.`)
  console.log(
    'Next: define the goals, affected files and applicable unit/database/browser/external acceptance.',
  )
  console.log('Refresh the generated overview: pnpm ignite status --write')
  console.log(`Continue: pnpm ignite next --plan ${id}`)
}
