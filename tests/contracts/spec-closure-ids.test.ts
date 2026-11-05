import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'

const RULE = /^- (STD-[A-Z]+-\d{3}|DES-[A-Z]+-\d{3})：/
const RULE_ALL = new RegExp(RULE.source, 'gm')
const DECISION = /^#\s+(ADR-\d{4})\b/m

const read = (path) => readFileSync(join(repositoryRoot, path), 'utf8')
const sources = ['docs/standards', 'docs/designs', 'docs/others/adr'].flatMap((dir) =>
  readdirSync(join(repositoryRoot, dir))
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => ({ path: dir + '/' + name, text: read(dir + '/' + name) })),
)

function scan(entries) {
  const byId = new Map()
  const duplicates = []
  for (const { path, text } of entries) {
    const ids = [...text.matchAll(RULE_ALL)].map((match) => match[1])
    const decision = text.match(DECISION)?.[1]
    for (const id of decision ? [...ids, decision] : ids) {
      if (byId.has(id)) duplicates.push({ id, first: byId.get(id), second: path })
      else byId.set(id, path)
    }
  }
  return { byId, duplicates }
}

describe('specification identifiers', () => {
  it('[AC-SPEC-004] every source file carries a unique identifier', () => {
    const missing = sources.filter(({ text }) => !RULE.test(text) && !DECISION.test(text)).map(({ path }) => path)
    expect(sources.length, '[AC-SPEC-004] source file count').toBe(20)
    expect(missing, '[AC-SPEC-004] files without identifiers').toEqual([])
    expect(scan(sources).duplicates, '[AC-SPEC-004] duplicate identifiers').toEqual([])
  })

  it('[AC-SPEC-004] duplicate identifiers are reported with both locations', () => {
    expect(
      scan([
        { path: 'docs/standards/a.md', text: '- STD-ARCH-001：第一条\n' },
        { path: 'docs/standards/b.md', text: '- STD-ARCH-001：重复\n' },
      ]).duplicates,
      '[AC-SPEC-004] duplicate detection',
    ).toEqual([{ id: 'STD-ARCH-001', first: 'docs/standards/a.md', second: 'docs/standards/b.md' }])
  })

  it('[AC-SPEC-005] unknown references are rejected and placeholders ignored', () => {
    const { byId } = scan(sources)
    const unknown = (text) =>
      [...new Set((text.match(/\b(?:STD|DES)-[A-Z]+-\d{3}\b/g) || []).concat(text.match(/\bADR-\d{4}\b/g) || []))].filter(
        (id) => !byId.has(id),
      )
    expect(unknown('依据 STD-ARCH-001 实现'), '[AC-SPEC-005] known reference').toEqual([])
    expect(unknown('依据 STD-ARCH-999 实现'), '[AC-SPEC-005] unknown standard').toEqual(['STD-ARCH-999'])
    expect(unknown('格式写作 ADR-NNNN 与 STD-<区>-NNN'), '[AC-SPEC-005] placeholders').toEqual([])
  })
})
