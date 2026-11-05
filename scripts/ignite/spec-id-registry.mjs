import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export const RULE_PATTERN = /^- (STD-[A-Z]+-\d{3}|DES-[A-Z]+-\d{3})：/m
export const DECISION_PATTERN = /^#\s+(ADR-\d{4})\b/m
const REFERENCE_PATTERNS = [/\bSTD-[A-Z]+-\d{3}\b/g, /\bDES-[A-Z]+-\d{3}\b/g, /\bADR-\d{4}\b/g]

export function collectSpecificationIds(entries) {
  const byId = new Map()
  const duplicates = []
  for (const { path, text } of entries) {
    const ids = [...text.matchAll(new RegExp(RULE_PATTERN.source, 'gm'))].map((match) => match[1])
    const decision = text.match(DECISION_PATTERN)?.[1]
    for (const id of decision ? [...ids, decision] : ids) {
      if (byId.has(id)) duplicates.push({ id, first: byId.get(id), second: path })
      else byId.set(id, path)
    }
  }
  return { byId, duplicates }
}

export function filesWithoutIds(entries) {
  return entries
    .filter(({ text }) => !RULE_PATTERN.test(text) && !DECISION_PATTERN.test(text))
    .map(({ path }) => path)
}

export function unknownReferences(text, byId) {
  const prose = String(text).replace(/<!-- ignite-plan[\s\S]*?-->/, '')
  const unknown = new Set()
  for (const pattern of REFERENCE_PATTERNS)
    for (const match of prose.match(pattern) || []) if (!byId.has(match)) unknown.add(match)
  return [...unknown].sort()
}

export function sourceEntries(root, dirs) {
  const entries = []
  for (const dir of dirs)
    for (const name of readdirSync(join(root, dir))) {
      if (!name.endsWith('.md') || name === 'README.md') continue
      entries.push({ path: dir + '/' + name, text: readFileSync(join(root, dir, name), 'utf8') })
    }
  return entries
}
