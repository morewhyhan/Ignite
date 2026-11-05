import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'
import { validateBindings } from '../../scripts/ignite/binding-contract.mjs'
import { validatePlan } from '../../scripts/ignite/state.mjs'

const read = (path: string) => readFileSync(join(repositoryRoot, path), 'utf8')
const PLAN_PATH = 'docs/plans/20261106-spec-closure-bindings.md'

function metadataOf(text: string) {
  const meta = text.match(/<!-- ignite-plan\n([\s\S]*?)\n-->/)
  return JSON.parse(meta![1]) as Record<string, unknown>
}

const complete = {
  binding_contract: 1,
  requirements: ['REQ-SPEC-006'],
  acceptance: [{ id: 'AC-SPEC-006' }],
  tasks: [{ id: 'T1' }, { id: 'T2' }],
  bindings: [
    { id: 'BIND-001', source: 'REQ-SPEC-006', applicable: '产品要求', status: 'missing', task: 'T1', check: 'AC-SPEC-006' },
    { id: 'BIND-002', source: 'AC-SPEC-006', applicable: '验收', status: 'missing', task: 'T2', check: 'AC-SPEC-006' },
  ],
}

describe('plan binding contract', () => {
  it('[AC-SPEC-006] every applicable source has exactly one usable binding', () => {
    expect(validateBindings(complete as never)).toEqual([])
    expect(validateBindings({ ...complete, requirements: ['REQ-SPEC-006', 'REQ-SPEC-999'] } as never)).toContain(
      'REQ-SPEC-999: no binding',
    )
    expect(validateBindings({ ...complete, acceptance: [{ id: 'AC-SPEC-006' }, { id: 'AC-SPEC-999' }] } as never)).toContain(
      'AC-SPEC-999: no binding',
    )
    expect(
      validateBindings({ ...complete, bindings: [...complete.bindings, { ...complete.bindings[0] }] } as never),
    ).toContain('duplicate binding id: BIND-001')
    expect(
      validateBindings({ ...complete, bindings: [{ ...complete.bindings[0], task: 'T9' }, complete.bindings[1]] } as never),
    ).toContain('BIND-001: unknown task T9')

    const gaps: string[] = []
    const template = metadataOf(read('docs/plans/_template.md'))
    if (template.binding_contract !== 1) gaps.push('template: binding_contract')
    const templateBindings = template.bindings as unknown[]
    if (!Array.isArray(templateBindings) || templateBindings.length === 0) gaps.push('template: bindings')
    gaps.push(...validateBindings(template as never))

    const content = read(PLAN_PATH)
    const plan = { path: join(repositoryRoot, PLAN_PATH), relativePath: PLAN_PATH, content, metadata: metadataOf(content) }
    gaps.push(...validatePlan(plan as never, { allowLegacy: false }))
    const broken = structuredClone(plan)
    broken.metadata.bindings = (broken.metadata.bindings as { source: string }[]).filter(
      (binding) => binding.source !== 'AC-SPEC-006',
    )
    const brokenFailures = validatePlan(broken as never, { allowLegacy: false })
    if (!brokenFailures.includes('AC-SPEC-006: no binding')) gaps.push('plan validation ignores missing binding')

    expect(gaps, '[AC-SPEC-006] target binding contract gaps').toEqual([])
  })
})
