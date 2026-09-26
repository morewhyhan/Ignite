import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  currentCommit,
  executionWorkspaceIsClean,
  gitCommitExists,
  hash,
  makeSafeTestEnvironment,
  repositoryRoot,
} from './core.mjs'
import {
  acceptanceTestTitles,
  findPlan,
  planContractAtCommit,
  updatePlanMetadata,
  writeGeneratedStatus,
} from './state.mjs'

function matchingVitestCases(report, acceptanceId) {
  return (report.testResults || []).flatMap((suite) =>
    (suite.assertionResults || [])
      .filter((test) => `${test.fullName || test.title || ''}`.includes(acceptanceId))
      .map((test) => ({
        status: test.status,
        failures: test.failureMessages || [],
      })),
  )
}

function matchingPlaywrightCases(report, acceptanceId) {
  const cases = []
  const visit = (suite) => {
    for (const spec of suite.specs || []) {
      if (!`${spec.title || ''}`.includes(acceptanceId)) continue
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          cases.push({
            status: result.status,
            failures: [
              result.error?.message,
              ...(result.errors || []).map((error) => error.message),
            ].filter(Boolean),
          })
        }
      }
    }
    for (const child of suite.suites || []) visit(child)
  }
  for (const suite of report.suites || []) visit(suite)
  return cases
}

export function isBehaviorAssertionFailure(message) {
  if (message === 'Error: expect(page).toHaveScreenshot timed out') return false
  if (
    /(?:Cannot find module|ERR_MODULE_NOT_FOUND|ECONNREFUSED|ECONNRESET|browserType\.launch|Failed to launch|webServer.*(?:timeout|failed))/i.test(
      message,
    )
  )
    return false
  return /AssertionError|expect\([^\n]*\)\.(?:to|not)|expected .+ (?:to|not to)|Expected .+ (?:to|not to)|toHave(?:Text|URL|Value|Count|Attribute|Class|CSS)|toBe(?:Visible|Hidden|Enabled|Disabled|Checked|Focused|Truthy|Falsy|Defined|Null)|toEqual|toStrictEqual|toContain|toMatch/i.test(
    message,
  )
}

export function runTddRed(planId, acceptanceId) {
  const plan = findPlan(planId)
  if (plan.metadata.verification_contract < 2)
    throw new Error('TDD red evidence is available for verification_contract 2 Plans')
  if (plan.metadata.status !== 'active')
    throw new Error(
      'Write the real acceptance test first, then run tdd red while the Plan is active',
    )
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
  if (/(?:expect\.fail\s*\(|throw new Error\s*\(|replaces this red specification)/i.test(source))
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
  const isBrowser = check.layer === 'browser'
  const command = isBrowser
    ? [
        'corepack',
        ['pnpm', 'exec', 'playwright', 'test', testPath, '--grep', acceptanceId, '--reporter=json'],
      ]
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
  const result = spawnSync(command[0], command[1], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
    timeout: 180_000,
    env: environment,
    maxBuffer: 16 * 1024 * 1024,
  })

  let report = null
  try {
    const jsonText = isBrowser
      ? result.stdout
      : existsSync(reportPath)
        ? readFileSync(reportPath, 'utf8')
        : ''
    report = JSON.parse(jsonText)
  } catch {
    if (existsSync(reportPath)) unlinkSync(reportPath)
    throw new Error(
      'The test runner did not produce a readable JSON result; no red evidence was saved',
    )
  }
  if (existsSync(reportPath)) unlinkSync(reportPath)
  if (result.error)
    throw new Error(`TDD test runner failed before completing: ${result.error.message}`)
  if (result.status === 0)
    throw new Error(
      `${acceptanceId} passed before the implementation; no expected red result was recorded`,
    )

  const cases = isBrowser
    ? matchingPlaywrightCases(report, acceptanceId)
    : matchingVitestCases(report, acceptanceId)
  if (!cases.length) throw new Error(`${acceptanceId} was not found in the test result`)
  const failed = cases.filter((item) => item.status === 'failed')
  const failureText = failed.flatMap((item) => item.failures).join('\n')
  if (failed.length === 0 || !isBehaviorAssertionFailure(failureText))
    throw new Error(
      'The selected test did not fail with one recognizable behavior assertion; no red evidence was saved',
    )

  const redEvidencePath = `docs/others/evidence/tdd/${planId}/${runId}.json`
  const redEvidenceAbsolutePath = join(repositoryRoot, redEvidencePath)
  mkdirSync(dirname(redEvidenceAbsolutePath), { recursive: true })
  const record = {
    schema: 1,
    run_id: runId,
    plan_id: planId,
    acceptance_id: acceptanceId,
    test: check.test,
    layer: check.layer,
    status: 'assertion-failed',
    red_commit: commit,
    test_sha256: hash(source),
    output_sha256: hash(`${result.stdout || ''}\n${result.stderr || ''}`),
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
  return { ...record, evidence_path: redEvidencePath }
}
