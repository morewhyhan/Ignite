import { acceptanceTestHasScaffoldFailure, acceptanceTestTitles } from './source-analysis.mjs'
import { renderPlanProgressContent } from './execution-contract.mjs'
import { validateLocalLinks, markdownHeadings } from './document-contract.mjs'
import { repositoryRoot } from './core.mjs'
import {
  listPlans,
  listReleases,
  readRepositoryText,
  specificationRegistry,
  validatePlan,
  validatePlanDependencies,
  validatePlanReleaseContract,
  validateRelease,
} from './state.mjs'

function normalizeScope(scope) {
  return typeof scope === 'string' ? scope.replaceAll('\\', '/').replace(/\/+$/, '') : ''
}

function scopesOverlap(left, right) {
  const a = normalizeScope(left)
  const b = normalizeScope(right)
  return Boolean(a && b && (a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)))
}

function tasksDependOn(tasks, taskId, dependencyId) {
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const visited = new Set()
  const visit = (id) => {
    if (visited.has(id)) return false
    visited.add(id)
    for (const dependency of byId.get(id)?.depends_on || []) {
      if (dependency === dependencyId || visit(dependency)) return true
    }
    return false
  }
  return visit(taskId)
}

/**
 * @typedef {{code: 'scope-split-review', task_ids: string[], scopes: string[], blocking: false, message: string} |
 * {code: 'parallel-readiness', task_ids: string[], state: 'scope-overlap' | 'shared-file-owner-mismatch' | 'interface-unknown' | 'owner-not-separated' | 'candidate', shared_acceptance: boolean, blocking: false, message: string}} PlanningDiagnostic
 */
/** @returns {PlanningDiagnostic[]} */
export function planningDiagnostics(plan) {
  const allTasks = plan.metadata.tasks || []
  const tasks = allTasks.filter((task) => task.phase === 'implement')
  /** @type {PlanningDiagnostic[]} */
  const diagnostics = []

  for (const task of tasks) {
    const scopes = [...new Set((task.scope || []).map(normalizeScope).filter(Boolean))]
    const disjointScopes = scopes.every((scope, index) =>
      scopes.slice(index + 1).every((other) => !scopesOverlap(scope, other)),
    )
    if (scopes.length > 1 && disjointScopes) {
      diagnostics.push({
        code: 'scope-split-review',
        task_ids: [task.id],
        scopes,
        blocking: false,
        message:
          'This implementation task writes to separate path scopes. Check whether each scope can deliver a verifiable result behind a known interface before splitting it.',
      })
    }
  }

  const interfaces = plan.metadata.handoff?.interfaces || []
  for (let leftIndex = 0; leftIndex < tasks.length; leftIndex += 1) {
    for (const right of tasks.slice(leftIndex + 1)) {
      const left = tasks[leftIndex]
      if (tasksDependOn(allTasks, left.id, right.id) || tasksDependOn(allTasks, right.id, left.id))
        continue
      const leftScopes = (left.scope || []).map(normalizeScope).filter(Boolean)
      const rightScopes = (right.scope || []).map(normalizeScope).filter(Boolean)
      if (!leftScopes.length || !rightScopes.length) continue

      const overlap = leftScopes.some((scope) =>
        rightScopes.some((other) => scopesOverlap(scope, other)),
      )
      const leftAcceptance = new Set(left.acceptance || [])
      const sharedAcceptance = (right.acceptance || []).some((id) => leftAcceptance.has(id))
      const interfaceKnown = interfaces.some(
        (item) =>
          item.contract?.trim() &&
          ((item.owner === left.owner && item.consumer === right.owner) ||
            (item.owner === right.owner && item.consumer === left.owner)),
      )
      const separateOwners = left.owner && right.owner && left.owner !== right.owner
      const sharedFileOwnershipValid = (plan.metadata.shared_files || []).every((claim) => {
        const sharedPath = normalizeScope(claim.path)
        const leftOwnsPath = leftScopes.some((scope) => scopesOverlap(scope, sharedPath))
        const rightOwnsPath = rightScopes.some((scope) => scopesOverlap(scope, sharedPath))
        return (
          (!leftOwnsPath || claim.owner === left.owner) &&
          (!rightOwnsPath || claim.owner === right.owner)
        )
      })
      const state = overlap
        ? 'scope-overlap'
        : !sharedFileOwnershipValid
          ? 'shared-file-owner-mismatch'
          : !interfaceKnown
            ? 'interface-unknown'
            : !separateOwners
              ? 'owner-not-separated'
              : 'candidate'
      diagnostics.push({
        code: 'parallel-readiness',
        task_ids: [left.id, right.id],
        state,
        shared_acceptance: sharedAcceptance,
        blocking: false,
        message:
          state === 'candidate'
            ? `These implementation tasks have separate declared scopes, owners and an interface contract. They are candidates for parallel dispatch when their red prerequisites are satisfied${sharedAcceptance ? '; both may cover the same AC behind the same valid red evidence' : ''}.`
            : `These implementation tasks are not yet established as independent (${state}). Keep them coordinated until the scopes, acceptance and interface support a safe split.`,
      })
    }
  }

  return diagnostics
}

