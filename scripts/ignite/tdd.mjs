import { randomBytes } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  appendFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { runManagedCommand } from './managed-command.mjs'
import {
  currentCommit,
  executionWorkspaceIsClean,
  gitCommitExists,
  hash,
  makeSafeTestEnvironment,
  repositoryRoot,
} from './core.mjs'
import {
  findPlan,
  validatePlan,
  planContractAtCommit,
  updatePlanMetadata,
  writeGeneratedStatus,
} from './state.mjs'
import {
  configuredBrowserSetupPaths,
  acceptanceTestHasScaffoldFailure,
  acceptanceTestAssertionLocations,
  acceptanceTestContextFingerprint,
  acceptanceTestSource,
  acceptanceTestTitles,
} from './source-analysis.mjs'

export function matchingVitestCases(report, acceptanceId) {
  return (report.testResults || []).flatMap((suite) =>
    (suite.assertionResults || [])
      .filter((test) => `${test.fullName || test.title || ''}`.includes(acceptanceId))
      .map((test) => ({
        status: test.status,
        failures: test.failureMessages || [],
      })),
  )
}

export function matchingPlaywrightCases(report, acceptanceId) {
  const failureText = (failure) => {
    if (typeof failure === 'string') return failure
    if (!failure || typeof failure !== 'object') return ''
    const location =
      failure.location?.file && failure.location?.line && failure.location?.column
        ? `at ${failure.location.file}:${failure.location.line}:${failure.location.column}`
        : ''
    return [failure.message, failure.stack, location]
      .filter((value) => value !== undefined && value !== null)
      .join('\n')
  }
  if (Array.isArray(report.tests))
    return report.tests
      .filter((test) => `${test.title || ''}`.includes(acceptanceId))
      .map((test) => ({ status: test.status, failures: (test.failures || []).map(failureText) }))

  const cases = []
  const visit = (suite) => {
    for (const spec of suite.specs || []) {
      if (!`${spec.title || ''}`.includes(acceptanceId)) continue
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          cases.push({
            status: result.status,
            failures: [failureText(result.error), ...(result.errors || []).map(failureText)].filter(
              Boolean,
            ),
          })
        }
      }
    }
    for (const child of suite.suites || []) visit(child)
  }
  for (const suite of report.suites || []) visit(suite)
  return cases
}

/**
 * @param {string} source
 * @param {string} acceptanceId
 * @param {string | null} [expectedTitle=null]
 * @param {{ entryPath: string, readFile: (path: string) => string | null, testSupportPaths?: string[] } | null} [context=null]
 * @returns {{ schema: number, test_scope: string, test_sha256: string, context_schema?: number, context_sha256?: string, context_files?: string[], warnings?: string[] } | null}
 */
export function tddTestFingerprint(source, acceptanceId, expectedTitle = null, context = null) {
  const selectedTest = acceptanceTestSource(source, acceptanceId, expectedTitle)
  if (!selectedTest) return null
  const fingerprint = {
    schema: 2,
    test_scope: 'acceptance-case',
    test_sha256: hash(selectedTest),
  }
  if (context?.entryPath && typeof context.readFile === 'function') {
    const contextFingerprint = acceptanceTestContextFingerprint({
      entryPath: context.entryPath,
      acceptanceId,
      expectedTitle,
      readFile: context.readFile,
      testSupportPaths: context.testSupportPaths || [],
    })
    if (contextFingerprint) Object.assign(fingerprint, contextFingerprint)
  }
  return fingerprint
}

/** @returns {[string, string[]]} */
export function tddBrowserCommand(test, acceptanceId) {
  const [testPath] = test.split('::', 1)
  return ['corepack', ['pnpm', 'test:e2e', '--', testPath, '--grep', acceptanceId]]
}

/**
 * @param {string} message
 * @param {{ testPath: string, assertionLocations: Array<{ line: number, column: number, endLine: number, endColumn: number }> } | null} [provenance=null]
 * @returns {boolean}
 */
export function isBehaviorAssertionFailure(message, provenance = null) {
  if (
    /(?:Cannot find module|ERR_MODULE_NOT_FOUND|ECONNREFUSED|ECONNRESET|browserType\.launch|Failed to launch|webServer.*(?:timeout|failed))/i.test(
      message,
    )
  )
    return false
  const assertion =
    /AssertionError|expect\([^\n]*\)\.(?:to|not)|expected .+ (?:to|not to)|Expected .+ (?:to|not to)|toHave(?:Text|URL|Value|Count|Attribute|Class|CSS)|toBe(?:Visible|Hidden|Enabled|Disabled|Checked|Focused|Truthy|Falsy|Defined|Null|GreaterThan(?:OrEqual)?|LessThan(?:OrEqual)?|CloseTo|InstanceOf)|toEqual|toStrictEqual|toContain|toMatch/i.test(
      message,
    )
  if (!assertion || !provenance?.testPath || !Array.isArray(provenance.assertionLocations))
    return false
  const expectedPath = provenance.testPath.replaceAll('\\', '/')
  for (const match of message.matchAll(/(?:\(|at\s+|^)([^()\s]+):(\d+):(\d+)\)?/gm)) {
    const actualPath = match[1].replaceAll('\\', '/')
    if (!(actualPath === expectedPath || actualPath.endsWith(`/${expectedPath}`))) continue
    const line = Number(match[2])
    const column = Number(match[3])
    const lastAssertion = provenance.assertionLocations.reduce(
      (last, location) =>
        !last ||
        location.line > last.line ||
        (location.line === last.line && location.column > last.column)
          ? location
          : last,
      null,
    )
    if (
      lastAssertion &&
      line === lastAssertion.line &&
      column >= lastAssertion.column &&
      (line < lastAssertion.endLine ||
        (line === lastAssertion.endLine && column <= lastAssertion.endColumn))
    )
      return true
  }
  return false
}

