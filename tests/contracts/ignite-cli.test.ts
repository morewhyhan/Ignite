import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const repositoryRoot = process.cwd()
const cliPath = join(repositoryRoot, 'scripts', 'ignite.mjs')

function runCli(...args: string[]) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      APP_ENV: 'test',
    },
  })
}

describe('Ignite execution CLI', () => {
  it('validates the structured upgrade plan and exposes one status entry', () => {
    const validation = runCli('plan', 'validate', 'IGT-001')
    expect(validation.status).toBe(0)

    const status = runCli('status', '--json')
    expect(status.status).toBe(0)
    const payload = JSON.parse(status.stdout) as { plans: Array<{ id: string; status: string }> }
    expect(payload.plans).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'IGT-001' })]),
    )
  })

  it('rejects an invalid state instead of treating it as a completed plan', () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'ignite-plan-'))
    const temporaryPlan = join(temporaryDirectory, 'invalid.md')
    writeFileSync(
      temporaryPlan,
      `<!-- ignite-plan\n${JSON.stringify({
        schema: 1,
        id: 'IGT-999',
        release: 'test',
        status: 'finished',
        outcome: 'invalid',
        change_type: '基础设施变更',
        requirements: ['REQ-TEST-001'],
        write_scope: ['tests/'],
        required_evidence: [],
        evidence: [],
        blocker: null,
        integrated_commit: null,
      })}\n-->\n# invalid\n`,
      'utf8',
    )

    try {
      const result = runCli('plan', 'validate', temporaryPlan)
      expect(result.status).not.toBe(0)
      expect(`${result.stdout}\n${result.stderr}`).toContain('unknown status')
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true })
    }
  })

  it('rejects done without passed evidence and an integrated commit', () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'ignite-plan-done-'))
    const temporaryPlan = join(temporaryDirectory, 'incomplete.md')
    writeFileSync(
      temporaryPlan,
      `<!-- ignite-plan\n${JSON.stringify({
        schema: 1,
        id: 'IGT-998',
        release: 'test',
        status: 'done',
        outcome: 'incomplete',
        change_type: '基础设施变更',
        requirements: ['REQ-TEST-002'],
        write_scope: ['tests/'],
        required_evidence: ['run-1'],
        evidence: [],
        blocker: null,
        integrated_commit: null,
      })}\n-->\n# incomplete\n`,
      'utf8',
    )

    try {
      const result = runCli('plan', 'validate', temporaryPlan)
      expect(result.status).not.toBe(0)
      expect(`${result.stdout}\n${result.stderr}`).toContain('missing passed evidence')
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true })
    }
  })

  it('keeps documentation feedback narrow and does not schedule build or Prisma', () => {
    const result = runCli(
      'check',
      '--plan',
      'IGT-001',
      '--level',
      'auto',
      '--files',
      'README.md',
      '--dry-run',
    )
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('docs:check')
    expect(result.stdout).toContain('prettier')
    expect(result.stdout).not.toContain('build')
    expect(result.stdout).not.toContain('prisma')
    expect(result.stdout).not.toContain('test:e2e')
  })

  it('writes a generated status file instead of requiring a second status table', () => {
    const result = runCli('status', '--write')
    expect(result.status).toBe(0)
    const generatedPath = join(repositoryRoot, 'docs', 'others', 'ignite-status.md')
    expect(existsSync(generatedPath)).toBe(true)
    expect(readFileSync(generatedPath, 'utf8')).toContain('IGT-001')
  })
})
