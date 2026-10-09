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
    (metadata.requirements || []).map((id) => registry.requirements.get(id)?.path).filter(Boolean),
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