export function preparationReport(plan) {
  const metadata = { ...structuredClone(plan.metadata), status: 'ready' }
  const candidate = {
    ...plan,
    metadata,
    content: renderPlanProgressContent(plan.content, metadata),
  }
  const raw = validatePlan(candidate, { allowLegacy: false })
  const pending_tests = []
  for (const criterion of metadata.acceptance || []) {
    for (const test of criterion.tests || []) {
      const path = test.split('::', 1)[0]
      const content = readRepositoryText(path)
      const reason =
        content === null
          ? 'test-not-written'
          : !acceptanceTestTitles(content).has(criterion.id)
            ? 'acceptance-not-tagged'
            : acceptanceTestHasScaffoldFailure(content, criterion.id)
              ? 'scaffold-test'
              : null
      if (reason) pending_tests.push({ acceptance_id: criterion.id, test, reason })
    }
  }
  const failures = raw.filter(
    (error) =>
      !/references missing test |still contains a scaffold failure placeholder/.test(error),
  )
  failures.push(...validateLocalLinks(repositoryRoot, plan.relativePath, plan.content))
  const registry = specificationRegistry()
  for (const id of registry.duplicates) failures.push(`duplicate specification id: ${id}`)
  const featurePaths = new Set(
    (metadata.requirements || []).map((id) => registry.requirements.get(id)).filter(Boolean),
  )
  for (const path of featurePaths) {
    const text = readRepositoryText(path)
    const headings = new Set(markdownHeadings(text))
    for (const heading of ['## 背景与目标', '## 业务规则', '## 验收标准'])
      if (!headings.has(heading)) failures.push(`${path}: missing heading "${heading}"`)
    for (const error of validateLocalLinks(repositoryRoot, path, text))
      failures.push(`${path}: ${error}`)
  }
  const plans = listPlans().map((item) => (item.metadata?.id === metadata.id ? candidate : item))
  const release = listReleases().find(({ value }) => value.id === metadata.release)?.value
  failures.push(
    ...validatePlanReleaseContract(candidate, release),
    ...validatePlanDependencies(candidate, plans),
  )
  if (release)
    failures.push(
      ...validateRelease(release, new Map(plans.map((item) => [item.metadata?.id, item]))),
    )
  const unique = [...new Set(failures)]
  return {
    scope: 'document-preparation',
    plan_id: metadata.id,
    status: unique.length ? 'invalid' : 'prepared',
    failures: unique,
    pending_tests,
    planning_diagnostics: planningDiagnostics(plan),
    ready: !unique.length && !pending_tests.length,
    behavior_verification: 'not-run',
    semantic_review: 'compare-original-user-goals',
    next_action: unique.length
      ? 'Correct the reported document defects and rerun this preparation check.'
      : pending_tests.length
        ? 'Preparation structure is valid. Keep draft while tests are prohibited; otherwise write the declared behavior tests before ready.'
        : 'Preparation structure permits ready; no behavior or Release verification has been performed.',
  }
}
