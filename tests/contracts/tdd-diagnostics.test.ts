import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { runManagedCommand } from '../../scripts/ignite/managed-command.mjs'
import { readTddReport } from '../../scripts/ignite/tdd.mjs'

it('[AC-EXECUTION-042] retains the real runner diagnostic when JSON is missing', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'ignite-tdd-diagnostic-'))
  const log = join(directory, 'runner.log')
  const report = join(directory, 'runner.json')
  try {
    const result = await runManagedCommand({
      command: process.execPath,
      args: ['-e', "console.error('browser server failed before readiness'); process.exitCode = 1"],
      cwd: directory,
      env: process.env,
      timeoutMs: 10_000,
    })
    writeFileSync(log, result.stdout + result.stderr)
    expect(result.exitCode).toBe(1)
    expect(() => readTddReport(result, report, log)).toThrow(
      /browser server failed before readiness/,
    )
    expect(readFileSync(log, 'utf8')).toContain('browser server failed before readiness')
    writeFileSync(report, '{"suites":[],"errors":[]}')
    expect(readTddReport(result, report, log)).toEqual({ suites: [], errors: [] })
    expect(readFileSync(report, 'utf8')).toContain('suites')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
