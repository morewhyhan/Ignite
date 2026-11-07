import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const readme = readFileSync('docs/plans/README.md', 'utf8')

it('[AC-SPEC-017]', () => {
  const hasSection = readme.includes('## 免 Plan 通道与纯文档计划')
  const hasEvidence = readme.includes('check-docs') && readme.includes('write_scope')
  expect(hasSection && hasEvidence, '[AC-SPEC-017] target plan rules document both channels').toBe(
    true,
  )
})