export function summarizeTddFailures(cases) {
  const failures = cases.flatMap((item) => item.failures || [])
  const summary = failures
    .map((failure) => `${failure}`.replaceAll(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((failure) => failure.slice(0, 1200))
  return {
    failure_sha256: hash(JSON.stringify(failures)),
    failure_summary: summary.slice(0, 5),
    failure_summary_sha256: hash(JSON.stringify(summary.slice(0, 5))),
  }
}

export { configuredBrowserSetupPaths } from './source-analysis.mjs'

export function readTddReport(result, reportPath, logLocation) {
  const diagnostic = `${result.stderr || result.stdout}`.trim().slice(-2000)
  if (result.error || result.timedOut || result.cancelled || result.signal) {
    const cause =
      result.error ||
      (result.timedOut ? 'timeout' : result.cancelled ? 'cancelled' : `signal ${result.signal}`)
    throw new Error(
      `TDD runner ${cause}; no red evidence was saved. Log: ${logLocation}${diagnostic ? `\n${diagnostic}` : ''}`,
    )
  }
  try {
    const report = JSON.parse(readFileSync(reportPath, 'utf8'))
    if (!report || typeof report !== 'object' || Array.isArray(report))
      throw new Error('invalid report object')
    return report
  } catch {
    throw new Error(
      `The test runner did not produce a readable JSON result; no red evidence was saved. Exit: ${result.exitCode}. Log: ${logLocation}${diagnostic ? `\n${diagnostic}` : ''}`,
    )
  }
}

export async function runTddRed(planId, acceptanceId) {
  const plan = findPlan(planId)
  if (plan.metadata.verification_contract < 2)
    throw new Error('TDD red evidence is available for verification_contract 2 Plans')
  if (plan.metadata.status !== 'active')
    throw new Error(
      'Write the real acceptance test first, then run tdd red while the Plan is active',
    )
  if (plan.metadata.task_contract === 2) {
    const tasks = plan.metadata.tasks || []
    if (
      !tasks.some(
        (task) =>
          task.phase === 'red' &&
          task.status === 'doing' &&
          task.acceptance?.includes(acceptanceId),
      )
    )
      throw new Error(
        'Start the matching red task with ignite task set-status before recording red',
      )
    const failures = validatePlan(plan).filter((error) =>
      /before the first valid red|Complete preparation|requires a prepare task/.test(error),
    )
    if (failures.length) throw new Error(failures.join('\n'))
  }
  if (!executionWorkspaceIsClean())
    throw new Error('Commit the specification and test before recording the red result')
  const commit = currentCommit()
  if (!gitCommitExists(commit) || !planContractAtCommit(plan, commit))
    throw new Error('The current commit must contain the stable Plan and acceptance test')
  const acceptance = plan.metadata.acceptance.find((item) => item.id === acceptanceId)
  if (!acceptance) throw new Error(`unknown acceptance criterion ${acceptanceId} in ${planId}`)
  const check =
    (acceptance.checks || []).find((item) => item.layer === 'unit') ||
    (acceptance.checks || []).find((item) => item.layer === 'browser') ||
    (acceptance.checks || [])[0]
  if (!check) throw new Error(`${acceptanceId} has no executable test mapping`)
  const [testPath] = check.test.split('::', 1)
  const absoluteTestPath = join(repositoryRoot, testPath)
  if (!existsSync(absoluteTestPath)) throw new Error(`acceptance test is missing: ${testPath}`)
  const source = readFileSync(absoluteTestPath, 'utf8')
  if (!acceptanceTestTitles(source).has(acceptanceId))
    throw new Error(`${testPath} does not contain an executable ${acceptanceId} test`)
  const testTitle = check.test.slice(check.test.indexOf('::') + 2)
  const sourceReader = (path) => {
    const absolutePath = join(repositoryRoot, path)
    return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : null
  }
  const testFingerprint = tddTestFingerprint(source, acceptanceId, testTitle, {
    entryPath: testPath,
    readFile: sourceReader,
    testSupportPaths: check.layer === 'browser' ? configuredBrowserSetupPaths(sourceReader) : [],
  })
  if (!testFingerprint) throw new Error(`${testPath} has no active test case for ${acceptanceId}`)
  const assertionLocations = acceptanceTestAssertionLocations(source, acceptanceId, testTitle, {
    requireTargetMarker: true,
  })
  if (assertionLocations.length === 0)
    throw new Error(
      `${testPath} has no target assertion for ${acceptanceId}; mark the behavior assertion with expect(actual, '[${acceptanceId}] target')`,
    )
  if (acceptanceTestHasScaffoldFailure(source, acceptanceId))
    throw new Error(
      `${testPath} still contains a scaffold failure; write the behavior assertion first`,
    )

  const runId = `tdd-${new Date()
    .toISOString()
    .replaceAll(/[-:.TZ]/g, '')
    .slice(0, 14)}-${randomBytes(3).toString('hex')}`
  const tempDirectory = join(repositoryRoot, '.ignite', 'tdd-runs')
  mkdirSync(tempDirectory, { recursive: true })
  const reportPath = join(tempDirectory, `${runId}.json`)
  const logPath = join(tempDirectory, `${runId}.log`)
  const isBrowser = check.layer === 'browser'
  /** @type {[string, string[]]} */
  const command = isBrowser
    ? tddBrowserCommand(check.test, acceptanceId)
    : [
        'corepack',
        [
          'pnpm',
          'exec',
          'vitest',
          'run',
          testPath,
          '--testNamePattern',
          acceptanceId,
          '--reporter=json',
          `--outputFile=${reportPath}`,
        ],
      ]
  const startedAt = new Date().toISOString()
  const environment = makeSafeTestEnvironment()
  environment.APP_ENV = 'test'
  environment.IGNITE_PLAN_ID = planId
  environment.IGNITE_TDD_AC = acceptanceId
  environment.IGNITE_TDD_REPORT_PATH = reportPath
  writeFileSync(logPath, `TDD ${planId} ${acceptanceId}\n`, 'utf8')
  const result = await runManagedCommand({
    command: command[0],
    args: command[1],
    cwd: repositoryRoot,
    env: environment,
    timeoutMs: isBrowser ? 10 * 60_000 : 3 * 60_000,
    onOutput: (stream, text) => {
      appendFileSync(logPath, text, 'utf8')
      ;(stream === 'stderr' ? process.stderr : process.stdout).write(text)
    },
  })

  const location = `.ignite/tdd-runs/${runId}.log`
  const report = readTddReport(result, reportPath, location)
  if (result.exitCode === 0)
    throw new Error(
      `${acceptanceId} passed before the implementation; no expected red result was recorded`,
    )

  const cases = isBrowser
    ? matchingPlaywrightCases(report, acceptanceId)
    : matchingVitestCases(report, acceptanceId)
  if (!cases.length) throw new Error(`${acceptanceId} was not found in the test result`)
  if ((report.errors || []).length)
    throw new Error(`Test preparation failed; no red evidence was saved. Log: ${location}`)
  const failed = cases.filter((item) => item.status === 'failed')
  const failureText = failed.flatMap((item) => item.failures).join('\n')
  const failuresAttributed =
    failed.length > 0 &&
    failed.every(
      (item) =>
        item.failures.length > 0 &&
        item.failures.every((failure) =>
          isBehaviorAssertionFailure(failure, { testPath, assertionLocations }),
        ),
    )
  if (!failuresAttributed)
    throw new Error(
      `The selected test did not fail with one recognizable behavior assertion; no red evidence was saved${failureText ? `: ${failureText.slice(0, 1200)}` : ''}`,
    )

  const redEvidencePath = `docs/others/evidence/tdd/${planId}/${runId}.json`
  const redEvidenceAbsolutePath = join(repositoryRoot, redEvidencePath)
  mkdirSync(dirname(redEvidenceAbsolutePath), { recursive: true })
  const failureEvidence = summarizeTddFailures(failed)
  const record = {
    ...testFingerprint,
    run_id: runId,
    plan_id: planId,
    acceptance_id: acceptanceId,
    test: check.test,
    layer: check.layer,
    status: 'assertion-failed',
    target_assertion_contract: 'ac-message-marker-v1',
    red_commit: commit,
    output_sha256: hash(`${result.stdout || ''}\n${result.stderr || ''}`),
    ...failureEvidence,
    command: isBrowser
      ? [command[0], ...command[1]]
      : [
          command[0],
          ...command[1].map((argument) =>
            argument.startsWith('--outputFile=')
              ? '--outputFile=<temporary-json-report>'
              : argument,
          ),
        ],
    started_at: startedAt,
    ended_at: new Date().toISOString(),
    executor: 'ignite-tdd-runner',
  }
  writeFileSync(redEvidenceAbsolutePath, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
  updatePlanMetadata(findPlan(planId), (metadata) => {
    metadata.tdd_evidence = [
      ...(metadata.tdd_evidence || []).filter((item) => item.acceptance_id !== acceptanceId),
      { acceptance_id: acceptanceId, test: check.test, run_id: runId },
    ]
    metadata.updated_at = new Date().toISOString().slice(0, 10)
    return metadata
  })
  writeGeneratedStatus()
  if (existsSync(reportPath)) unlinkSync(reportPath)
  return { ...record, evidence_path: redEvidencePath }
}
