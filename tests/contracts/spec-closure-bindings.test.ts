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
  it('[AC-SPEC-006] plan template demonstrates a complete binding list', () => {
    const meta = metadataOf(read('docs/plans/_template.md'))
    expect(meta.binding_contract, '[AC-SPEC-006] target template binding contract').toBe(1)
    const bindings = meta.bindings as unknown[]
    expect(Array.isArray(bindings) && bindings.length > 0, '[AC-SPEC-006] target template bindings').toBe(true)
    expect(validateBindings(meta as never), '[AC-SPEC-006] target template bindings validate').toEqual([])
  })

  it('[AC-SPEC-006] plan validation rejects a plan that lost an acceptance binding', () => {
    const content = read(PLAN_PATH)
    const plan = {
      path: join(repositoryRoot, PLAN_PATH),
      relativePath: PLAN_PATH,
      content,
      metadata: metadataOf(content),
    }
    expect(validatePlan(plan as never, { allowLegacy: false }), '[AC-SPEC-006] target intact plan').toEqual([])
    const broken = structuredClone(plan)
    broken.metadata.bindings = (broken.metadata.bindings as { source: string }[]).filter(
      (binding) => binding.source !== 'AC-SPEC-006',
    )
    expect(validatePlan(broken as never, { allowLegacy: false }), '[AC-SPEC-006] target missing acceptance binding').toContain(
      'AC-SPEC-006: no binding',
    )
  })

  it('[AC-SPEC-006] validator reports missing, duplicate and unknown-task bindings', () => {
    expect(validateBindings(complete as never), '[AC-SPEC-006] target complete bindings').toEqual([])
    expect(
      validateBindings({ ...complete, requirements: ['REQ-SPEC-006', 'REQ-SPEC-999'] } as never),
      '[AC-SPEC-006] target missing requirement binding',
    ).toContain('REQ-SPEC-999: no binding')
    expect(
      validateBindings({ ...complete, acceptance: [{ id: 'AC-SPEC-006' }, { id: 'AC-SPEC-999' }] } as never),
      '[AC-SPEC-006] target missing acceptance binding',
    ).toContain('AC-SPEC-999: no binding')
    expect(
      validateBindings({ ...complete, bindings: [...complete.bindings, { ...complete.bindings[0] }] } as never),
      '[AC-SPEC-006] target duplicate binding',
    ).toContain('duplicate binding id: BIND-001')
    expect(
      validateBindings({ ...complete, bindings: [{ ...complete.bindings[0], task: 'T9' }, complete.bindings[1]] } as never),
      '[AC-SPEC-006] target unknown task',
    ).toContain('BIND-001: unknown task T9')
  })
})
