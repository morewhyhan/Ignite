import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'

const root = process.cwd()
const designs = join(root, 'docs', 'designs')
const designFiles = readdirSync(designs)
  .filter((name) => name.endsWith('.md') && name !== 'README.md')
  .sort()
const ledgerPath = join(root, 'docs', 'others', 'design-writeback.md')

it('[AC-SPEC-012]', () => {
  const missing = designFiles.filter((name) => {
    const content = readFileSync(join(designs, name), 'utf8')
    return !/^> 状态：(当前事实|目标设计)$/m.test(content)
  })
  expect(missing, '[AC-SPEC-012] target every design document declares a state marker').toEqual([])
})

it('[AC-SPEC-013]', () => {
  const ledger = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : ''
  const problems = []
  if (!ledger) problems.push('docs/others/design-writeback.md is missing')
  else {
    for (const name of designFiles)
      if (!ledger.includes(name)) problems.push('missing row: ' + name)
    if (!/IGT-\d{3,}/.test(ledger)) problems.push('no plan id recorded')
  }
  expect(problems, '[AC-SPEC-013] target write-back ledger covers every design document').toEqual(
    [],
  )
})
