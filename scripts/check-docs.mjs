import {
  standardRegistryFailures,
  validatePlanDocument,
  markdownHeadings,
} from './ignite/document-contract.mjs'
import { isGovernedPath } from './ignite/checks.mjs'
import { CONTENT_HEADINGS } from './ignite/content-contract.mjs'
import {
  collectSpecificationIds,
  filesWithoutIds,
  sourceEntries,
  unknownReferences,
} from './ignite/spec-id-registry.mjs'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { repositoryRoot, walkFiles } from './ignite/core.mjs'
import {
  validateAgentBridges,
  validateDesignArtifacts,
  validateRuntimeContract,
  validateTraceability,
} from './ignite/governance.mjs'
import { listPlanFiles, readPlan, validateAllPlans, validateAllReleases } from './ignite/state.mjs'

const docsRoot = join(repositoryRoot, 'docs')
const failures = []

function fail(message) {
failures.push(message)
}

function requirePath(path) {
  if (!existsSync(join(repositoryRoot, path))) fail(`missing required documentation path: ${path}`)
}

function read(path) {
  return readFileSync(join(repositoryRoot, path), 'utf8')
}

for (const path of [
  'AGENTS.md',
  'docs/README.md',
  'docs/standards/adoption.md',
  'docs/plans/README.md',
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
]) {
  requirePath(path)
}

const standardFiles = walkFiles(join(docsRoot, 'standards'))
  .filter((path) => path.endsWith('.md') && !/[/\\]README\.md$/.test(path))
  .map((path) => relative(join(docsRoot, 'standards'), path).replaceAll('\\', '/'))
failures.push(
  ...standardRegistryFailures(standardFiles, read('docs/standards/README.md'), isGovernedPath),
)

const markdownFiles = walkFiles(docsRoot).filter((path) => extname(path) === '.md')

// 结构检查：只查章节、字段、引用是否齐全，不查内容意思。
const structureRequirements = [
  ['docs/features/README.md', ['模块目标', '交接']],
  ['docs/plans/README.md', ['模块目标', '交接']],
  ['docs/designs/README.md', ['模块目标', '交接', '来源标记']],
  ['docs/others/README.md', ['模块目标', '交接']],
]
for (const entry of structureRequirements) {
  const path = String(entry[0])
  const required = entry[1]
  if (!existsSync(join(repositoryRoot, path))) continue
  const text = read(path)
  for (const marker of required) {
    if (!text.includes(marker)) fail(`structure: ${path} is missing required section ${marker}`)
  }
}
for (const path of walkFiles(join(docsRoot, 'standards'))) {
  if (!path.endsWith('.md')) continue
  const text = readFileSync(path, 'utf8')
  const relativePath = relative(repositoryRoot, path).replaceAll('\\', '/')
  const statusMatch = text.match(/文档状态\s*[|：:]\s*([^|\n]*)/)
  if (!statusMatch) {
    fail(`structure: ${relativePath} has no status row; treat it as draft`)
    continue
  }
  if (!/定稿/.test(statusMatch[1])) {
    fail(`structure: ${relativePath} is not final yet`)
  }
}
for (const path of walkFiles(join(docsRoot, 'designs'))) {
  if (!path.endsWith('.md') || path.endsWith('README.md')) continue
  const text = readFileSync(path, 'utf8')
  const relativePath = relative(repositoryRoot, path).replaceAll('\\', '/')
  if (!text.includes('事件与命令')) {
    fail(`structure: ${relativePath} is missing the event section`)
    continue
  }
  if (/待填写/.test(text)) fail(`structure: ${relativePath} still has placeholder rows`)
}
const moduleSections = [
  'docs/features/README.md',
  'docs/plans/README.md',
  'docs/designs/README.md',
  'docs/others/README.md',
].map((path) => ({ path, body: (read(path).split('## 模块说明（§8.1）')[1] || '').trim() }))
const seenModules = new Map()
for (const entry of moduleSections) {
  if (entry.body.length < 200) fail(`structure: ${entry.path} module section is too thin`)
  if (seenModules.has(entry.body)) {
    fail(`structure: ${entry.path} duplicates the module section of ${seenModules.get(entry.body)}`)
  } else {
    seenModules.set(entry.body, entry.path)
  }
}

