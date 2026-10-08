import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const methods = join(root, '.ai/pstack')
const manifest = JSON.parse(readFileSync(join(methods, 'sources.json'), 'utf8')) as {
  files: { path: string; local_sha256: string; upstream_sha256: string; adapted: boolean }[]
}

it('[AC-PSTACK-001] resolves every migrated upstream resource and verifies retained file bytes', () => {
  expect(manifest.files).toHaveLength(152)
  for (const file of manifest.files) {
    const actual = createHash('sha256')
      .update(readFileSync(join(methods, file.path)))
      .digest('hex')
    expect(actual, file.path).toBe(file.local_sha256)
    if (!file.adapted) expect(actual, file.path).toBe(file.upstream_sha256)
  }
  expect(readFileSync(join(methods, 'LICENSE'), 'utf8')).toContain('Lauren Tan')
})

it('[AC-PSTACK-002] follows each platform discovery bridge to a canonical skill inside the cloned project', () => {
  const inheritedNames = new Set(
    manifest.files
      .filter((file) => file.path.endsWith('/SKILL.md'))
      .map((file) => file.path.split('/').at(-2)!),
  )
  for (const directory of ['.agents/skills', '.claude/skills']) {
    const base = join(root, directory)
    const skills = readdirSync(base, { withFileTypes: true }).filter(
      (entry) => entry.isDirectory() && inheritedNames.has(entry.name),
    )
    expect(skills).toHaveLength(51)
    for (const skill of skills) {
      const file = join(base, skill.name, 'SKILL.md')
      const content = readFileSync(file, 'utf8')
      const link = content.match(/\[canonical skill\]\(([^)]+)\)/)?.[1]
      expect(link, file).toBeDefined()
      const target = resolve(dirname(file), link!)
      expect(relative(methods, target).startsWith('..'), file).toBe(false)
      expect(existsSync(target), file).toBe(true)
      expect(content).not.toMatch(/[A-Z]:[\\/]|TEMP[\\/]/)
    }
  }
  for (const directory of ['.cursor/skills', '.opencode/skills']) {
    for (const name of inheritedNames) {
      expect(existsSync(join(root, directory, name, 'SKILL.md'))).toBe(false)
    }
  }
})

it('[AC-PSTACK-003] reads inherited methods and discovery bridges without an adapter prerequisite', () => {
  expect(existsSync(join(methods, 'ADAPTER.md'))).toBe(false)
  for (const file of manifest.files.filter((entry) => entry.path.endsWith('.md'))) {
    expect(readFileSync(join(methods, file.path), 'utf8'), file.path).not.toContain('ADAPTER.md')
  }
  for (const directory of ['.agents/skills', '.claude/skills']) {
    for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const path = join(root, directory, entry.name, 'SKILL.md')
      expect(readFileSync(path, 'utf8'), path).not.toContain('ADAPTER.md')
    }
  }
  for (const path of [
    'AGENTS.md',
    '.ai/README.md',
    '.ai/skills/README.md',
    '.ai/pstack/CATALOG.md',
  ]) {
    expect(readFileSync(join(root, path), 'utf8'), path).not.toContain('ADAPTER.md')
  }
})
