import { createHash, randomBytes } from 'node:crypto'
import {
  closeSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import {
  computeInputFingerprint,
  computeInputFingerprintAtCommit,
  currentCommit,
  durableRunsDirectory,
  environmentIdentity,
  executionWorkspaceIsClean,
  gitCommitExists,
  hash,
  isAncestor,
  localRunsDirectory,
  makeSafeTestEnvironment,
  readJson,
  relativePath,
  repositoryRoot,
  runnerIdentity,
  writeJson,
} from './core.mjs'
import { bindPlanEvidence, findPlan, listDurableRuns, planContractAtCommit } from './state.mjs'
import { CHECK_POLICY_VERSION } from './checks.mjs'

const HEARTBEAT_INTERVAL_MS = 5_000
const STALE_AFTER_MS = 25_000

function now() {
  return new Date().toISOString()
}

function localRunPath(runId) {
  return join(localRunsDirectory, `${runId}.json`)
}

function cancellationPath(runId) {
  return join(localRunsDirectory, `${runId}.cancel`)
}

export function requestRunCancellation(runId) {
  if (!/^run-[0-9a-z-]+$/i.test(runId)) throw new Error('invalid run id')
  const path = localRunPath(runId)
  if (!existsSync(path)) throw new Error(`run not found: ${runId}`)
  const record = readJson(path)
  if (derivedRunStatus(record) !== 'running' || !sameRunnerMachine(record)) {
    throw new Error('only a currently running check on this machine can be cancelled')
  }
  const marker = cancellationPath(runId)
  if (!existsSync(marker))
    writeFileSync(marker, `${JSON.stringify({ run_id: runId, requested_at: now() })}\n`, {
      flag: 'wx',
    })
  return { run_id: runId, status: 'cancellation-requested' }
}

function worktreeLockPath() {
  return join(localRunsDirectory, 'worktree.lock')
}

export function listLocalRuns() {
  if (!existsSync(localRunsDirectory)) return []
  return readdirSync(localRunsDirectory)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      try {
        return readJson(join(localRunsDirectory, name))
      } catch (error) {
        return {
          run_id: name.slice(0, -5),
          status: 'corrupt',
          started_at: '',
          failure_reason: `local run record is unreadable: ${error.message}`,
        }
      }
    })
    .sort((left, right) => String(right.started_at).localeCompare(String(left.started_at)))
}

function sameRunnerMachine(record) {
  const current = runnerIdentity()
  return (
    record.runner?.host_id === current.host_id &&
    record.runner?.boot_id === current.boot_id &&
    record.runner?.platform === current.platform
  )
}

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    if (process.platform === 'linux') {
      const stat = readFileSync(`/proc/${pid}/stat`, 'utf8')
      if (['Z', 'X'].includes(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[0])) return false
    }
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export function derivedRunStatus(record) {
  if (record.status !== 'running') return record.status
  const heartbeatAge = Date.now() - Date.parse(record.heartbeat_at || record.started_at)
  if (sameRunnerMachine(record)) {
    return pidAlive(record.runner?.pid) || pidAlive(record.child_pid) ? 'running' : 'orphaned'
  }
  if (heartbeatAge <= STALE_AFTER_MS) return 'running'
  return 'orphaned'
}

