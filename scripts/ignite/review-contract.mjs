import {
  changedFilesForPlan,
  changedFilesForPlanAtCommit,
  hash,
  isExecutionStatePath,
  runGit,
  stablePlanContract,
  workingPathBlobIdentity,
} from './core.mjs'

const text = (value) => typeof value === 'string' && value.trim().length > 0
const stages = new Set(['draft', 'delivery'])

function planNarrative(content) {
  return content
    .replace(/<!-- ignite-plan[\s\S]*?-->/, '')
    .replace(/<!-- ignite-progress -->[\s\S]*?<!-- \/ignite-progress -->/g, '')
    .split(/(?=^## )/m)
    .filter((section) => !/^## (?:状态|状态记录)\s*$/m.test(section.split('\n')[0]))
    .join('\n')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

export function buildReviewContext(plan, stage, { featurePaths, readText, commit = null }) {
  if (!stages.has(stage)) throw new Error('review stage must be draft or delivery')
  const value = plan.metadata
  const inputPaths =
    stage === 'delivery'
      ? (commit ? changedFilesForPlanAtCommit(plan, commit) : changedFilesForPlan(plan))
          .filter((path) => !isExecutionStatePath(path))
          .filter((path) =>
            (value.write_scope || []).some(
              (scope) =>
                typeof scope === 'string' &&
                (scope.endsWith('/') ? path.startsWith(scope) : path === scope),
            ),
          )
      : []
  const inputs = inputPaths.map((path) => {
    if (!commit) return { path, identity: workingPathBlobIdentity(path) }
    const result = runGit(['rev-parse', `${commit}:${path}`], { allowFailure: true })
    return { path, identity: result.status === 0 ? result.stdout.trim() : null }
  })
  const subject = {
    contract: {
      ...stablePlanContract(value),
      review_contract: value.review_contract,
      goals: value.goals || [],
      constraints: value.constraints || [],
      non_goals: value.non_goals || [],
      authorization: value.authorization || null,
      owner: value.owner,
      tasks: (value.tasks || []).map(({ status, ...task }) => task),
    },
    narrative: planNarrative(readText(plan.relativePath, commit) || plan.content),
    features: [...featurePaths].sort().map((path) => ({ path, content: readText(path, commit) })),
    ...(stage === 'delivery' ? { inputs } : {}),
  }
  return {
    plan_id: value.id,
    stage,
    executor: value.owner,
    review_contract: value.review_contract ?? null,
    identity_assurance: 'declared',
    subject_fingerprint: hash(JSON.stringify(subject)),
    plan: plan.relativePath,
    features: subject.features.map(({ path }) => path),
    goals: subject.contract.goals,
    acceptance: value.acceptance || [],
    write_scope: value.write_scope || [],
    implementation_owners: [
      ...new Set(
        (value.tasks || [])
          .filter((task) => task.phase === 'implement')
          .map((task) => task.owner)
          .filter(text),
      ),
    ],
    inputs,
  }
}

export function validateReviewRecord(record, context, { requireCurrent = true } = {}) {
  const errors = []
  if (!record || typeof record !== 'object' || Array.isArray(record))
    return ['review record must be an object']
  if (record.stage !== context.stage)
    errors.push('review stage does not match the requested object')
  if (!text(record.reviewer) || !text(record.executor) || !text(record.source))
    errors.push('review requires reviewer, executor and an actual source declaration')
  if (record.executor !== context.executor) errors.push('review executor must equal the Plan owner')
  if (
    record.reviewer === context.executor ||
    context.implementation_owners.includes(record.reviewer)
  )
    errors.push('reviewer must be independent of the owner and implementation task owners')
  if (
    [record.executor, record.reviewer, record.source].some((value) =>
      /assigned-worker|待填写|待确认|<[^>]+>/.test(value || ''),
    )
  )
    errors.push('review executor, reviewer and source must identify the actual roles and origin')
  if (
    !/^[a-f0-9]{64}$/.test(record.subject_fingerprint || '') ||
    (requireCurrent && record.subject_fingerprint !== context.subject_fingerprint)
  )
    errors.push(`${context.stage} review fingerprint is stale or does not match the current object`)
  if (!['approved', 'needs-revision'].includes(record.verdict))
    errors.push('review verdict must be approved or needs-revision')
  if (!Array.isArray(record.findings)) errors.push('review findings must be an array')
  else {
    const ids = new Set()
    for (const finding of record.findings) {
      if (
        !finding ||
        !text(finding.id) ||
        ids.has(finding.id) ||
        !text(finding.summary) ||
        !['blocking', 'nonblocking'].includes(finding.severity) ||
        typeof finding.resolved !== 'boolean'
      )
        errors.push('review findings require unique id, summary, severity and resolved')
      if (finding) ids.add(finding.id)
      if (record.verdict === 'approved' && finding?.severity === 'blocking' && !finding.resolved)
        errors.push('approved review cannot retain an unresolved blocking finding')
    }
  }
  return errors
}

export function validateReviewGate(plan, context) {
  const value = plan.metadata
  if (value.review_contract === undefined) return []
  if (value.review_contract !== 1) return ['review_contract must be 1']
  if (!Array.isArray(value.reviews)) return ['reviews must be an array for review_contract 1']
  const candidates = value.reviews.filter((record) => record?.stage === context.stage)
  const latest = candidates.at(-1)
  if (!latest) return [`${context.stage} review is required for this Plan object`]
  const errors = validateReviewRecord(latest, context)
  if (latest.verdict !== 'approved')
    errors.push(`${context.stage} review requires revision before admission`)
  return errors
}
