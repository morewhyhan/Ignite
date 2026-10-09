import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'
import { z } from 'zod'
import { repositoryRoot, write } from './ignite-fixture'

const methodOwners = [
  'docs/features/README.md',
  'docs/plans/README.md',
  'docs/designs/README.md',
  'docs/standards/ai-agents.md',
  'docs/standards/testing.md',
  'docs/others/evidence/README.md',
  'docs/others/adr/README.md',
  'docs/plans/releases/README.md',
  'docs/others/test-cases/README.md',
]
const scriptUrl = pathToFileURL(join(repositoryRoot, 'scripts/pstack-sync.mjs')).href

function localLinks(root: string, document: string) {
  const content = readFileSync(join(root, document), 'utf8')
  return [...content.matchAll(/\[[^\]]*\]\(\s*<?([^\s)>]+)>?\s*\)/g)].flatMap((match) => {
    const target = match[1]
    if (!target || target.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(target)) return []
    return [resolve(root, dirname(document), decodeURIComponent(target.split('#')[0]))]
  })
}

function synchronize(root: string, apply: boolean) {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import { synchronize } from ${JSON.stringify(scriptUrl)};
console.log(JSON.stringify(await synchronize(process.argv[1], process.argv[2] === 'true')));`,
      root,
      String(apply),
    ],
    { encoding: 'utf8', windowsHide: true },
  )
  expect(result.status, result.stderr || result.stdout).toBe(0)
  return z.array(z.string()).parse(JSON.parse(result.stdout))
}

it('[AC-PSTACK-004] resolves document method dependencies through synchronized canonical discovery and repairs drift without rewriting method owners', () => {
  const root = mkdtempSync(join(tmpdir(), 'ignite-document-methods-'))
  try {
    cpSync(join(repositoryRoot, '.ai/pstack'), join(root, '.ai/pstack'), { recursive: true })
    if (existsSync(join(repositoryRoot, '.ai/skills'))) {
      cpSync(join(repositoryRoot, '.ai/skills'), join(root, '.ai/skills'), { recursive: true })
    }
    const dependencies = new Set<string>()
    const owners = new Map<string, string>()
    for (const document of methodOwners) {
      const content = readFileSync(join(repositoryRoot, document), 'utf8')
      owners.set(document, content)
      write(root, document, content)
      const skillLinks = localLinks(repositoryRoot, document).filter(
        (path) => basename(path) === 'SKILL.md',
      )
      expect(
        skillLinks.length,
        `${document} must expose its canonical method dependencies`,
      ).toBeGreaterThan(0)
      expect(
        skillLinks.some((path) => basename(dirname(path)).startsWith('principle-')),
        `${document} must expose its applicable principles`,
      ).toBe(true)
      for (const path of skillLinks) {
        expect(existsSync(path), `${document} links to missing skill ${path}`).toBe(true)
        const canonical = relative(repositoryRoot, path)
        expect(canonical.replaceAll('\\', '/')).toMatch(
          /^\.ai\/(?:pstack\/)?skills\/[^/]+\/SKILL\.md$/,
        )
        dependencies.add(canonical)
      }
    }

    synchronize(root, true)
    const catalogLinks = localLinks(root, '.ai/pstack/CATALOG.md')
    for (const canonical of dependencies) {
      const canonicalPath = join(root, canonical)
      const name = basename(dirname(canonicalPath))
      expect(catalogLinks, `catalog must discover ${name}`).toContain(canonicalPath)
      for (const platform of ['.agents', '.claude']) {
        const bridge = `${platform}/skills/${name}/SKILL.md`
        expect(
          localLinks(root, bridge),
          `${bridge} must resolve to the method owner's source`,
        ).toContain(canonicalPath)
      }
    }
    expect(synchronize(root, false)).toEqual([])

    const bridge = '.agents/skills/technical-writing/SKILL.md'
    const intact = readFileSync(join(root, bridge), 'utf8')
    const damaged = intact.replace(
      /\[canonical skill\]\([^)]*\)/,
      '[canonical skill](../../../.ai/skills/missing/SKILL.md)',
    )
    expect(damaged).not.toBe(intact)
    write(root, bridge, damaged)
    expect(synchronize(root, false)).toContain(bridge)
    expect(readFileSync(join(root, bridge), 'utf8')).toBe(damaged)
    synchronize(root, true)
    expect(readFileSync(join(root, bridge), 'utf8')).toBe(intact)
    expect(synchronize(root, false)).toEqual([])
    for (const [document, content] of owners) {
      expect(readFileSync(join(root, document), 'utf8')).toBe(content)
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
