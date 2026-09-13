import { relative } from 'node:path'
import { repositoryRoot } from '../ignite/core.mjs'
import { findPlan } from '../ignite/state.mjs'

export function acceptanceFailures(cases, runner) {
  const normalized = cases.map((test) => ({
    ...test,
    file: relative(repositoryRoot, test.file).replaceAll('\\', '/'),
    ids: [...test.title.matchAll(/\[(AC-[A-Z0-9-]+)\]/g)].map((match) => match[1]),
  }))
  const failures = normalized
    .filter((test) => test.ids.length && !test.passed)
    .map((test) => `${test.file}: ${test.title} did not complete successfully`)
  const planId = process.env.IGNITE_PLAN_ID
  if (!planId) return failures
  const plan = findPlan(planId)
  const extension = runner === 'vitest' ? /\.test\.tsx?$/ : /\.spec\.tsx?$/
  for (const item of plan.metadata.acceptance) {
    for (const mapped of item.tests) {
      const path = mapped.split('::', 1)[0]
      if (!extension.test(path)) continue
      if (
        !normalized.some((test) => test.file === path && test.ids.includes(item.id) && test.passed)
      ) {
        failures.push(`${item.id} has no passing result in ${path}`)
      }
    }
  }
  return [...new Set(failures)]
}
