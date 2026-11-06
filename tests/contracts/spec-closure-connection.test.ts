import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const designs = join(root, 'docs', 'designs')

const designFiles = readdirSync(designs)
  .filter((name) => name.endsWith('.md') && name !== 'README.md')
  .sort()

describe('[AC-SPEC-012] design documents declare fact or target', () => {
  it('marks every design document', () => {
    const missing = designFiles.filter((name) => {
      const content = readFileSync(join(designs, name), 'utf8')
      return !/^> 状态：(当前事实|目标设计)$/m.test(content)
    })
    expect(missing, `design documents without a 状态 marker: ${missing.join(', ')}`).toEqual([])
  })

  it('uses only the two allowed markers', () => {
    const invalid = designFiles.filter((name) => {
      const content = readFileSync(join(designs, name), 'utf8')
      const marker = content.match(/^> 状态：(.+)$/m)
      return marker ? !['当前事实', '目标设计'].includes(marker[1].trim()) : false
    })
    expect(invalid, `design documents with an unknown 状态 value: ${invalid.join(', ')}`).toEqual([])
  })
})

describe('[AC-SPEC-013] write-back ledger lists every design document', () => {
  const ledgerPath = join(root, 'docs', 'others', 'design-writeback.md')

  it('exists and covers all design documents', () => {
    expect(existsSync(ledgerPath), 'docs/others/design-writeback.md is missing').toBe(true)
    const content = readFileSync(ledgerPath, 'utf8')
    const missing = designFiles.filter((name) => !content.includes(name))
    expect(missing, `write-back ledger does not mention: ${missing.join(', ')}`).toEqual([])
  })

  it('records at least one owning plan', () => {
    const content = readFileSync(ledgerPath, 'utf8')
    expect(/IGT-\d{3,}/.test(content), 'write-back ledger has no plan id').toBe(true)
  })
})