export function acquireLock(
  path,
  runId,
  readRun = (id) => {
    const path = localRunPath(id)
    return existsSync(path) ? readJson(path) : null
  },
) {
  mkdirSync(dirname(path), { recursive: true })
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const descriptor = openSync(path, 'wx')
      try {
        writeFileSync(
          descriptor,
          `${JSON.stringify({ run_id: runId, created_at: now(), runner: runnerIdentity() })}\n`,
        )
      } finally {
        closeSync(descriptor)
      }
      return { acquired: true }
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
      let existing = null
      let lock = null
      let observed
      try {
        observed = statSync(path)
        lock = readJson(path)
        existing = readRun(lock.run_id)
      } catch (error) {
        if (error.code === 'ENOENT') continue
        existing = null
      }
      if (existing && derivedRunStatus(existing) === 'running') {
        return { acquired: false, record: existing }
      }
      if (lock) {
        const starting = {
          ...existing,
          run_id: lock.run_id,
          status: 'running',
          started_at: lock.created_at,
          heartbeat_at: lock.created_at,
          runner: lock.runner,
          child_pid: null,
          starting: true,
        }
        if (derivedRunStatus(starting) === 'running') {
          return { acquired: false, record: starting }
        }
      }
      if (!lock && observed && Date.now() - observed.mtimeMs <= STALE_AFTER_MS) {
        return {
          acquired: false,
          record: {
            run_id: null,
            status: 'running',
            started_at: observed.mtime.toISOString(),
            starting: true,
          },
        }
      }
      // A different contender may have replaced this lock during the recovery read.
      // Never unlink a file whose identity or contents changed since it was inspected.
      try {
        const current = statSync(path)
        if (
          !observed ||
          current.dev !== observed.dev ||
          current.ino !== observed.ino ||
          current.mtimeMs !== observed.mtimeMs ||
          current.size !== observed.size
        ) {
          continue
        }
      } catch (error) {
        if (error.code === 'ENOENT') continue
        throw error
      }
      if (existing?.status === 'running') {
        existing.status = 'orphaned'
        existing.needs_retry = true
        existing.ended_at = now()
        writeJson(localRunPath(existing.run_id), existing, { format: false })
      }
      try {
        unlinkSync(path)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    }
  }
  throw new Error('unable to acquire run lock')
}

function releaseLock(path, runId) {
  try {
    if (readJson(path).run_id === runId) unlinkSync(path)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      // Leave a corrupt lock for the bounded recovery path; never remove another owner.
    }
  }
}

function appendTail(current, chunk, limit = 8_000) {
  const combined = current + chunk
  return combined.length > limit ? combined.slice(-limit) : combined
}

function runChild(spec, environment, record, logStream, persist) {
  return new Promise((resolveResult) => {
    const startedAt = now()
    const result = {
      label: spec.label,
      command: [spec.command, ...spec.args],
      status: 'running',
      started_at: startedAt,
      ended_at: null,
      duration_ms: null,
      exit_code: null,
      signal: null,
    }
    record.commands.push(result)
    persist()

    let tail = ''
    let settled = false
    const timeBudgetMs =
      spec.label === 'e2e-production' || spec.label === 'verify' ? 20 * 60_000 : 10 * 60_000
    const child = spawn(
      process.execPath,
      [fileURLToPath(new URL('./check-worker.mjs', import.meta.url)), spec.command, ...spec.args],
      {
        cwd: repositoryRoot,
        env: environment,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      },
    )
    record.child_pid = child.pid || null
    record.current_command = spec.label
    record.last_output_at = startedAt
    persist()

    const stopChild = (signal) => {
      if (!child.pid || settled) return
      try {
        child.kill(signal)
      } catch (error) {
        if (error.code !== 'ESRCH') tail = appendTail(tail, `\n${error.message}\n`)
      }
    }
    const timeout = setTimeout(() => {
      result.timed_out = true
      record.failure_reason = `${spec.label} exceeded its ${Math.round(timeBudgetMs / 60_000)} minute budget`
      stopChild('SIGTERM')
      setTimeout(() => stopChild('SIGKILL'), 5_000).unref()
    }, timeBudgetMs)
    timeout.unref()
    const cancellation = setInterval(() => {
      if (!existsSync(cancellationPath(record.run_id)) || settled) return
      result.cancelled = true
      record.failure_reason = `run ${record.run_id} was cancelled`
      stopChild('SIGTERM')
      setTimeout(() => stopChild('SIGKILL'), 5_000).unref()
    }, 1_000)
    cancellation.unref()

    const consume = (stream, output) => {
      stream.on('data', (chunk) => {
        const text = chunk.toString()
        tail = appendTail(tail, text)
        record.last_output_at = now()
        logStream.write(text)
        output.write(text)
      })
    }
    consume(child.stdout, process.stdout)
    consume(child.stderr, process.stderr)

    const finish = (exitCode, signal, error = null) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      clearInterval(cancellation)
      result.ended_at = now()
      result.duration_ms = Date.parse(result.ended_at) - Date.parse(startedAt)
      result.exit_code = result.cancelled ? 130 : exitCode
      result.signal = signal
      result.status = result.cancelled ? 'cancelled' : exitCode === 0 ? 'passed' : 'failed'
      if (result.timed_out) result.status = 'failed'
      if (error) tail = appendTail(tail, `\n${error.message}\n`)
      result.output_tail = tail
      record.child_pid = null
      record.current_command = null
      persist()
      resolveResult(result)
    }

    child.once('error', (error) => finish(1, null, error))
    child.once('close', (exitCode, signal) => finish(exitCode ?? 1, signal))
  })
}

