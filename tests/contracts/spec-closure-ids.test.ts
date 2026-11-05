import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'

const RULE = /^- (STD-[A-Z]+-\d{3}|DES-[A-Z]+-\d{3})：/gm
const DECISION = /^#\s+(ADR-\d{4})\b/m

const read = (path) => readFileSync(join(repositoryRoot, path), 'utf8')
const files = (dir) =>
  readdirSync(join(repositoryRoot, dir))
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => `${dir}/${name}`)

const sources = [...files('docs/standards'), ...files('docs/designs'), ...files('docs/others/adr')]

function scan(entries) {
  const byId = new Map()
  const duplicates = []
  for (const { path, text } of entries) {
    const matches = [...text.matchAll(RULE)].map((match) => match[1])
    const decision = text.match(DECISION)?.[1]
    for (const id of decision ? [...matches, decision] : matches) {
      if (byId.has(id)) duplicates.push({ id, first: byId.get(id), second: path })
      else byId.set(id, path)
    }
  }
  return { byId, duplicates }
}

const entries = sources.map((path) => ({ path, text: read(path) }))

describe('specification identifiers', () => {
  it('[AC-SPEC-004] every source file carries unique STD/DES/ADR identifiers', () => {
    expect(sources.length).toBeGreaterThanOrEqual(15)
    const missing = entries.filter(({ text }) => !RULE.test(text) && !DECISION.test(text)).map(({ path }) => path)
    expect(missing).toEqual([])
    expect(scan(entries).duplicates).toEqual([])
  })

  it('[AC-SPEC-004] duplicate identifiers are rejected with both locations', () => {
    expect(
      scan([
        { path: 'docs/standards/a.md', text: '- STD-ARCH-001：第一条\n' },
        { path: 'docs/standards/b.md', text: '- STD-ARCH-001：重复\n' },
      ]).duplicates,
    ).toEqual([{ id: 'STD-ARCH-001', first: 'docs/standards/a.md', second: 'docs/standards/b.md' }])
  })

  it('[AC-SPEC-005] plans cannot cite identifiers that do not exist', () => {
    const { byId } = scan(entries)
    const unknown = (text) =>
      [...new Set(text.match(/\b(?:STD|DES|ADR)-[A-Z0-9-]+\b/g) || [])].filter((id) => !byId.has(id))
    expect(unknown('依据 STD-ARCH-001 与 ADR-0004 实现')).toEqual([])
    expect(unknown('依据 STD-ARCH-999 与 DES-NONE-001 实现')).toEqual([
      'STD-ARCH-999',
      'DES-NONE-001',
    ])
  })
})