// 领域登记检查：src/modules 下每个模块必须登记；每个领域只允许一份主导文档。
const domainRegistry = read('docs/designs/domain.md')
const registeredModules = new Set(
  [...domainRegistry.matchAll(/src\/modules\/([a-z0-9-]+)/g)].map((match) => match[1]),
)
const modulesOnDisk = readdirSync(join(repositoryRoot, 'src', 'modules')).filter((name) =>
  existsSync(join(repositoryRoot, 'src', 'modules', name, 'index.ts')),
)
for (const name of modulesOnDisk) {
  if (!registeredModules.has(name))
    fail(`domain: src/modules/${name} is not registered in docs/designs/domain.md`)
}
for (const name of registeredModules) {
  if (!modulesOnDisk.includes(name))
    fail(`domain: docs/designs/domain.md registers missing module ${name}`)
}
const domainDocs = [
  ...domainRegistry.matchAll(
    /\|\s*([^|]+?)\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*(src\/modules\/[a-z0-9-]+)/g,
  ),
].map((match) => ({ domain: match[1].trim(), label: match[2], target: match[3], module: match[4] }))
const seenDomainDocs = new Map()
for (const entry of domainDocs) {
  const resolved = resolve(
    dirname(join(repositoryRoot, 'docs', 'designs', 'domain.md')),
    entry.target,
  )
  if (!existsSync(resolved))
    fail(`domain: ${entry.domain} points to missing document ${entry.target}`)
  if (seenDomainDocs.has(entry.target)) {
    fail(
      `domain: ${entry.domain} and ${seenDomainDocs.get(entry.target)} share the document ${entry.target}`,
    )
  } else {
    seenDomainDocs.set(entry.target, entry.domain)
  }
}

// 目标树与需求层同步：GOAL.md 覆盖的领域，其 AC 必须与 Feature 完全一致。
const goalText = read('GOAL.md')
const goalAcs = new Set([...goalText.matchAll(/AC-([A-Z]+)-\d+/g)].map((match) => match[0]))
const goalPrefixes = new Set([...goalAcs].map((id) => id.split('-')[1]))
const featureAcs = new Set(
  [...walkFiles(join(docsRoot, 'features'))]
    .filter((path) => path.endsWith('.md') && !/README|_template/.test(path))
    .flatMap((path) =>
      [...readFileSync(path, 'utf8').matchAll(/^- (AC-[A-Z]+-\d+)/gm)].map((match) => match[1]),
    ),
)
for (const id of goalAcs)
  if (!featureAcs.has(id)) fail('GOAL.md lists ' + id + ' but no Feature defines it')
for (const id of featureAcs) {
  if (!goalPrefixes.has(id.split('-')[1])) continue
  if (!goalAcs.has(id)) fail('Feature defines ' + id + ' but GOAL.md does not list it')
}

