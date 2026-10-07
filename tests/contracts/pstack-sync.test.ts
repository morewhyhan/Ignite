import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'

const script = pathToFileURL(resolve(import.meta.dirname, '../../scripts/pstack-sync.mjs')).href

it('synchronizes canonical project skills without overwriting user skills or mutating read-only checks', () => {
  const root = mkdtempSync(join(tmpdir(), 'ignite-skills-'))
  const put = (path: string, content: string) => {
    mkdirSync(join(root, path, '..'), { recursive: true })
    writeFileSync(join(root, path), content)
  }
  const run = (write: boolean) =>
    spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import { synchronize } from ${JSON.stringify(script)}; console.log(JSON.stringify(await synchronize(process.argv[1], process.argv[2] === 'true')))`,
        root,
        String(write),
      ],
      { encoding: 'utf8' },
    )
  try {
    put('.ai/pstack/sources.json', '{"schema":1,"upstream_commit":"retained-pin","files":[]}\n')
    put(
      '.ai/skills/example/SKILL.md',
      '---\nname: example\ndescription: First description\n---\n\nDo the work.\n',
    )
    expect(run(false).status).toBe(0)
    const written = run(true)
    expect(written.stderr).toBe('')
    expect(written.status).toBe(0)
    for (const platform of ['.agents', '.claude', '.cursor', '.opencode']) {
      const bridge = readFileSync(join(root, platform, 'skills/example/SKILL.md'), 'utf8')
      expect(bridge).toContain('description: First description')
      expect(bridge).toContain('[canonical skill](../../../.ai/skills/example/SKILL.md)')
      expect(bridge).not.toContain('Do the work.')
    }
    expect(JSON.parse(run(false).stdout)).toEqual([])
    const before = readFileSync(join(root, '.agents/skills/example/SKILL.md'), 'utf8')
    put(
      '.ai/skills/example/SKILL.md',
      '---\nname: example\ndescription: Updated description\n---\n',
    )
    expect(JSON.parse(run(false).stdout)).toHaveLength(5)
    expect(readFileSync(join(root, '.agents/skills/example/SKILL.md'), 'utf8')).toBe(before)
    put('.cursor/skills/example/SKILL.md', 'User-owned skill.\n')
    const conflict = run(true)
    expect(conflict.status).toBe(1)
    expect(conflict.stderr).toContain('Refusing to overwrite a non-generated skill')
    expect(readFileSync(join(root, '.agents/skills/example/SKILL.md'), 'utf8')).toBe(before)
    expect(readFileSync(join(root, '.cursor/skills/example/SKILL.md'), 'utf8')).toBe(
      'User-owned skill.\n',
    )
    expect(
      JSON.parse(readFileSync(join(root, '.ai/pstack/sources.json'), 'utf8')).upstream_commit,
    ).toBe('retained-pin')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
