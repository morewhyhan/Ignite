import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'

const root = join(import.meta.dirname, '..', '..')

it('[AC-PRODUCT-015] [AC-EXECUTION-009] keeps template history out of a copied baseline', () => {
  const project = JSON.parse(readFileSync(join(root, '.ai', 'project.json'), 'utf8')) as {
    mode: string
  }
  if (project.mode !== 'template-baseline') return

  const plans = readdirSync(join(root, 'docs', 'plans'))
    .filter((name) => name.endsWith('.md') && !['README.md', '_template.md'].includes(name))
    .sort()
  const releases = readdirSync(join(root, 'docs', 'plans', 'releases'))
    .filter((name) => name.endsWith('.json') && !name.startsWith('_'))
    .sort()
  expect(plans).toHaveLength(1)
  expect(releases).toHaveLength(1)
  expect(existsSync(join(root, 'EXECUTION_AUDIT.md'))).toBe(false)

  const currentPlan = readFileSync(join(root, 'docs', 'plans', plans[0]), 'utf8')
  const metadata = JSON.parse(currentPlan.match(/<!-- ignite-plan\s*([\s\S]*?)\s*-->/)![1])
  const release = JSON.parse(
    readFileSync(join(root, 'docs', 'plans', 'releases', releases[0]), 'utf8'),
  )
  expect(release.id).toBe(metadata.release)
  expect(release.plan_ids).toEqual([metadata.id])
  const runIds = [...currentPlan.matchAll(/"run_id": "(run-[^"]+)"/g)].map((match) => match[1])
  const runDirectory = join(root, 'docs', 'others', 'evidence', 'runs')
  const runs = (existsSync(runDirectory) ? readdirSync(runDirectory) : [])
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort()
  expect(runs).toEqual(runIds.sort())
})
