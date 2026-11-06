import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'

const root = process.cwd()
const designs = join(root, 'docs', 'designs')
const designFiles = readdirSync(designs)
  .filter((name) => name.endsWith('.md') && name !== 'README.md')
  .sort()
const ledgerPath = join(root, 'docs', 'others', 'design-writeback.md')

it('[AC-SPEC-012] marks every design document as current fact or target design', () => {
  const missing = designFiles.filter((name) => {
    const content = readFileSync(join(designs, name), 'utf8')
    return !/^> 状态：(当前事实|目标设计)$/m.test(content)
  })
  expect(missing, `design documents without a 状态 marker: ${missing.join(', ')}`).toEqual([])
})

it('[AC-SPEC-013] write-back ledger lists every design document and its owning plan', () => {
  expect(existsSync(ledgerPath), 'docs/others/design-writeback.md is missing').toBe(true)
  const content = readFileSync(ledgerPath, 'utf8')
  const missing = designFiles.filter((name) => !content.includes(name))
  expect(missing, `write-back ledger does not mention: ${missing.join(', ')}`).toEqual([])
  expect(/IGT-\d{3,}/.test(content), 'write-back ledger has no plan id').toBe(true)
})