function durableManifest(record, logPath) {
  const logDigest = existsSync(logPath)
    ? createHash('sha256').update(readFileSync(logPath)).digest('hex')
    : null
  return {
    schema: 2,
    run_id: record.run_id,
    check_policy_version: record.check_policy_version,
    plan_id: record.plan_id,
    evidence_id: record.evidence_id,
    level: record.level,
    status: record.status,
    exit_code: record.exit_code,
    started_at: record.started_at,
    ended_at: record.ended_at,
    commit: record.commit,
    input_fingerprint: record.input_fingerprint,
    environment_fingerprint: record.environment_fingerprint,
    environment: record.environment,
    workspace_clean: record.workspace_clean,
    ...(record.check_policy_version >= 5
      ? {
          repository_fingerprint: record.repository_fingerprint,
          acceptance_results: record.acceptance_results || [],
        }
      : {}),
    commands: record.commands.map((command) => ({
      label: command.label,
      command: command.command,
      status: command.status,
      exit_code: command.exit_code,
      duration_ms: command.duration_ms,
      ...(command.reused_from ? { reused_from: command.reused_from } : {}),
    })),
    log_sha256: logDigest,
    ...(record.check_policy_version >= 3 ? { execution_source: 'ignite-runner-local' } : {}),
  }
}

function publishEvidence(record, logPath) {
  const manifestPath = join(durableRunsDirectory, `${record.run_id}.json`)
  writeJson(manifestPath, durableManifest(record, logPath))
  bindPlanEvidence(record.plan_id, record.evidence_id, record.run_id)
  return relativePath(manifestPath)
}

export function integrationSupportsRelease(
  receipt,
  { plan, commit, inputFingerprint, environmentFingerprint },
) {
  return (
    receipt?.plan_id === plan.metadata.id &&
    receipt.evidence_id === 'check-integration' &&
    receipt.check_policy_version === CHECK_POLICY_VERSION &&
    receipt.status === 'passed' &&
    receipt.exit_code === 0 &&
    receipt.workspace_clean === true &&
    receipt.input_fingerprint === inputFingerprint &&
    receipt.environment_fingerprint === environmentFingerprint &&
    gitCommitExists(receipt.commit) &&
    isAncestor(receipt.commit, commit) &&
    planContractAtCommit(plan, receipt.commit) &&
    computeInputFingerprintAtCommit(plan, receipt.commit) === inputFingerprint
  )
}

