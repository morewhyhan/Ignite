import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'
import {
  collectSpecificationIds,
  filesWithoutIds,
  sourceEntries,
  unknownReferences,
} from '../../scripts/ignite/spec-id-registry.mjs'

const entries = sourceEntries(repositoryRoot, ['docs/standards', 'docs/designs', 'docs/others/adr'])
const { byId, duplicates } = collectSpecificationIds(entries)

describe('specification identifiers', () => {
  it('[AC-SPEC-004] every source file carries a unique identifier', () => {
    expect(entries.length, '[AC-SPEC-004] target file count').toBe(20)
    expect(filesWithoutIds(entries), '[AC-SPEC-004] target missing identifiers').toEqual([])
    expect(duplicates, '[AC-SPEC-004] target duplicates').toEqual([])
  })

  it('[AC-SPEC-004] duplicate identifiers are reported with both locations', () => {
    expect(
      collectSpecificationIds([
        { path: 'docs/standards/a.md', text: '- STD-ARCH-101：第一条\n' },
        { path: 'docs/standards/b.md', text: '- STD-ARCH-101：重复\n' },
      ]).duplicates,
      '[AC-SPEC-004] target duplicate detection',
    ).toEqual([{ id: 'STD-ARCH-101', first: 'docs/standards/a.md', second: 'docs/standards/b.md' }])
  })

  it('[AC-SPEC-005] unknown references are rejected and placeholders ignored', () => {
    expect(unknownReferences('依据 STD-ARCH-101 实现', byId), '[AC-SPEC-005] target known reference').toEqual([])
    expect(unknownReferences('依据 STD-ARCH-999 实现', byId), '[AC-SPEC-005] target unknown reference').toEqual(['STD-ARCH-999'])
    expect(unknownReferences('格式写作 ADR-NNNN 与 STD-<区>-NNN', byId), '[AC-SPEC-005] target placeholders').toEqual([])
  })
})
