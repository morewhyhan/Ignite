import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  commitAll,
  makeFixture,
  planContent,
  read,
  repositoryRoot,
  runCli,
  write,
} from './ignite-fixture'

function snapshot(root: string) {
  const url = (path: string) => pathToFileURL(join(repositoryRoot, path)).href
  const source = `
    const core = await import(${JSON.stringify(url('scripts/ignite/core.mjs'))})
    const state = await import(${JSON.stringify(url('scripts/ignite/state.mjs'))})
    const checks = await import(${JSON.stringify(url('scripts/ignite/checks.mjs'))})
    const plan = state.findPlan('IGT-900')
    process.stdout.write(JSON.stringify({
      commit: core.currentCommit(),
      fingerprint: core.computeInputFingerprint(plan),
      policy: checks.CHECK_POLICY_VERSION,
      runner: core.runnerIdentity(),
      commands: checks.commandsForLevel('integration', core.changedFilesForPlan(plan), plan)
        .map((command) => ({
          label: command.label,
          command: [command.command, ...command.args],
          status: 'passed', exit_code: 0, duration_ms: 1,
        })),
    }))
  `
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', source], {
    cwd: root,
    env: { ...process.env, IGNITE_ROOT: root },
    encoding: 'utf8',
    windowsHide: true,
  })
  expect(result.status, result.stderr).toBe(0)
  return JSON.parse(result.stdout)
}

function next(root: string) {
  const result = runCli(root, 'next', '--plan', 'IGT-900')
  expect(result.status, result.stderr).toBe(0)
  return JSON.parse(result.stdout)
}

describe('Ignite next action progression', () => {
  it('[AC-EXECUTION-010] advances a current integration result to release verification', () => {
    const fixture = makeFixture()
    try {
      const input = snapshot(fixture.root)
      const runtime = JSON.parse(read(fixture.root, '.ai/runtime.json'))
      // This receipt models a completed run. This test verifies navigation only;
      // the runner and completion contracts separately verify execution provenance.
      write(
        fixture.root,
        'docs/others/evidence/runs/run-integration.json',
        JSON.stringify({
          schema: 2,
          run_id: 'run-integration',
          check_policy_version: input.policy,
          plan_id: 'IGT-900',
          evidence_id: 'check-integration',
          level: 'integration',
          status: 'passed',
          exit_code: 0,
          started_at: '2026-09-06T00:00:00.000Z',
          ended_at: '2026-09-06T00:00:00.000Z',
          commit: input.commit,
          input_fingerprint: input.fingerprint,
          environment_fingerprint: 'a'.repeat(64),
          environment: {
            platform: process.platform,
            arch: process.arch,
            node: runtime.node,
            pnpm: runtime.package_manager.replace('pnpm@', ''),
          },
          workspace_clean: true,
          commands: input.commands,
          log_sha256: 'b'.repeat(64),
        }),
      )
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          evidence: [{ id: 'check-integration', run_id: 'run-integration' }],
        }),
      )

      expect(next(fixture.root).next_action).toMatchObject({
        kind: 'start-verification',
        command: 'pnpm ignite plan set-status IGT-900 verifying --commit HEAD',
      })
      const transition = runCli(
        fixture.root,
        'plan',
        'set-status',
        'IGT-900',
        'verifying',
        '--commit',
        'HEAD',
      )
      expect(transition.status, transition.stderr).toBe(0)
      expect(next(fixture.root).next_action).toMatchObject({
        kind: 'verify-release',
        command: 'pnpm ignite check --plan IGT-900 --level release',
      })
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-010] diagnoses current failures and resumes after the input is repaired', () => {
    const fixture = makeFixture()
    try {
      const input = snapshot(fixture.root)
      write(
        fixture.root,
        '.ignite/runs/run-failed.json',
        JSON.stringify({
          run_id: 'run-failed',
          plan_id: 'IGT-900',
          status: 'failed',
          started_at: '2026-09-06T00:00:00.000Z',
          input_fingerprint: input.fingerprint,
          failure_reason: 'a current assertion failed',
        }),
      )
      expect(next(fixture.root).next_action.kind).toBe('diagnose-run')

      write(fixture.root, 'README.md', '# repaired execution input\n')
      commitAll(fixture.root, 'repair the failing input')
      const resumed = next(fixture.root)
      expect(resumed.next_action.kind).toBe('implement-and-check')
      expect(resumed.latest_run).toMatchObject({
        run_id: 'run-failed',
        status: 'failed',
        input_current: false,
      })

      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, { status: 'cancelled' }),
      )
      expect(next(fixture.root).next_action.kind).toBe('report-result')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-010] waits for a live run even if its input has changed', () => {
    const fixture = makeFixture()
    try {
      const input = snapshot(fixture.root)
      write(
        fixture.root,
        '.ignite/runs/run-live.json',
        JSON.stringify({
          run_id: 'run-live',
          plan_id: 'IGT-900',
          status: 'running',
          started_at: new Date().toISOString(),
          input_fingerprint: 'previous-input',
          runner: { ...input.runner, pid: process.pid },
        }),
      )
      expect(next(fixture.root)).toMatchObject({
        next_action: { kind: 'wait-for-run' },
        latest_run: { input_current: false },
      })
    } finally {
      fixture.cleanup()
    }
  })
})
