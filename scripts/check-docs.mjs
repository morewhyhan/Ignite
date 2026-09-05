import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsRoot = join(repositoryRoot, 'docs')
const failures = []

function fail(message) {
  failures.push(message)
}

function requirePath(path) {
  const absolutePath = join(repositoryRoot, path)
  if (!existsSync(absolutePath)) fail(`Missing required documentation path: ${path}`)
}

function read(path) {
  return readFileSync(join(repositoryRoot, path), 'utf8')
}

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const requiredPaths = [
  'AGENTS.md',
  'docs/README.md',
  'docs/standards/adoption.md',
  'docs/standards/workflow.md',
  'docs/features/product.md',
  'docs/features/_template.md',
  'docs/plans/_template.md',
  'docs/plans/releases/README.md',
  'docs/plans/releases/_template.json',
  'docs/others/test-cases/README.md',
  'docs/others/test-cases/_template.md',
  'docs/designs/domain.puml',
  'docs/designs/database.sql',
  'docs/designs/api.yaml',
  'docs/designs/sequence.puml',
]

for (const path of requiredPaths) requirePath(path)

const markdownFiles = walk(docsRoot).filter((path) => extname(path) === '.md')
const localLinkPattern = /!?\[[^\]]*]\(([^)]+)\)/g

for (const markdownFile of markdownFiles) {
  const content = readFileSync(markdownFile, 'utf8')
  const relativeFile = relative(repositoryRoot, markdownFile)

  for (const match of content.matchAll(localLinkPattern)) {
    let target = match[1].trim()

    if (target.startsWith('#') || target.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(target)) {
      continue
    }

    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1)
    target = target.split('#', 1)[0].split('?', 1)[0]

    if (!target || (relativeFile.includes('_template.md') && target.includes('<'))) continue

    let decodedTarget
    try {
      decodedTarget = decodeURIComponent(target)
    } catch {
      fail(`${relativeFile}: invalid encoded link ${target}`)
      continue
    }

    if (!existsSync(resolve(dirname(markdownFile), decodedTarget))) {
      fail(`${relativeFile}: broken local link ${target}`)
    }
  }

  if (
    !relativeFile.includes('_template.md') &&
    /docs[\\/](?:features|plans)[\\/]/.test(relativeFile) &&
    /<(?:feature-name|change-name|actor|capability|value)>/i.test(content)
  ) {
    fail(`${relativeFile}: unresolved template placeholder`)
  }
}

const featureDirectory = join(docsRoot, 'features')
const featureFiles = readdirSync(featureDirectory)
  .filter((name) => name.endsWith('.md') && !['README.md', '_template.md'].includes(name))
  .map((name) => join(featureDirectory, name))

for (const featureFile of featureFiles) {
  const content = readFileSync(featureFile, 'utf8')
  const relativeFile = relative(repositoryRoot, featureFile)
  const requiredHeadings = ['## 背景与目标', '## 业务规则', '## 验收标准']

  if (!featureFile.endsWith('product.md')) requiredHeadings.push('## 模块边界')

  for (const heading of requiredHeadings) {
    if (!content.includes(heading)) fail(`${relativeFile}: missing heading "${heading}"`)
  }

  if (!/^- R\d+（REQ-[A-Z0-9-]+）：/m.test(content)) {
    fail(`${relativeFile}: business rules must use stable REQ-* IDs`)
  }

  if (!/^- AC-[A-Z0-9-]+：Given .+When .+Then /m.test(content)) {
    fail(`${relativeFile}: acceptance criteria must use stable AC-* IDs and Given/When/Then`)
  }
}

const planDirectory = join(docsRoot, 'plans')
const planFiles = readdirSync(planDirectory)
  .filter((name) => name.endsWith('.md') && !['README.md', '_template.md'].includes(name))
  .map((name) => join(planDirectory, name))

