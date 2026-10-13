import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const outputLimit = 32_000
const workerPath = fileURLToPath(new URL('./check-worker.mjs', import.meta.url))

function appendBounded(current, chunk) {
  const combined = current + chunk
  return combined.length > outputLimit ? combined.slice(-outputLimit) : combined
}

/**
 * @param {{command: string, args?: string[], cwd: string, env?: NodeJS.ProcessEnv,
 * timeoutMs: number, signal?: AbortSignal,
 * onOutput?: (stream: 'stdout' | 'stderr', text: string) => void,
 * onStart?: (pid: number) => void}} options
 * @returns {Promise<{exitCode: number, signal: NodeJS.Signals | null,
 * timedOut: boolean, cancelled: boolean, error: string | null, stdout: string, stderr: string}>}
 */
export function runManagedCommand({
  command,
  args = [],
  cwd,
  env,
  timeoutMs,
  signal,
  onOutput = () => {},
  onStart = () => {},
}) {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve({
        exitCode: 130,
        signal: null,
        timedOut: false,
        cancelled: true,
        error: null,
        stdout: '',
        stderr: '',
      })
      return
    }
    let stdout = ''
    let stderr = ''
    let error = null
    let timedOut = false
    let cancelled = false
    let stopping = false
    let settled = false
    let escalation
    let commandSignal = null

    let supervisor
    try {
      supervisor = spawn(process.execPath, [workerPath, command, ...args], {
        cwd,
        env,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      })
    } catch (spawnError) {
      resolve({
        exitCode: 1,
        signal: null,
        timedOut,
        cancelled,
        error: spawnError.message,
        stdout,
        stderr,
      })
      return
    }

    const stopSupervisor = () => {
      if (settled || stopping) return
      stopping = true
      supervisor.kill('SIGTERM')
      escalation = setTimeout(() => supervisor.kill('SIGKILL'), 5_000)
      escalation.unref()
    }

    const timeout = setTimeout(() => {
      if (stopping) return
      timedOut = true
      stopSupervisor()
    }, timeoutMs)
    timeout.unref()

    const onAbort = () => {
      if (stopping) return
      cancelled = true
      stopSupervisor()
    }
    if (signal?.aborted) onAbort()
    else signal?.addEventListener('abort', onAbort, { once: true })

    const consume = (stream, outputName) => {
      stream.setEncoding('utf8')
      stream.on('data', (text) => {
        if (outputName === 'stdout') stdout = appendBounded(stdout, text)
        else stderr = appendBounded(stderr, text)
        try {
          onOutput(outputName, text)
        } catch (consumerError) {
          error = `Diagnostic output failed: ${consumerError.message}`
          stopSupervisor()
        }
      })
    }
    consume(supervisor.stdout, 'stdout')
    consume(supervisor.stderr, 'stderr')

    supervisor.on('message', (message) => {
      if (!message || typeof message !== 'object' || Array.isArray(message) || !('type' in message))
        return
      if (message.type === 'error' && 'message' in message) error = String(message.message)
      if (
        message.type === 'exit' &&
        'signal' in message &&
        (message.signal === null || typeof message.signal === 'string')
      )
        commandSignal = message.signal
    })
    supervisor.once('error', (spawnError) => {
      error = spawnError.message
    })
    supervisor.once('close', (exitCode, childSignal) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      if (escalation) clearTimeout(escalation)
      signal?.removeEventListener('abort', onAbort)
      resolve({
        exitCode: cancelled ? 130 : (exitCode ?? 1),
        signal: childSignal ?? commandSignal,
        timedOut,
        cancelled,
        error,
        stdout,
        stderr,
      })
    })
    try {
      if (supervisor.pid) onStart(supervisor.pid)
    } catch (startError) {
      error = `Command start callback failed: ${startError.message}`
      stopSupervisor()
    }
  })
}
