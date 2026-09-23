import { gitCommitExists, isAncestor, runGit, workingPathBlobIdentity } from './core.mjs'

export const VERIFICATION_LAYERS = new Set(['unit', 'database', 'browser', 'external'])
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0
const safePath = (value) =>
  nonempty(value) &&
  !value.includes('\\') &&
  !value.split('/').includes('..') &&
  !/^[A-Za-z]:|^\//.test(value)

export function validateExecutionContract(plan, readText) {
  const value = plan.metadata
  if (value.execution_contract === undefined) return []
  const errors = []
  if (value.execution_contract !== 1) errors.push('execution_contract must be 1')
  const strict = !['draft', 'cancelled', 'superseded'].includes(value.status)
  for (const key of [
    'verification_requirements',
    'tasks',
    'dependency_contracts',
    'shared_files',
  ]) {
    if (!Array.isArray(value[key])) errors.push(`${key} must be an array`)
  }
  const tasks = Array.isArray(value.tasks) ? value.tasks : []
  const ids = new Set()
  for (const task of tasks) {
    if (
      !nonempty(task.id) ||
      ids.has(task.id) ||
      !nonempty(task.title) ||
      !['todo', 'doing', 'done'].includes(task.status)
    )
      errors.push('tasks require unique id, title and todo|doing|done status')
    ids.add(task.id)
  }
  if (value.status === 'done' && tasks.some((task) => task.status !== 'done'))
    errors.push('done Plan has unfinished tasks')
  const allLayers = new Set()
  for (const item of value.acceptance || []) {
    if (!Array.isArray(item.required_layers) || !Array.isArray(item.checks)) {
      errors.push(`${item.id}: required_layers and checks are required`)
      continue
    }
    for (const layer of item.required_layers) {
      allLayers.add(layer)
      if (!VERIFICATION_LAYERS.has(layer)) errors.push(`${item.id}: unknown layer ${layer}`)
      if (!item.checks.some((check) => check.layer === layer))
        errors.push(`${item.id}: missing ${layer} test mapping`)
    }
    for (const test of item.tests || []) {
      if (!item.checks.some((check) => check.test === test))
        errors.push(`${item.id}: test has no layer: ${test}`)
    }
    for (const check of item.checks) {
      if (!VERIFICATION_LAYERS.has(check.layer) || !item.tests?.includes(check.test)) {
        errors.push(`${item.id}: checks must refer to declared tests and known layers`)
        continue
      }
      const path = check.test.split('::', 1)[0]
      if (!safePath(path)) {
        errors.push(`${item.id}: invalid test path`)
        continue
      }
      if (check.layer === 'browser' && !/^tests\/e2e\/.+\.spec\.tsx?$/.test(path))
        errors.push(`${item.id}: browser evidence requires a Playwright spec`)
      if (!strict) continue
      const source = readText(path)
      if (source === null) continue // The base validator reports missing tests.
      if (check.layer === 'database' || check.layer === 'external') {
        // This rejects common direct bypasses, not every possible hidden mock.
        if (/\b(?:vi|jest)\.(?:mock|doMock|spyOn)\s*\(/.test(source))
          errors.push(
            `${item.id}: ${check.layer} test must use real boundaries, not mocks (${path})`,
          )
        if (
          check.layer === 'database' &&
          !/(?:PrismaClient|DatabaseSync|databaseTestAdapter|withTestDatabase|test-database)/.test(
            source,
          )
        )
          errors.push(
            `${item.id}: database test must use an isolated real database fixture (${path})`,
          )
        if (check.layer === 'external' && !nonempty(check.provider))
          errors.push(`${item.id}: external checks require a provider name`)
      }
      if (check.layer === 'browser' && /\.route\s*\(|routeFromHAR\s*\(/.test(source))
        errors.push(
          `${item.id}: browser acceptance must exercise the application API without route mocking`,
        )
    }
  }
  for (const layer of value.verification_requirements || []) {
    if (!VERIFICATION_LAYERS.has(layer)) errors.push(`unknown verification requirement ${layer}`)
    if (strict && !allLayers.has(layer))
      errors.push(`no acceptance criterion covers required ${layer} verification`)
  }
  if (strict && !value.verification_requirements?.length)
    errors.push('verification_requirements must declare the applicable behavior layers')
  if (strict && value.risk === 'ui' && !allLayers.has('browser'))
    errors.push('UI Plan requires browser acceptance')
  if (strict && value.risk === 'database' && !allLayers.has('database'))
    errors.push('database Plan requires real database acceptance')
  for (const claim of value.shared_files || []) {
    if (
      !safePath(claim.path) ||
      !nonempty(claim.owner) ||
      !['exclusive', 'integrator'].includes(claim.mode)
    )
      errors.push('shared_files require repository path, owner and exclusive|integrator mode')
    if (
      !value.write_scope?.some((scope) =>
        scope.endsWith('/') ? claim.path.startsWith(scope) : claim.path === scope,
      )
    )
      errors.push(`shared file ${claim.path} is outside write_scope`)
  }
  if (strict) {
    for (const path of [
      'prisma/schema.prisma',
      'src/server/api/index.ts',
      'src/config/navigation.ts',
    ]) {
      const scoped = value.write_scope?.some((scope) =>
        scope.endsWith('/') ? path.startsWith(scope) : scope === path,
      )
      if (scoped && !value.shared_files?.some((claim) => claim.path === path))
        errors.push(`declare shared_files owner for ${path}`)
    }
    const prose = (plan.content || '').replace(
      /<!-- ignite-progress -->[\s\S]*?<!-- \/ignite-progress -->/g,
      '',
    )
    if (/^- \[[ x]\]/m.test(prose))
      errors.push('task checkboxes must be generated from tasks, not maintained in Plan prose')
    const content = plan.content || ''
    const starts = content.match(/<!-- ignite-progress -->/g)?.length || 0
    const ends = content.match(/<!-- \/ignite-progress -->/g)?.length || 0
    if (starts !== 1 || ends !== 1)
      errors.push('Plan must contain exactly one generated ignite-progress block')
    else if (
      content.match(/<!-- ignite-progress -->[\s\S]*?<!-- \/ignite-progress -->/)?.[0] !==
      renderPlanProgress(value)
    ) {
      errors.push('Plan progress block is stale; run pnpm ignite plan refresh <ID>')
    }
  }
  if (
    !value.handoff ||
    ['interfaces', 'migrations', 'tests', 'remaining'].some(
      (key) => !Array.isArray(value.handoff[key]),
    )
  )
    errors.push('handoff requires interfaces, migrations, tests and remaining arrays')
  if (value.status === 'done' && value.handoff?.remaining?.length)
    errors.push('done Plan still has handoff gaps')
  for (const contract of value.dependency_contracts || []) {
    if (
      !value.depends_on?.includes(contract.plan_id) ||
      !gitCommitExists(contract.commit) ||
      !Array.isArray(contract.paths) ||
      !contract.paths.length ||
      contract.paths.some((path) => !safePath(path) || path.endsWith('/'))
    )
      errors.push(
        'dependency_contracts require a declared dependency, real commit and explicit file paths',
      )
  }
  return [...new Set(errors)]
}

export function dependencyContractIsCurrent(plan, dependencyId) {
  const contract = plan.metadata.dependency_contracts?.find((item) => item.plan_id === dependencyId)
  if (
    !contract ||
    !gitCommitExists(contract.commit) ||
    !isAncestor(contract.commit) ||
    !contract.paths?.length
  )
    return false
  for (const path of contract.paths) {
    if (!safePath(path)) return false
    const previous = runGit(['rev-parse', '--verify', `${contract.commit}:${path}`], {
      allowFailure: true,
    })
    let current
    try {
      current = workingPathBlobIdentity(path)
    } catch {
      return false
    }
    if (previous.exitCode !== 0 || !current || previous.stdout !== current) return false
  }
  return true
}

export function validateReleaseScope(release, plansById) {
  if (release.coverage_version === undefined) return []
  const errors = []
  if (release.coverage_version !== 1 || !Array.isArray(release.scope) || !release.scope.length)
    return ['release coverage_version 1 requires original goal scope']
  const ids = new Set()
  for (const goal of release.scope) {
    if (!nonempty(goal.id) || ids.has(goal.id) || !nonempty(goal.text) || !nonempty(goal.source))
      errors.push('scope goals require unique id, original text and source')
    ids.add(goal.id)
    if (!['included', 'deferred', 'excluded'].includes(goal.disposition))
      errors.push(`${goal.id}: invalid disposition`)
    if (!Array.isArray(goal.requirements) || !Array.isArray(goal.plan_ids)) {
      errors.push(`${goal.id}: requirements and plan_ids must be arrays`)
      continue
    }
    const strict = goal.plan_ids.some(
      (id) => !['draft', 'cancelled', 'superseded'].includes(plansById.get(id)?.metadata.status),
    )
    if (
      goal.disposition === 'excluded' &&
      (!nonempty(goal.authorization) || !nonempty(goal.reason))
    )
      errors.push(`${goal.id}: exclusions need the user authorization source and reason`)
    if (goal.disposition === 'deferred' && !nonempty(goal.reason))
      errors.push(`${goal.id}: deferred goals need a reason and remain outstanding`)
    if (
      strict &&
      goal.disposition === 'included' &&
      (!goal.requirements.length || !goal.plan_ids.length)
    )
      errors.push(`${goal.id}: included goal has no REQ/Plan coverage`)
    for (const id of goal.plan_ids)
      if (!release.plan_ids.includes(id)) errors.push(`${goal.id}: Plan ${id} is outside release`)
    for (const req of goal.requirements)
      if (!goal.plan_ids.some((id) => plansById.get(id)?.metadata.requirements?.includes(req)))
        errors.push(`${goal.id}: ${req} has no assigned Plan`)
  }
  for (const id of release.plan_ids || []) {
    if (['draft', 'cancelled', 'superseded'].includes(plansById.get(id)?.metadata.status)) continue
    for (const req of plansById.get(id)?.metadata.requirements || []) {
      if (
        !release.scope.some(
          (goal) =>
            goal.disposition === 'included' &&
            goal.plan_ids.includes(id) &&
            goal.requirements.includes(req),
        )
      )
        errors.push(`${id}: ${req} is not traced to an included original goal`)
    }
  }
  if (
    release.excluded?.some(
      (text) =>
        !release.scope.some((goal) => goal.disposition === 'excluded' && goal.text === text),
    )
  )
    errors.push('excluded strings must match explicitly authorized scope entries')
  return [...new Set(errors)]
}

export function calculateEvidenceCoverage({
  plan,
  manifests,
  validationFailures,
  currentFingerprint,
  currentPolicyVersion,
}) {
  const historical = plan.metadata.status === 'done'
  return (plan.metadata.required_evidence || []).map((id) => {
    const binding = plan.metadata.evidence?.find((item) => item.id === id)
    const manifest = manifests.get(binding?.run_id)
    let status = 'passed'
    let reason = 'current evidence is valid'
    if (!binding || !manifest) {
      status = 'missing'
      reason = 'no run is bound to this evidence requirement'
    } else if (
      manifest.plan_id !== plan.metadata.id ||
      manifest.evidence_id !== id ||
      manifest.status !== 'passed' ||
      manifest.exit_code !== 0
    ) {
      status = 'invalid'
      reason = 'the bound run failed or belongs to a different Plan/evidence item'
    } else {
      const failure = validationFailures.find((item) => item.startsWith(`evidence ${id} `))
      if (failure) {
        status = 'invalid'
        reason = failure.replace(`evidence ${id} `, '')
      } else if (!historical && manifest.input_fingerprint !== currentFingerprint) {
        status = 'stale'
        reason = 'repository or Plan inputs changed after this run'
      } else if (!historical && manifest.check_policy_version !== currentPolicyVersion) {
        status = 'stale'
        reason = 'the check policy changed after this run'
      }
    }
    return {
      plan_id: plan.metadata.id,
      evidence_id: id,
      run_id: binding?.run_id || null,
      status,
      reason,
    }
  })
}

export function renderPlanProgress(metadata) {
  return [
    '<!-- ignite-progress -->',
    '',
    `状态：\`${metadata.status}\`（由元数据生成）`,
    '',
    ...(metadata.tasks || []).map(
      (task) =>
        `- [${task.status === 'done' ? 'x' : ' '}] ${task.id} · ${task.title} · ${task.status}`,
    ),
    '',
    `验收缺口：${(metadata.remaining_work || []).join('；') || '未记录；完成仍须实际证据'}`,
    `证据：${(metadata.evidence || []).map((item) => `${item.id} / ${item.run_id}`).join('；') || '尚无'}`,
    '<!-- /ignite-progress -->',
  ].join('\n')
}

export function renderPlanProgressContent(content, metadata) {
  const block = renderPlanProgress(metadata)
  const starts = content.match(/<!-- ignite-progress -->/g)?.length || 0
  const ends = content.match(/<!-- \/ignite-progress -->/g)?.length || 0
  if (starts !== ends || starts > 1) throw new Error('Plan has malformed ignite-progress markers')
  return starts === 1
    ? content.replace(/<!-- ignite-progress -->[\s\S]*?<!-- \/ignite-progress -->/, block)
    : `${content.trimEnd()}\n\n${block}\n`
}
