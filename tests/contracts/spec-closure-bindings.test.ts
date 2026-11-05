import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'
import { validateBindings } from '../../scripts/ignite/binding-contract.mjs'

const read = (path: string) => readFileSync(join(repositoryRoot, path), 'utf8')

function templateMetadata() {
  const text = read('docs/plans/_template.md')
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
  it('[AC-SPEC-006] plan template declares the binding contract and a bindings list', () => {
    const meta = templateMetadata()
    expect(meta.binding_contract, '[AC-SPEC-006] target template binding contract').toBe(1)
    expect(Array.isArray(meta.bindings), '[AC-SPEC-006] target template bindings').toBe(true)
  })

  it('[AC-SPEC-006] validator reports missing, duplicate and unknown-task bindings', () => {
    expect(validateBindings(complete), '[AC-SPEC-006] target complete bindings').toEqual([])
    expect(
      validateBindings({ ...complete, requirements: ['REQ-SPEC-006', 'REQ-SPEC-999'] }),
      '[AC-SPEC-006] target missing binding',
    ).toContain('REQ-SPEC-999: no binding')
    expect(
      validateBindings({ ...complete, bindings: [...complete.bindings, { ...complete.bindings[0] }] }),
      '[AC-SPEC-006] target duplicate binding',
    ).toContain('duplicate binding id: BIND-001')
    expect(
      validateBindings({ ...complete, bindings: [{ ...complete.bindings[0], task: 'T9' }, complete.bindings[1]] }),
      '[AC-SPEC-006] target unknown task',
    ).toContain('BIND-001: unknown task T9')
  })
})
