import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { acquireLock, derivedRunStatus } from '../../scripts/ignite/runs.mjs'
import { runnerIdentity } from '../../scripts/ignite/core.mjs'
import { makeFixture, repositoryRoot } from './ignite-fixture'

describe('Ignite recoverable runs', () => {
  it('[AC-PRODUCT-007] protects a freshly opened empty lock and recovers an abandoned one', () => {
    const directory = mkdtempSync(join(tmpdir(), 'ignite-lock-starting-'))
    const path = join(directory, 'worktree.lock')
    try {
      writeFileSync(path, '')
      expect(acquireLock(path, 'run-contender', () => null).acquired).toBe(false)
      expect(readFileSync(path, 'utf8')).toBe('')
      utimesSync(path, new Date('2020-01-01'), new Date('2020-01-01'))
      expect(acquireLock(path, 'run-recovered', () => null).acquired).toBe(true)
      expect(JSON.parse(readFileSync(path, 'utf8')).run_id).toBe('run-recovered')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('[AC-PRODUCT-007] rejects changed inputs even when the child exits successfully', () => {
    const fixture = makeFixture()
    try {
      const stateUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/state.mjs')).href
      const runsUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/runs.mjs')).href
      const script = `
        import { existsSync } from 'node:fs'
        const state = await import(${JSON.stringify(stateUrl)})
        const runs = await import(${JSON.stringify(runsUrl)})
        const result = await runs.executeCheckPlan({
          plan: state.findPlan('IGT-900'),
          checkPlan: {
            level: 'integration', changedFiles: [],
            commands: [{
              command: process.execPath,
              args: ['--eval', "require('node:fs').writeFileSync('README.md', '# changed during validation')"],
              label: 'input-mutation-fixture',
            }],
          },
        })
        process.stdout.write(JSON.stringify({
          status: result.status, exitCode: result.exitCode,
          reason: result.record.failure_reason,
          published: existsSync('docs/others/evidence/runs'),
          locked: existsSync('.ignite/runs/worktree.lock'),
        }))
      `
      const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
        cwd: fixture.root,
        encoding: 'utf8',
        env: { ...process.env, IGNITE_ROOT: fixture.root },
        windowsHide: true,
      })
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toMatchObject({
        status: 'failed',
        exitCode: 1,
        published: false,
        locked: false,
        reason: expect.stringContaining('changed during the check'),
      })
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-007] distinguishes live and orphaned runners', () => {
    const live = {
      status: 'running',
      started_at: new Date().toISOString(),
      heartbeat_at: new Date().toISOString(),
      runner: runnerIdentity(),
    }
    expect(derivedRunStatus(live)).toBe('running')
    expect(
      derivedRunStatus({
        ...live,
        started_at: '2020-01-01T00:00:00.000Z',
        heartbeat_at: '2020-01-01T00:00:00.000Z',
        runner: { ...runnerIdentity(), pid: -1 },
        child_pid: process.pid,
      }),
    ).toBe('running')
    expect(
      derivedRunStatus({
        ...live,
        started_at: '2020-01-01T00:00:00.000Z',
        heartbeat_at: '2020-01-01T00:00:00.000Z',
        runner: { host_id: 'another-host', boot_id: 'another-boot', platform: 'linux' },
      }),
    ).toBe('orphaned')
  })

  it('[AC-PRODUCT-007] allows only one owner for the same fingerprint lock', () => {
    const directory = mkdtempSync(join(tmpdir(), 'ignite-lock-'))
    const path = join(directory, 'same-input.lock')
    try {
      expect(acquireLock(path, 'run-one', () => null)).toEqual({ acquired: true })
      expect(acquireLock(path, 'run-two', () => null)).toMatchObject({
        acquired: false,
        record: { run_id: 'run-one', status: 'running', starting: true },
      })
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('[AC-PRODUCT-007] returns pending with a nonzero exit code for an active run', () => {
    const fixture = makeFixture()
    try {
      const coreUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/core.mjs')).href
      const stateUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/state.mjs')).href
      const runsUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/runs.mjs')).href
      const script = `
        import { mkdirSync, writeFileSync } from 'node:fs'
        import { join } from 'node:path'
        const core = await import(${JSON.stringify(coreUrl)})
        const state = await import(${JSON.stringify(stateUrl)})
        const runs = await import(${JSON.stringify(runsUrl)})
        const plan = state.findPlan('IGT-900')
        const checkPlan = { level: 'integration', changedFiles: [], commands: [] }
        const environment = core.makeSafeTestEnvironment()
        const environmentData = core.environmentIdentity(environment)
        const inputFingerprint = core.computeInputFingerprint(plan)
        const workspaceClean = core.executionWorkspaceIsClean()
        const fingerprint = core.hash(JSON.stringify({
          plan_id: plan.metadata.id,
          evidence_id: 'check-integration',
          input_fingerprint: inputFingerprint,
          environment_fingerprint: environmentData.fingerprint,
          workspace_clean: workspaceClean,
          commands: [],
        }))
        const record = {
          schema: 2,
          run_id: 'run-active-fixture',
          plan_id: plan.metadata.id,
          evidence_id: 'check-integration',
          level: 'integration',
          status: 'running',
          started_at: new Date().toISOString(),
          heartbeat_at: new Date().toISOString(),
          runner: core.runnerIdentity(),
          fingerprint,
        }
        mkdirSync(core.localRunsDirectory, { recursive: true })
        writeFileSync(join(core.localRunsDirectory, record.run_id + '.json'), JSON.stringify(record))
        const result = await runs.executeCheckPlan({ plan, checkPlan })
        process.stdout.write(JSON.stringify({ status: result.status, exitCode: result.exitCode, reused: result.reused }))
      `
      const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
        cwd: fixture.root,
        encoding: 'utf8',
        env: { ...process.env, IGNITE_ROOT: fixture.root },
        windowsHide: true,
      })
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toEqual({
        status: 'running',
        exitCode: 2,
        reused: true,
      })
    } finally {
      fixture.cleanup()
    }
  })
})
