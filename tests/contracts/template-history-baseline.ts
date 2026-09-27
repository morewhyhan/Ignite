import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import { expect } from 'vitest'

export function collectFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collectFiles(path) : entry.isFile() ? [path] : []
  })
}

export function assertTemplateBaselineEvidence(root: string) {
  const project = JSON.parse(readFileSync(join(root, '.ai', 'project.json'), 'utf8')) as {
    mode: string
  }
  if (project.mode !== 'template-baseline') return

  const planFiles = readdirSync(join(root, 'docs', 'plans'))
    .filter((name) => name.endsWith('.md') && !['README.md', '_template.md'].includes(name))
    .sort()
  const plans = planFiles.map((name) => {
    const content = readFileSync(join(root, 'docs', 'plans', name), 'utf8')
    const metadata = content.match(/<!-- ignite-plan\s*([\s\S]*?)\s*-->/)?.[1]
    return metadata ? { name, content, metadata: JSON.parse(metadata) } : null
  })
  const baselinePlans = plans.filter((plan) => plan?.metadata)
  const releases = readdirSync(join(root, 'docs', 'plans', 'releases'))
    .filter((name) => name.endsWith('.json') && !name.startsWith('_'))
    .sort()
    .map((name) => ({
      name,
      value: JSON.parse(readFileSync(join(root, 'docs', 'plans', 'releases', name), 'utf8')),
    }))
  expect(baselinePlans.length).toBeGreaterThan(0)
  expect(existsSync(join(root, 'EXECUTION_AUDIT.md'))).toBe(false)

  for (const plan of baselinePlans) {
    const linkedReleases = releases.filter(
      ({ value }) =>
        value.id === plan?.metadata.release && value.plan_ids?.includes(plan?.metadata.id),
    )
    expect(linkedReleases).toHaveLength(1)
  }

  const linkedReleases = releases.filter(({ value }) =>
    baselinePlans.some((plan) => value.plan_ids?.includes(plan?.metadata.id)),
  )
  const runIds = [
    ...baselinePlans.flatMap(
      (plan) => plan?.metadata.evidence?.map((item: { run_id: string }) => item.run_id) || [],
    ),
    ...linkedReleases.flatMap(
      ({ value }) => value.evidence?.map((item: { run_id: string }) => item.run_id) || [],
    ),
  ].sort()
  const runDirectory = join(root, 'docs', 'others', 'evidence', 'runs')
  const runs = (existsSync(runDirectory) ? readdirSync(runDirectory) : [])
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort()
  expect(runs).toEqual(expect.arrayContaining(runIds))
  const baselinePlanIds = new Set(baselinePlans.map((plan) => plan?.metadata.id))
  for (const runId of runs) {
    const manifest = JSON.parse(readFileSync(join(runDirectory, `${runId}.json`), 'utf8'))
    expect(manifest.run_id).toBe(runId)
    expect(baselinePlanIds.has(manifest.plan_id)).toBe(true)
    expect(manifest.status).toBe('passed')
    expect(manifest.exit_code).toBe(0)
  }

  const tddEvidence = baselinePlans.flatMap(
    (plan) => plan?.metadata.tdd_evidence?.map((item: { run_id: string }) => item.run_id) || [],
  )
  const tddDirectory = join(root, 'docs', 'others', 'evidence', 'tdd')
  const tddRuns = collectFiles(tddDirectory)
    .filter((path) => path.endsWith('.json'))
    .map((path) => basename(path).replace(/\.json$/, ''))
    .sort()
  expect(tddRuns).toEqual(tddEvidence.sort())
}
