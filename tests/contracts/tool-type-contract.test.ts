import ts from 'typescript'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { commandsForLevel } from '../../scripts/ignite/checks.mjs'

function fieldDiagnostics(source: string) {
  const root = mkdtempSync(join(tmpdir(), 'ignite-tool-types-'))
  const file = join(root, 'execution-contract.mjs')
  const options = {
    allowJs: true,
    checkJs: true,
    noEmit: true,
    types: [],
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
  }
  try {
    writeFileSync(file, source)
    return ts
      .createProgram([file], options)
      .getSemanticDiagnostics()
      .map((item) => item.code)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

describe('execution tool field contracts', () => {
  it('[AC-EXECUTION-051] rejects historical wrong Git and registry field reads', () => {
    expect(
      fieldDiagnostics(
        '/** @type {{exitCode:number}} */ const result = {exitCode: 0}; result.status',
      ),
    ).toContain(2339)
    expect(
      fieldDiagnostics('const requirement = "docs/features/tasks.md"; requirement.path'),
    ).toContain(2339)
    expect(
      fieldDiagnostics(
        '/** @type {{exitCode:number}} */ const result = {exitCode: 0}; result.exitCode',
      ),
    ).toEqual([])
  })

  it('includes the script guard in new integration checks while retaining old policies', () => {
    const plan = { metadata: { risk: 'engineering', acceptance: [] } }
    const current = commandsForLevel('integration', [], plan, 7)
    const old = commandsForLevel('integration', [], plan, 6)
    expect(current.some((command) => command.label === 'tools-typecheck')).toBe(true)
    expect(old.some((command) => command.label === 'tools-typecheck')).toBe(false)
  })
})
