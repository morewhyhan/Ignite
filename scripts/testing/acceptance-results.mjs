import { relative, join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { gitCommitExists, repositoryRoot, runGit } from '../ignite/core.mjs'
import { findPlan, listPlans } from '../ignite/state.mjs'

function relevantPlans() {
  if (process.env.IGNITE_PLAN_ID) return [findPlan(process.env.IGNITE_PLAN_ID)]
  if (process.env.CI !== 'true' || !process.env.DIFF_BASE) return []
  const base = /^0{40}$/.test(process.env.DIFF_BASE)
    ? runGit(['rev-list', '--max-parents=0', 'HEAD']).stdout.split(/\r?\n/)[0]
    : process.env.DIFF_BASE
  if (!gitCommitExists(base)) return []
  const changed = new Set(
    runGit(['diff', '--name-only', `${base}...HEAD`, '--', 'docs/plans/'])
      .stdout.split(/\r?\n/)
      .filter(Boolean),
  )
  return listPlans().filter((plan) => plan.metadata?.schema === 2 && changed.has(plan.relativePath))
}

export function acceptanceFailures(cases, runner) {
  const normalized = cases.map((test) => ({
    ...test,
    file: relative(repositoryRoot, test.file).replaceAll('\\', '/'),
    ids: [...test.title.matchAll(/\[(AC-[A-Z0-9-]+)\]/g)].map((match) => match[1]),
  }))
  const failures = normalized
    .filter((test) => test.ids.length && !test.passed)
    .map((test) => `${test.file}: ${test.title} did not complete successfully`)
  const extension = runner === 'vitest' ? /\.test\.tsx?$/ : /\.spec\.tsx?$/
  const results = []
  for (const plan of relevantPlans()) {
    for (const item of plan.metadata.acceptance) {
      for (const mapped of item.tests) {
        const [path, title] = mapped.split('::', 2)
        if (!extension.test(path)) continue
        const matched = normalized.filter(
          (test) =>
            test.file === path &&
            test.ids.includes(item.id) &&
            (!title || title === `[${item.id}]` || test.title === title),
        )
        const passed = matched.length > 0 && matched.every((test) => test.passed)
        if (!passed) {
          failures.push(`${item.id} has no passing result in ${mapped}`)
        }
        results.push(
          ...acceptanceLayerResults({
            planId: plan.metadata.id,
            criterion: item.id,
            test: mapped,
            checks: item.checks || [],
            runner,
            passed,
            cases: matched.length,
          }),
        )
      }
    }
  }
  if (process.env.IGNITE_ACCEPTANCE_RESULTS) {
    mkdirSync(process.env.IGNITE_ACCEPTANCE_RESULTS, { recursive: true })
    writeFileSync(
      join(process.env.IGNITE_ACCEPTANCE_RESULTS, `${runner}.json`),
      JSON.stringify({ runner, results, failures: [...new Set(failures)] }) + '\n',
    )
  }
  return [...new Set(failures)]
}

export function acceptanceLayerResults({ planId, criterion, test, checks, runner, passed, cases }) {
  const mapped = checks.filter((check) => check.test === test).map((check) => check.layer)
  const layers = mapped.length ? mapped : [runner === 'playwright' ? 'browser' : 'unit']
  return [...new Set(layers)].map((layer) => ({
    plan_id: planId,
    criterion,
    test,
    layer,
    passed,
    cases,
  }))
}
