import { spawn, spawnSync } from 'node:child_process'

// The IPC channel is a lease from the runner: a crash closes it even when the
// runner cannot execute a signal handler. Only this worker's child group is stopped.
const [command, ...args] = process.argv.slice(2)
if (!command || !process.connected) {
  console.error('check-worker requires a command and its runner IPC channel')
  process.exit(1)
}

let stopping = false
let escalation
const child = spawn(command, args, {
  env: process.env,
  windowsHide: true,
  detached: process.platform !== 'win32',
  stdio: 'inherit',
})

function stopGroup(signal) {
  if (!child.pid) return
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore',
      })
    } else {
      process.kill(-child.pid, signal)
    }
  } catch (error) {
    if (error.code !== 'ESRCH') console.error(`check-worker: ${error.message}`)
  }
}

function stop() {
  if (stopping) return
  stopping = true
  stopGroup('SIGTERM')
  escalation = setTimeout(() => stopGroup('SIGKILL'), 3_000)
}

process.on('disconnect', stop)
process.on('SIGTERM', stop)
process.on('SIGINT', stop)
child.once('error', (error) => {
  console.error(`check-worker: ${error.message}`)
  process.exitCode = 1
})
child.once('close', (code) => {
  if (!stopping && escalation) clearTimeout(escalation)
  process.exitCode = stopping ? 130 : (code ?? 1)
  process.removeListener('disconnect', stop)
  if (process.connected) process.disconnect()
})