// 每条 AC 的下一行必须给出测试链接，否则验收没有落点。
const goalLines = read('GOAL.md').split(/\r?\n/)
for (let index = 0; index < goalLines.length; index += 1) {
  const line = goalLines[index]
  if (!/^- AC-[A-Z]+-\d+/.test(line)) continue
  const detail = goalLines[index + 1] || ''
  if (!/\(tests\//.test(detail)) {
    const id = line.slice(2).split('（')[0]
    fail(id + ': every AC needs a test link on the next line')
  }
}

// REQ 覆盖：每个 REQ 至少一条 AC，每条 AC 引用的 REQ 必须存在。
const featureTexts = [...walkFiles(join(docsRoot, 'features'))]
  .filter((path) => path.endsWith('.md') && !/README|_template/.test(path))
  .map((path) => readFileSync(path, 'utf8'))
const allReqs = new Set()
const coveredReqs = new Set()
for (const text of featureTexts) {
  for (const match of text.matchAll(/（(REQ-[A-Z]+-\d+)）/g)) allReqs.add(match[1])
  for (const line of text.split(/\r?\n/)) {
    if (!/^- AC-/.test(line)) continue
    for (const match of line.matchAll(/REQ-[A-Z]+-\d+/g)) coveredReqs.add(match[0])
  }
}
for (const id of allReqs) {
  if (!coveredReqs.has(id)) fail(id + ': every REQ needs at least one AC')
}
for (const id of coveredReqs) {
  if (!allReqs.has(id)) fail(id + ': AC references a REQ that no Feature defines')
}

// AC 文字必须与 Feature 一致，避免两处各写一套。
const featureAcText = new Map()
for (const file of walkFiles(join(docsRoot, 'features'))) {
  if (!file.endsWith('.md') || /README|_template/.test(file)) continue
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^- (AC-[A-Z]+-\d+)（[^）]*）：(.*)$/.exec(line)
    if (match) featureAcText.set(match[1], match[2].trim())
  }
}
for (const line of read('GOAL.md').split(/\r?\n/)) {
  const match = /^- (AC-[A-Z]+-\d+)（[^）]*）：(.*)$/.exec(line)
  if (!match) continue
  const expected = featureAcText.get(match[1])
  if (expected && expected !== match[2].trim()) {
    fail(match[1] + ': GOAL.md AC text differs from the Feature AC text')
  }
}

// 设计文档必须回链需求，且引用的 REQ 必须存在。
const knownReqs = new Set()
for (const file of walkFiles(join(docsRoot, 'features'))) {
  if (!file.endsWith('.md') || /README|_template/.test(file)) continue
  for (const match of readFileSync(file, 'utf8').matchAll(/REQ-[A-Z]+-\d+/g)) knownReqs.add(match[0])
}
for (const file of walkFiles(join(docsRoot, 'designs'))) {
  if (!file.endsWith('.md') || file.endsWith('README.md')) continue
  const body = readFileSync(file, 'utf8')
  if (!/关联需求/.test(body)) {
    fail(relative(repositoryRoot, file) + ': design must declare 关联需求')
    continue
  }
  for (const match of body.matchAll(/REQ-[A-Z]+-\d+/g)) {
    if (!knownReqs.has(match[0]))
      fail(relative(repositoryRoot, file) + ': references unknown ' + match[0])
  }
}


const localLinkPattern = /!?\[[^\]]*]\(([^)]+)\)/g

for (const markdownFile of markdownFiles) {
  const content = readFileSync(markdownFile, 'utf8')
  const relativeFile = relative(repositoryRoot, markdownFile).replaceAll('\\', '/')

  for (const match of content.matchAll(localLinkPattern)) {
    let target = match[1].trim()
    if (target.startsWith('#') || target.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(target)) {
      continue
    }
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1)
    target = target.split('#', 1)[0].split('?', 1)[0]
    if (!target || (relativeFile.includes('_template.md') && target.includes('<'))) continue
    try {
      if (!existsSync(resolve(dirname(markdownFile), decodeURIComponent(target)))) {
        fail(`${relativeFile}: broken local link ${target}`)
      }
    } catch {
      fail(`${relativeFile}: invalid encoded link ${target}`)
    }
  }

  if (
    !relativeFile.includes('_template.md') &&
    /docs\/(?:features|plans)\//.test(relativeFile) &&
    /<(?:feature-name|change-name|actor|capability|value)>/i.test(content)
  ) {
    fail(`${relativeFile}: unresolved template placeholder`)
  }
}