export async function executeCheckPlan({ plan, checkPlan, force = false }) {
  const active = listLocalRuns().find((record) => derivedRunStatus(record) === 'running')
  if (active) return { status: 'running', exitCode: 2, record: active, reused: true }
  const environment = makeSafeTestEnvironment()
  environment.IGNITE_PLAN_ID = plan.metadata.id
  mkdirSync(join(repositoryRoot, '.ignite', 'runtime'), {
    recursive: true,
  })
  const environmentData = environmentIdentity(environment)
  const inputFingerprint = computeInputFingerprint(plan)
  const repositoryFingerprint = computeInputFingerprint({ metadata: null })
  const commit = currentCommit()
  const workspaceClean = executionWorkspaceIsClean()
  if (!workspaceClean) {
    throw new Error('checks that publish evidence require committed execution inputs')
  }
  if (!planContractAtCommit(plan, commit)) {
    throw new Error('the stable Plan contract must be committed before running evidence checks')
  }
  if (checkPlan.level === 'release' && CHECK_POLICY_VERSION >= 3) {
    const integration = listDurableRuns().find(({ value }) =>
      integrationSupportsRelease(value, {
        plan,
        commit,
        inputFingerprint,
        environmentFingerprint: environmentData.fingerprint,
      }),
    )
    if (!integration) {
      throw new Error('release requires a current integration run before build and E2E')
    }
  }
  const evidenceId = `check-${checkPlan.level}`
  const fingerprint = hash(
    JSON.stringify({
      plan_id: plan.metadata.id,
      evidence_id: evidenceId,
      input_fingerprint: inputFingerprint,
      repository_fingerprint: repositoryFingerprint,
      environment_fingerprint: environmentData.fingerprint,
      workspace_clean: workspaceClean,
      commands: checkPlan.commands.map((item) => [item.command, ...item.args]),
    }),
  )

  const runId = `run-${new Date()
    .toISOString()
    .replaceAll(/[-:.TZ]/g, '')
    .slice(0, 14)}-${randomBytes(3).toString('hex')}`
  const recordPath = localRunPath(runId)
  const logPath = join(localRunsDirectory, `${runId}.log`)
  // Builds, browser reports and migration fixtures share this worktree even when
  // their Plan or input differs. One worktree owner protects all these resources.
  const lock = worktreeLockPath()
  const acquired = acquireLock(lock, runId)
  if (!acquired.acquired) {
    return { status: 'running', exitCode: 2, record: acquired.record, reused: true }
  }

  const assertCurrentInputs = () => {
    const currentPlan = findPlan(plan.metadata.id)
    if (
      currentCommit() !== commit ||
      !executionWorkspaceIsClean() ||
      computeInputFingerprint(currentPlan) !== inputFingerprint ||
      !['active', 'verifying'].includes(currentPlan.metadata.status)
    ) {
      throw new Error('execution inputs or Plan state changed during the check; run it again')
    }
  }

  let record
  let persist = () => {}
  let heartbeat
  let logStream
  try {
    // Another process may have finished after the pre-lock scan. Re-read under
    // ownership before deciding to launch commands or reuse its completed run.
    const allRuns = listLocalRuns()
    const live = allRuns.find((item) => derivedRunStatus(item) === 'running')
    if (live) return { status: 'running', exitCode: 2, record: live, reused: true }
    const matching = allRuns.filter((item) => item.fingerprint === fingerprint)
    const passed = matching.find(
      (item) =>
        item.status === 'passed' && existsSync(join(localRunsDirectory, `${item.run_id}.log`)),
    )
    assertCurrentInputs()
    if (passed && !force) {
      const manifestPath = publishEvidence(passed, join(localRunsDirectory, `${passed.run_id}.log`))
      return { status: 'passed', exitCode: 0, record: passed, reused: true, manifestPath }
    }
    if (matching.filter((item) => item.status === 'failed').length >= 2 && !force) {
      throw new Error(
        'the same input failed twice; change the input or mark the Plan blocked before forcing another retry',
      )
    }

    record = {
      schema: 2,
      run_id: runId,
      check_policy_version: CHECK_POLICY_VERSION,
      plan_id: plan.metadata.id,
      evidence_id: evidenceId,
      level: checkPlan.level,
      status: 'running',
      started_at: now(),
      ended_at: null,
      heartbeat_at: now(),
      runner: runnerIdentity(),
      child_pid: null,
      commit,
      input_fingerprint: inputFingerprint,
      repository_fingerprint: repositoryFingerprint,
      environment_fingerprint: environmentData.fingerprint,
      environment: environmentData.summary,
      workspace_clean: workspaceClean,
      fingerprint,
      changed_files: checkPlan.changedFiles,
      commands: [],
      acceptance_results: [],
      exit_code: null,
      needs_retry: false,
      log_path: relativePath(logPath),
    }
    persist = () => writeJson(recordPath, record, { format: false })
    persist()
    heartbeat = setInterval(() => {
      record.heartbeat_at = now()
      persist()
    }, HEARTBEAT_INTERVAL_MS)
    logStream = createWriteStream(logPath, { flags: 'a' })
    environment.IGNITE_ACCEPTANCE_RESULTS = join(
      repositoryRoot,
      '.ignite',
      'acceptance-results',
      runId,
    )

    for (const command of checkPlan.commands) {
      if (existsSync(cancellationPath(runId))) {
        record.failure_reason = `run ${runId} was cancelled`
        record.exit_code = 130
        record.status = 'cancelled'
        break
      }
      assertCurrentInputs()
      // Only cache commands whose output is a verdict, not generated artifacts,
      // Plan-dependent reporters or application/provider state.
      // Formatting also reads generated Plan/Release state, which is deliberately
      // excluded from the repository fingerprint. Always inspect that state anew.
      const reusableLabels = new Set(['lint', 'migrations'])
      let reused = null
      if (!force && reusableLabels.has(command.label)) {
        for (const source of allRuns) {
          if (
            source.status !== 'passed' ||
            !source.workspace_clean ||
            source.check_policy_version !== CHECK_POLICY_VERSION ||
            source.repository_fingerprint !== repositoryFingerprint ||
            source.environment_fingerprint !== environmentData.fingerprint
          )
            continue
          const prior = source.commands.find(
            (item) =>
              item.label === command.label &&
              item.status === 'passed' &&
              !item.reused_from &&
              JSON.stringify(item.command) === JSON.stringify([command.command, ...command.args]),
          )
          const originalLog = join(localRunsDirectory, `${source.run_id}.log`)
          const receiptPath = join(durableRunsDirectory, `${source.run_id}.json`)
          if (!prior || !existsSync(originalLog) || !existsSync(receiptPath)) continue
          const receipt = readJson(receiptPath)
          if (receipt.log_sha256 !== hash(readFileSync(originalLog))) continue
          reused = {
            ...prior,
            reused_from: { run_id: source.run_id, log_sha256: receipt.log_sha256 },
          }
          break
        }
      }
      const result = reused || (await runChild(command, environment, record, logStream, persist))
      if (reused) {
        record.commands.push(reused)
        logStream.write(
          `Reused ${command.label} from ${reused.reused_from.run_id}; identical repository input and environment.\n`,
        )
        persist()
      }
      if (result.exit_code !== 0) break
    }
    for (const runner of ['vitest', 'playwright']) {
      const reportPath = join(environment.IGNITE_ACCEPTANCE_RESULTS, `${runner}.json`)
      if (existsSync(reportPath)) record.acceptance_results.push(...readJson(reportPath).results)
    }
    const failed = record.commands.find((command) => command.status !== 'passed')
    const cancelled = record.status === 'cancelled' || Boolean(failed?.cancelled)
    record.exit_code = cancelled ? 130 : (failed?.exit_code ?? 0)
    record.status = cancelled ? 'cancelled' : failed ? 'failed' : 'passed'
    record.needs_retry = Boolean(failed) && !cancelled
    record.ended_at = now()
    record.heartbeat_at = now()
    if (!failed) assertCurrentInputs()
    await new Promise((resolve) => logStream.end(resolve))
    logStream = null
    let manifestPath = null
    persist()
    if (record.status === 'passed') manifestPath = publishEvidence(record, logPath)
    return {
      status: record.status,
      exitCode: record.exit_code,
      record,
      reused: false,
      manifestPath,
    }
  } catch (error) {
    if (!record) throw error
    record.status = 'failed'
    record.exit_code = 1
    record.needs_retry = true
    record.failure_reason = error.message
    record.ended_at = now()
    record.heartbeat_at = now()
    persist()
    console.error(`Ignite check: ${error.message}`)
    return { status: 'failed', exitCode: 1, record, reused: false, manifestPath: null }
  } finally {
    if (heartbeat) clearInterval(heartbeat)
    if (logStream) await new Promise((resolve) => logStream.end(resolve))
    releaseLock(lock, runId)
    try {
      unlinkSync(cancellationPath(runId))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
}

export function runStatus({ runId = null, verbose = false } = {}) {
  const runs = listLocalRuns()
    .filter((record) => !runId || record.run_id === runId)
    .map((record) => ({ ...record, derived_status: derivedRunStatus(record) }))
  if (runId && runs.length === 0) throw new Error(`run not found: ${runId}`)
  if (verbose) return runs
  return runs.map((record) => ({
    run_id: record.run_id,
    plan_id: record.plan_id,
    evidence_id: record.evidence_id,
    status: record.derived_status,
    started_at: record.started_at,
    ended_at: record.ended_at,
    needs_retry: record.derived_status === 'orphaned' || record.needs_retry,
    current_command: record.current_command || null,
    last_output_at: record.last_output_at || null,
    failure_reason: record.failure_reason || null,
  }))
}