for (const planFile of planFiles) {
  const content = readFileSync(planFile, 'utf8')
  const relativeFile = relative(repositoryRoot, planFile)
  const metadataStart = content.indexOf('<!-- ignite-plan')

  for (const heading of [
    '## 状态',
    '## 变更类型',
    '## 目标',
    '## 输入规格',
    '## 实现任务',
    '## 验收方式',
    '## 状态记录',
    '## 准出条件',
  ]) {
    if (!content.includes(heading)) fail(`${relativeFile}: missing heading "${heading}"`)
  }

  const selectedTypes = [
    ...content.matchAll(/^- 类型：`(\[(?:新增模块|存量改动|基础设施变更)\])`$/gm),
  ]

  if (selectedTypes.length !== 1) {
    fail(`${relativeFile}: select exactly one change type`)
  }

  if (metadataStart >= 0) {
    for (const heading of ['## 非目标', '## 测试与验收设计', '## 设计回写']) {
      if (!content.includes(heading))
        fail(`${relativeFile}: structured plans require heading "${heading}"`)
    }
    if (!/<!-- ignite-plan\s*\{[\s\S]+\}\s*-->/.test(content)) {
      fail(`${relativeFile}: structured plan metadata must be valid JSON block`)
    }
  }

  if (/## 状态\s+已完成/.test(content) && /^- \[ \]/m.test(content)) {
    fail(`${relativeFile}: completed plan still contains unchecked tasks`)
  }
}

const releaseDirectory = join(docsRoot, 'plans', 'releases')
const structuredPlanIds = new Set(
  planFiles
    .map((path) => readFileSync(path, 'utf8').match(/"id"\s*:\s*"(IGT-\d+)"/)?.[1])
    .filter(Boolean),
)
for (const releaseName of readdirSync(releaseDirectory).filter(
  (name) => name.endsWith('.json') && !name.startsWith('_'),
)) {
  const releasePath = join(releaseDirectory, releaseName)
  const relativeFile = relative(repositoryRoot, releasePath)
  try {
    const release = JSON.parse(readFileSync(releasePath, 'utf8'))
    if (release.schema !== 1 || typeof release.id !== 'string') {
      fail(`${relativeFile}: release requires schema 1 and an id`)
    }
    if (!['draft', 'active', 'ready', 'done', 'blocked'].includes(release.status)) {
      fail(`${relativeFile}: invalid release status`)
    }
    if (
      !Array.isArray(release.plan_ids) ||
      release.plan_ids.some((id) => !structuredPlanIds.has(id))
    ) {
      fail(`${relativeFile}: every plan_ids entry must reference a structured Plan`)
    }
    if (!Array.isArray(release.must_pass)) fail(`${relativeFile}: must_pass must be an array`)
  } catch (error) {
    fail(`${relativeFile}: invalid JSON (${error.message})`)
  }
}

const databaseSql = read('docs/designs/database.sql')
for (const requiredSql of ['CREATE TABLE', 'CREATE INDEX', 'FOREIGN KEY', 'ON UPDATE CASCADE']) {
  if (!databaseSql.includes(requiredSql)) {
    fail(`docs/designs/database.sql: missing ${requiredSql}`)
  }
}

const migrationSql = read('prisma/migrations/20260726000000_init/migration.sql')
const tableNames = (sql) =>
  [...sql.matchAll(/CREATE TABLE\s+"([^"]+)"/gi)].map((match) => match[1]).sort()
const migrationTables = tableNames(migrationSql)
const snapshotTables = tableNames(databaseSql)
if (JSON.stringify(migrationTables) !== JSON.stringify(snapshotTables)) {
  fail(
    `docs/designs/database.sql: table snapshot differs from migration (${snapshotTables.join(', ')} vs ${migrationTables.join(', ')})`,
  )
}

const openApi = read('docs/designs/api.yaml')
for (const requiredOpenApiPart of ['openapi: 3.', 'paths:', 'components:', 'schemas:']) {
  if (!openApi.includes(requiredOpenApiPart)) {
    fail(`docs/designs/api.yaml: missing ${requiredOpenApiPart}`)
  }
}

for (const diagram of ['docs/designs/domain.puml', 'docs/designs/sequence.puml']) {
  const content = read(diagram)
  if (!content.includes('@startuml') || !content.includes('@enduml')) {
    fail(`${diagram}: missing PlantUML start/end markers`)
  }
}

const agentGuide = read('AGENTS.md')
for (const requiredAgentRule of [
  'Ignite 是一个可复制',
  '## 增量与存量',
  '## 规格驱动 Loop',
  'docs/standards/adoption.md',
]) {
  if (!agentGuide.includes(requiredAgentRule)) {
    fail(`AGENTS.md: missing required template rule "${requiredAgentRule}"`)
  }
}

if (failures.length > 0) {
  console.error('Documentation checks failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(
    `Documentation checks passed (${markdownFiles.length} Markdown files, ${featureFiles.length} feature specs, ${planFiles.length} plans).`,
  )
}
