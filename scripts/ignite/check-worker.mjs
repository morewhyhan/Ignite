import { spawn, spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'

const [command, ...args] = process.argv.slice(2)
if (!command || !process.connected) {
  console.error('check-worker requires a command and its runner IPC channel')
  process.exit(1)
}

let stopping = false
let escalation
let primaryClosed = false
let finishPromise
let stopDeadline = null
const lease = randomUUID()
const ancestry = [process.env.IGNITE_MANAGED_ANCESTRY, lease].filter(Boolean).join(',')
const child = spawn(command, args, {
  env: { ...process.env, IGNITE_MANAGED_ANCESTRY: ancestry },
  windowsHide: true,
  detached: process.platform !== 'win32',
  stdio: 'inherit',
})

function ownedProcesses() {
  if (process.platform !== 'linux') return []
  const owned = []
  for (const name of readdirSync('/proc')) {
    if (!/^\d+$/.test(name)) continue
    try {
      const identity = processIdentity(Number(name))
      if (!identity || identity.state === 'Z') continue
      const environment = readFileSync(`/proc/${name}/environ`, 'utf8')
      const marker = environment
        .split('\0')
        .find((entry) => entry.startsWith('IGNITE_MANAGED_ANCESTRY='))
      if (!marker?.slice('IGNITE_MANAGED_ANCESTRY='.length).split(',').includes(lease)) continue
      if (processIdentity(Number(name))?.start === identity.start)
        owned.push({ pid: Number(name), start: identity.start })
    } catch {
      // Other users' processes and processes that exited during the read are not owned.
    }
  }
  return owned
}

function processIdentity(pid) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8')
    const fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ')
    return { state: fields[0], start: fields[19] }
  } catch {
    return null
  }
}

function stopOwnedProcesses(signal) {
  const owned = ownedProcesses()
  for (const target of owned) {
    if (processIdentity(target.pid)?.start !== target.start) continue
    try {
      process.kill(target.pid, signal)
    } catch (error) {
      if (error.code !== 'ESRCH') console.error(`check-worker: ${error.message}`)
    }
  }
  return owned.length > 0
}

function stopGroup(signal) {
  if (!child.pid) return false
  try {
    if (process.platform === 'win32') {
      const result = spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore',
      })
      return result.status === 0
    }
    process.kill(-child.pid, signal)
    return true
  } catch (error) {
    if (error.code !== 'ESRCH') console.error(`check-worker: ${error.message}`)
    return false
  }
}

function finishAfterClose(code, signal) {
  if (finishPromise) return finishPromise
  primaryClosed = true
  finishPromise = (async () => {
    const detachedOwned = stopOwnedProcesses('SIGTERM')
    if (!stopping && (stopGroup('SIGTERM') || detachedOwned)) stopDeadline = Date.now() + 3_000
    if (process.platform !== 'win32' && stopDeadline) {
      while (Date.now() < stopDeadline) {
        let groupRunning = Boolean(child.pid)
        if (child.pid) {
          try {
            process.kill(-child.pid, 0)
          } catch (error) {
            if (error.code === 'ESRCH') groupRunning = false
            else throw error
          }
        }
        if (!groupRunning && ownedProcesses().length === 0) break
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      stopGroup('SIGKILL')
    } else if (stopping) stopGroup('SIGKILL')
    stopOwnedProcesses('SIGKILL')
    if (escalation) clearTimeout(escalation)
    process.exitCode = stopping ? 130 : (code ?? 1)
    if (process.connected) {
      try {
        process.send({ type: 'exit', signal })
      } catch {
        // A departing parent may close the IPC lease after owned-process cleanup.
      }
      if (process.connected) process.disconnect()
    }
  })()
  return finishPromise
}

function stop() {
  if (stopping || primaryClosed) return
  stopping = true
  stopDeadline = Date.now() + 3_000
  stopOwnedProcesses('SIGTERM')
  stopGroup('SIGTERM')
  escalation = setTimeout(() => {
    stopOwnedProcesses('SIGKILL')
    stopGroup('SIGKILL')
  }, 3_000)
}

process.on('disconnect', stop)
process.on('SIGTERM', stop)
process.on('SIGINT', stop)
child.once('error', (error) => {
  console.error(`check-worker: ${error.message}`)
  if (process.connected) {
    try {
      process.send({ type: 'error', message: error.message })
    } catch {
      // The IPC lease may close while the primary command is failing to spawn.
    }
  }
  process.exitCode = 1
})
child.once('close', (code, signal) => {
  void finishAfterClose(code, signal)
})