const featureFiles = walkFiles(join(docsRoot, 'features')).filter(
  (path) => path.endsWith('.md') && !/[/\\](?:README|_template)\.md$/.test(path),
)
for (const featureFile of featureFiles) {
  const content = readFileSync(featureFile, 'utf8')
  const relativeFile = relative(repositoryRoot, featureFile).replaceAll('\\', '/')
  const requiredHeadings = ['## 背景与目标', '## 业务规则', '## 验收标准']
  if (!featureFile.endsWith('product.md')) requiredHeadings.push('## 模块边界')
  for (const heading of requiredHeadings) {
    if (!markdownHeadings(content).includes(heading))
      fail(`${relativeFile}: missing heading "${heading}"`)
  }
  if (!/^- R\d+（REQ-[A-Z0-9-]+）：/m.test(content)) {
    fail(`${relativeFile}: business rules must use stable REQ-* IDs`)
  }
  if (!/^- AC-[A-Z0-9-]+（REQ-[A-Z0-9-,、 ]+）：Given .+When .+Then /m.test(content)) {
    fail(`${relativeFile}: AC must name covered REQ-* IDs and use Given/When/Then`)
  }
}

const planFiles = listPlanFiles()
for (const planFile of planFiles) {
  const plan = readPlan(planFile)
  const contentOnlyHeadings = CONTENT_HEADINGS
  for (const error of validatePlanDocument(plan.content, read('docs/plans/_template.md'), {
    contentContract: plan.metadata?.content_contract === 1,
  }))
    fail(`${plan.relativePath}: ${error}`)
  if (plan.metadata?.schema !== 2) {
    const selectedTypes = [
      ...plan.content.matchAll(/^- 类型：`(\[(?:新增模块|存量改动|基础设施变更)\])`$/gm),
    ]
    if (selectedTypes.length !== 1) fail(`${plan.relativePath}: select exactly one change type`)
  }
}

const specEntries = sourceEntries(repositoryRoot, [
  'docs/standards',
  'docs/designs',
  'docs/others/adr',
])
const specRegistry = collectSpecificationIds(specEntries)
for (const path of filesWithoutIds(specEntries)) fail(`${path}: missing specification identifier`)
for (const duplicate of specRegistry.duplicates)
  fail(
    `${duplicate.second}: duplicate specification identifier ${duplicate.id} (also ${duplicate.first})`,
  )
for (const planFile of planFiles) {
  const plan = readPlan(planFile)
  const prose = plan.content.replace(/<!-- ignite-plan[\s\S]*?-->/, '')
  for (const id of unknownReferences(prose, specRegistry.byId))
    fail(`${plan.relativePath}: unknown specification reference ${id}`)
}

const agentGuide = read('AGENTS.md')
for (const rule of [
  'Ignite 是一个可复制',
  '## 增量与存量',
  '## 规格驱动 Loop',
  'docs/standards/adoption.md',
]) {
  if (!agentGuide.includes(rule)) fail(`AGENTS.md: missing required template rule "${rule}"`)
}

  // 每条 AC 必须有验证说明，人要在看板上看到测到什么程度。
for (const line of goalLines) {
  if (!/^- AC-[A-Z]+-\d+/.test(line)) continue
  const id = line.slice(2).split('（')[0]
  const noteLine = goalLines[goalLines.indexOf(line) + 1] || ''
  if (!/说明：/.test(noteLine)) {
    fail(id + ': every AC needs a 说明 (what the test covers and what it does not)')
  }
}

// 说明必须写清：场景、通过后感知、不过会怎样。
for (const line of goalLines) {
  if (!/^- AC-[A-Z]+-\d+/.test(line)) continue
  const id = line.slice(2).split('（')[0]
  const noteLine = goalLines[goalLines.indexOf(line) + 1] || ''
  if (!/不过：/.test(noteLine)) fail(id + ': 说明 needs 不过：<如果不过会出什么问题>')
  if (!/未覆盖：|场景：/.test(noteLine)) fail(id + ': 说明 needs 场景：与 未覆盖：')
}

failures.push(
  ...validateAllPlans(),
  ...validateAllReleases(),
  ...validateTraceability(),
  ...(await validateDesignArtifacts()),
  ...validateAgentBridges(),
  ...validateRuntimeContract(),
)

if (failures.length > 0) {
  console.error('Documentation checks failed:')
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(
    `Documentation checks passed (${markdownFiles.length} Markdown files, ${featureFiles.length} feature specs, ${planFiles.length} Plans).`,
  )
}
