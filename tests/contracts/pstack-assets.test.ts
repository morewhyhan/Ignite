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
  expect(manifest.files).toHaveLength(164)
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
  for (const directory of [
    '.agents/skills',
    '.claude/skills',
    '.cursor/skills',
    '.opencode/skills',
  ]) {
    const base = join(root, directory)
    const skills = readdirSync(base, { withFileTypes: true }).filter((entry) => entry.isDirectory())
    expect(skills).toHaveLength(54)
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
})

it('[AC-PSTACK-003] resolves the project adapter from every inherited Markdown entrypoint', () => {
  for (const file of manifest.files.filter((entry) => entry.path.endsWith('.md'))) {
    const path = join(methods, file.path)
    const content = readFileSync(path, 'utf8')
    const link = content.match(/\[ADAPTER\.md\]\(([^)]+)\)/)?.[1]
    expect(link, file.path).toBeDefined()
    expect(resolve(dirname(path), link!), file.path).toBe(join(methods, 'ADAPTER.md'))
  }
})
