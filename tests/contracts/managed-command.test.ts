import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { setTimeout as delay } from 'node:timers/promises'
import { describe, expect, it } from 'vitest'
import { runManagedCommand } from '../../scripts/ignite/managed-command.mjs'

function isRunning(pid: number) {
  try {
    process.kill(pid, 0)
    if (process.platform === 'linux') {
      const stat = readFileSync(`/proc/${pid}/stat`, 'utf8')
      if (stat.slice(stat.lastIndexOf(')') + 2).split(' ')[0] === 'Z') return false
    }
    return true
  } catch (error) {
    return !(
      error instanceof Error &&
      'code' in error &&
      ['ESRCH', 'ENOENT'].includes(String(error.code))
    )
  }
}

describe('managed command lifecycle', () => {
  it('classifies spawn failures without claiming a successful command', async () => {
    const result = await runManagedCommand({
      command: 'ignite-command-that-does-not-exist',
      cwd: process.cwd(),
      env: process.env,
      timeoutMs: 5_000,
    })

    expect(result.exitCode).not.toBe(0)
    expect(result.error).toMatch(/not found|ENOENT|cannot find/i)
    expect(result.timedOut).toBe(false)
    expect(result.cancelled).toBe(false)
  })

  it('streams both output channels and returns bounded captured output', async () => {
    const streamed: Array<[string, string]> = []
    const result = await runManagedCommand({
      command: process.execPath,
      args: [
        '-e',
        "process.stdout.write('ready' + 'x'.repeat(40000)); process.stderr.write('problem')",
      ],
      cwd: process.cwd(),
      env: process.env,
      timeoutMs: 5_000,
      onOutput: (stream, text) => streamed.push([stream, text]),
    })

    expect(result).toMatchObject({
      exitCode: 0,
      signal: null,
      timedOut: false,
      cancelled: false,
      error: null,
    })
    expect(result.stderr).toContain('problem')
    expect(result.stdout).toHaveLength(32_000)
    expect(streamed.some(([stream, text]) => stream === 'stdout' && text.includes('ready'))).toBe(
      true,
    )
    expect(streamed.some(([stream, text]) => stream === 'stderr' && text.includes('problem'))).toBe(
      true,
    )
  })

  it('[AC-EXECUTION-042] stops owned descendants and preserves failure diagnostics', async () => {
    const unrelated = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      stdio: 'ignore',
      windowsHide: true,
    })
    let descendantPid: number | null = null
    try {
      const result = await runManagedCommand({
        command: process.execPath,
        args: [
          '-e',
          "const {spawn}=require('node:child_process'); const child=spawn(process.execPath,['-e','setInterval(() => {}, 1000)'],{stdio:'ignore',detached:process.platform==='linux'}); console.log(child.pid); console.error('diagnostic survives timeout'); setInterval(() => {}, 1000)",
        ],
        cwd: process.cwd(),
        env: process.env,
        timeoutMs: 2_500,
        onOutput: (_stream, text) => {
          const match = text.match(/\b(\d+)\b/)
          if (match) descendantPid = Number(match[1])
        },
      })

      expect(result.timedOut).toBe(true)
      expect(result.cancelled).toBe(false)
      expect(result.exitCode).not.toBe(0)
      expect(result.stderr).toContain('diagnostic survives timeout')
      expect(descendantPid).not.toBeNull()
      for (
        let attempt = 0;
        attempt < 30 && descendantPid !== null && isRunning(descendantPid);
        attempt++
      ) {
        await delay(50)
      }
      expect(descendantPid !== null && isRunning(descendantPid)).toBe(false)
      expect(unrelated.pid).toBeDefined()
      if (unrelated.pid === undefined) throw new Error('Unrelated process did not start.')
      expect(isRunning(unrelated.pid)).toBe(true)
    } finally {
      if (unrelated.pid && isRunning(unrelated.pid)) unrelated.kill('SIGKILL')
      if (descendantPid !== null && isRunning(descendantPid)) {
        try {
          process.kill(descendantPid, 'SIGKILL')
        } catch {
          // The owned child may exit between the liveness check and cleanup.
        }
      }
    }
  })

  it('classifies caller cancellation separately from a timeout', async () => {
    const controller = new AbortController()
    const execution = runManagedCommand({
      command: process.execPath,
      args: ['-e', 'setInterval(() => {}, 1000)'],
      cwd: process.cwd(),
      env: process.env,
      timeoutMs: 5_000,
      signal: controller.signal,
    })
    setTimeout(() => controller.abort(), 100)

    const result = await execution
    expect(result).toMatchObject({ exitCode: 130, timedOut: false, cancelled: true })
  })

  it('retains the primary command termination signal', async () => {
    const result = await runManagedCommand({
      command: process.execPath,
      args: ['-e', "process.kill(process.pid, 'SIGTERM')"],
      cwd: process.cwd(),
      timeoutMs: 5_000,
    })
    expect(result.exitCode).not.toBe(0)
    expect(result.signal).toBe('SIGTERM')
    expect(result.timedOut).toBe(false)
    expect(result.cancelled).toBe(false)
  })

  it('cleans a lingering descendant after the main command exits', async () => {
    let descendantPid: number | null = null
    try {
      const result = await runManagedCommand({
        command: process.execPath,
        args: [
          '-e',
          "const {spawn}=require('node:child_process'); const child=spawn(process.execPath,['-e','setInterval(() => {}, 1000)'],{stdio:'ignore',detached:process.platform==='linux'}); console.log(child.pid); child.unref()",
        ],
        cwd: process.cwd(),
        env: process.env,
        timeoutMs: 5_000,
        onOutput: (_stream, text) => {
          const match = text.match(/\b(\d+)\b/)
          if (match) descendantPid = Number(match[1])
        },
      })

      expect(result.exitCode).toBe(0)
      expect(descendantPid).not.toBeNull()
      for (
        let attempt = 0;
        attempt < 30 && descendantPid !== null && isRunning(descendantPid);
        attempt++
      ) {
        await delay(50)
      }
      expect(descendantPid !== null && isRunning(descendantPid)).toBe(false)
    } finally {
      if (descendantPid !== null && isRunning(descendantPid)) {
        try {
          process.kill(descendantPid, 'SIGKILL')
        } catch {
          // The owned child may exit between the liveness check and cleanup.
        }
      }
    }
  })
})
