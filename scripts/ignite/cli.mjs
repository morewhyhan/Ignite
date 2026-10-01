import { spawnSync } from 'node:child_process'
import { adoptHistory } from './adoption.mjs'
import { planCheck } from './checks.mjs'
import { createInputFingerprintContext, currentCommit, repositoryRoot } from './core.mjs'
import { verifyRemoteDelivery } from './delivery.mjs'
import {
  deriveRelease,
  evidenceCoverage,
  findPlan,
  listPlanFiles,
  listReleases,
  readPlan,
  reintegratePlan,
  renderStatus,
  setPlanStatus,
  specificationRegistry,
  templateMode,
  validateAllPlans,
  validateAllReleases,
  validatePlan,
  validatePlanReleaseContract,
  validatePlanDependencies,
  validateRelease,
  listPlans,
  listDurableRuns,
  writeGeneratedStatus,
  updatePlanTask,
  updatePlanMetadata,
} from './state.mjs'
import { exampleRemovalPlan } from './examples.mjs'
import {
  validateAgentBridges,
  validateCiCompletion,
  validateDesignArtifacts,
  validateGeneratedStatus,
  validateRuntimeContract,
  validateTraceability,
} from './governance.mjs'
import { executeCheckPlan, requestRunCancellation, runStatus } from './runs.mjs'
import { runTddRed } from './tdd.mjs'
import { summarizeVerification } from './verification-summary.mjs'

function parseArgs(argv) {
  const options = {}
  const positionals = []
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === '--') continue
    if (token.startsWith('--')) {
      const [key, inlineValue] = token.slice(2).split('=', 2)
      if (inlineValue !== undefined) options[key] = inlineValue
      else if (argv[index + 1] && !argv[index + 1].startsWith('--')) options[key] = argv[++index]
      else options[key] = true
    } else positionals.push(token)
  }
  return { options, positionals }
}

function fail(message, code = 1) {
  console.error(`Ignite: ${message}`)
  process.exitCode = code
}

const generalHelp = `Usage: pnpm ignite <command> [options]

Commands:
  validate [--ci]
  status [--write|--json]
  next --plan <id> [--verify-remote] [--verbose]
  check --plan <id> [--level auto|dev|integration|release]
  plan validate [id]
  plan set-status <id> <status>
  plan reintegrate <id>
  plan refresh <id>
  task set-status <plan-id> <task-id> <todo|doing|done>
  run status [run-id] [--verbose]
  run cancel <run-id>
  release status [release-id] [--verbose]
  release verify <release-id> --plan <done-plan-id>
  adopt-history [--apply]
  tdd red --plan <id> --ac <AC-id>
  example removal-plan tasks

Use pnpm ignite <command> --help for command details.
`

const commandHelp = new Map([
  [
    'validate',
    'Usage: pnpm ignite validate [--ci]\nValidate Plans, Releases, traceability, Design, AI bridges and runtime.\n',
  ],
  [
    'status',
    'Usage: pnpm ignite status [--write|--json]\nPrint the concise project summary; --json emits full machine-readable context.\n',
  ],
  [
    'next',
    'Usage: pnpm ignite next --plan <id> [--verify-remote] [--verbose]\nShow the next action for a Plan from its current state and evidence.\n',
  ],
  [
    'check',
    'Usage: pnpm ignite check --plan <id> [--level auto|dev|integration|release]\nRun and record checks for a Plan.\n',
  ],
  [
    'plan',
    'Usage: pnpm ignite plan <validate|set-status|reintegrate|refresh> ...\nUse pnpm ignite plan <subcommand> --help for details.\n',
  ],
  [
    'plan validate',
    'Usage: pnpm ignite plan validate [id]\nValidate all structured Plans or one selected Plan.\n',
  ],
  [
    'plan set-status',
    'Usage: pnpm ignite plan set-status <id> <status> [--blocker id|owner|reason|resume_action]\nMove a Plan through its allowed lifecycle.\n',
  ],
  [
    'plan reintegrate',
    'Usage: pnpm ignite plan reintegrate <id>\nRebind a completed Plan after final integration; rerun checks on merged HEAD.\n',
  ],
  [
    'plan refresh',
    'Usage: pnpm ignite plan refresh <id>\nRefresh generated Plan progress and project status.\n',
  ],
  [
    'task',
    'Usage: pnpm ignite task set-status <plan-id> <task-id> <todo|doing|done>\nUpdate a Plan task and generated progress.\n',
  ],
  [
    'run',
    'Usage: pnpm ignite run <status|cancel> [run-id]\nInspect or cancel a recorded check run.\n',
  ],
  ['release', 'Usage: pnpm ignite release <status|verify> ...\nInspect or verify a Release.\n'],
  [
    'adopt-history',
    'Usage: pnpm ignite adopt-history [--apply]\nPreview or archive inherited template execution history after creating a new Git history.\n',
  ],
  [
    'tdd',
    'Usage: pnpm ignite tdd red --plan <id> --ac <AC-id>\nRun the selected acceptance test and record a real behavior-assertion red result.\n',
  ],
  [
    'example',
    'Usage: pnpm ignite example removal-plan tasks\nShow the inventory needed to remove template Tasks safely.\n',
  ],
])

function printHelp(target = []) {
  const key = target.join(' ')
  process.stdout.write(commandHelp.get(key) || commandHelp.get(target[0]) || generalHelp)
}

function checkRuntime() {
  if (process.env.IGNITE_SKIP_RUNTIME_CHECK === 'true') return
  const result = spawnSync(process.execPath, ['scripts/runtime-doctor.mjs'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: process.env,
    windowsHide: true,
  })
  if (result.status !== 0) throw new Error((result.stderr || result.stdout).trim())
}

async function commandValidate(options) {
  const plans = listPlans()
  const releases = listReleases()
  const failures = [
    ...validateAllPlans(plans, releases),
    ...validateAllReleases(releases, plans),
    ...validateTraceability(),
    ...(await validateDesignArtifacts()),
    ...validateAgentBridges(),
    ...validateRuntimeContract(),
  ]
  if (options.ci) failures.push(...validateGeneratedStatus(), ...validateCiCompletion())
  if (failures.length) return fail(failures.join('\n- '))
  console.log('Ignite governance validation passed.')
}

function commandPlanValidate(positionals) {
  const explicit = positionals.length > 0
  const targets = explicit
    ? positionals.map((identifier) => findPlan(identifier).path)
    : listPlanFiles()
  const failures = []
  let structuredCount = 0
  let legacyCount = 0
  for (const path of targets) {
    const plan = readPlan(path)
    if (!plan.metadata && !explicit) {
      legacyCount += 1
      continue
    }
    if (plan.metadata) structuredCount += 1
    for (const error of validatePlan(plan, { allowLegacy: false })) {
      failures.push(`${plan.relativePath}: ${error}`)
    }
  }
  if (failures.length) return fail(failures.join('\n- '))
  console.log(
    `Validated ${structuredCount} structured Plan(s); ${legacyCount} legacy record(s) skipped.`,
  )
}

function commandPlanSetStatus(positionals, options) {
  if (positionals.length < 2) throw new Error('plan set-status requires <plan-id> <status>')
  let blocker = null
  if (positionals[1] === 'blocked') {
    const fields = String(options.blocker || '').split('|')
    if (fields.length !== 4 || fields.some((field) => !field.trim())) {
      throw new Error('--blocker must be id|owner|reason|resume_action')
    }
    blocker = {
      id: fields[0],
      owner: fields[1],
      reason: fields[2],
      resume_action: fields[3],
    }
  }
  const plan = setPlanStatus(positionals[0], positionals[1], {
    blocker,
    commit: options.commit || null,
  })
  console.log(`Updated ${plan.metadata.id} to ${plan.metadata.status}.`)
}

function commandStatus(options) {
  if (options.write) {
    const changed = writeGeneratedStatus()
    console.log(changed ? 'Updated docs/others/ignite-status.md.' : 'Status is already current.')
  } else if (options.json) {
    const allPlans = listPlans()
    const releaseEntries = listReleases()
    const manifests = new Map(listDurableRuns().map(({ value }) => [value.run_id, value]))
    const planFailuresById = new Map(
      allPlans
        .filter((plan) => plan.metadata)
        .map((plan) => [plan.metadata.id, validatePlan(plan)]),
    )
    const fingerprintForPlan = createInputFingerprintContext()
    console.log(
      JSON.stringify(
        {
          template_mode: templateMode(),
          plans: allPlans.filter((plan) => plan.metadata).map((plan) => plan.metadata),
          legacy_plans: allPlans.filter((plan) => !plan.metadata).map((plan) => plan.relativePath),
          releases: releaseEntries.map(({ value }) =>
            deriveRelease(value, {
              planSnapshot: allPlans,
              manifests,
              planFailuresById,
              fingerprintForPlan,
            }),
          ),
          failures: [
            ...validateAllPlans(allPlans, releaseEntries, { planFailuresById }),
            ...validateAllReleases(releaseEntries, allPlans),
          ],
        },
        null,
        2,
      ),
    )
  } else process.stdout.write(renderStatus())
}

function commandReleaseStatus(positionals, options) {
  const plans = listPlans()
  const releaseEntries = listReleases()
  const manifests = new Map(listDurableRuns().map(({ value }) => [value.run_id, value]))
  const selectedEntries = releaseEntries.filter(
    ({ value }) => !positionals[0] || value.id === positionals[0],
  )
  const planFailuresById = new Map(
    plans.filter((plan) => plan.metadata).map((plan) => [plan.metadata.id, validatePlan(plan)]),
  )
  const fingerprintForPlan = createInputFingerprintContext()
  const selected = selectedEntries.map(({ value }) =>
    deriveRelease(value, { planSnapshot: plans, manifests, planFailuresById, fingerprintForPlan }),
  )
  if (positionals[0] && selected.length === 0)
    throw new Error(`release not found: ${positionals[0]}`)
  const output = options.verbose
    ? selected
    : selected.map((release) => ({
        id: release.id,
        status: release.status,
        plan_ids: release.plan_ids,
        next_action: release.next_action,
        failures: release.failures,
        missing_evidence: release.missing_evidence,
        outstanding_scope: release.outstanding_scope,
        excluded_plans: release.excluded_plans,
      }))
  console.log(JSON.stringify(output, null, 2))
  if (selected.some((release) => release.status === 'invalid')) process.exitCode = 1
}

async function commandReleaseVerify(positionals, options) {
  const releaseId = positionals[0]
  if (!releaseId || !options.plan)
    throw new Error('release verify <release-id> --plan <done-plan-id>')
  const release = listReleases().find(({ value }) => value.id === releaseId)?.value
  if (!release) throw new Error(`release not found: ${releaseId}`)
  if (release.verification_contract !== 2)
    throw new Error('release verify is available for verification_contract 2 Releases')
  const plans = release.plan_ids.map((id) => findPlan(id))
  const includedPlans = plans.filter(
    (plan) => !['cancelled', 'superseded'].includes(plan.metadata.status),
  )
  if (includedPlans.some((plan) => plan.metadata.status !== 'done'))
    throw new Error('complete and verify every included Plan before Release verification')
  if (!includedPlans.some((plan) => plan.metadata.id === options.plan))
    throw new Error(`anchor Plan ${options.plan} is outside Release ${releaseId}`)
  if (includedPlans.some((plan) => evidenceCoverage(plan).some((item) => item.status !== 'passed')))
    throw new Error('Release verification requires valid evidence for every included Plan')
  const derived = deriveRelease(release)
  if (derived.outstanding_scope.length || derived.failures.length)
    throw new Error(
      `Release scope is not ready:\n- ${[...derived.failures, ...derived.outstanding_scope.map((goal) => `${goal.id}: ${goal.text}`)].join('\n- ')}`,
    )
  checkRuntime()
  const plan = findPlan(options.plan)
  const checkPlan = planCheck({ plan, requestedLevel: 'release', releaseVerification: true })
  const result = await executeCheckPlan({ plan, checkPlan, release })
  console.log(
    JSON.stringify(
      {
        release_id: releaseId,
        run_id: result.record.run_id,
        status: result.status,
        reused: result.reused,
        evidence: result.manifestPath || null,
        verification:
          result.record?.plan_id === plan.metadata.id
            ? summarizeVerification(result.record, plan, { planEvidencePassed: true })
            : null,
      },
      null,
      2,
    ),
  )
  if (result.exitCode !== 0) process.exitCode = result.exitCode
}

function commandTddRed(options) {
  if (!options.plan || !options.ac) throw new Error('tdd red --plan <plan-id> --ac <acceptance-id>')
  checkRuntime()
  const record = runTddRed(options.plan, options.ac)
  console.log(
    JSON.stringify(
      {
        plan_id: record.plan_id,
        acceptance_id: record.acceptance_id,
        status: record.status,
        run_id: record.run_id,
        red_commit: record.red_commit,
        evidence_path: record.evidence_path,
        next: 'Commit the red record before implementing; do not modify the acceptance test before its green verification.',
      },
      null,
      2,
    ),
  )
}

async function commandCheck(options) {
  if (!options.plan) throw new Error('check requires --plan IGT-000')
  checkRuntime()
  const plan = findPlan(options.plan)
  const planErrors = [
    ...validatePlan(plan, { allowLegacy: false }),
    ...validatePlanDependencies(plan),
  ]
  if (planErrors.length) throw new Error(`invalid Plan:\n- ${planErrors.join('\n- ')}`)
  const explicitFiles = options.files
    ? String(options.files)
        .split(',')
        .map((file) => file.trim())
        .filter(Boolean)
    : null
  const checkPlan = planCheck({
    plan,
    requestedLevel: options.level || 'auto',
    explicitFiles,
    dryRun: Boolean(options['dry-run']),
  })
  console.log(
    JSON.stringify(
      {
        level: checkPlan.level,
        minimum_level: checkPlan.minimum,
        changed_files: checkPlan.changedFiles,
        commands: checkPlan.commands.map((item) => [item.command, ...item.args]),
      },
      null,
      2,
    ),
  )
  if (options['dry-run']) return
  const result = await executeCheckPlan({ plan, checkPlan, force: Boolean(options.force) })
  console.log(
    JSON.stringify(
      {
        run_id: result.record.run_id,
        status: result.status,
        reused: result.reused,
        evidence: result.manifestPath || null,
        verification:
          result.record?.plan_id === plan.metadata.id
            ? summarizeVerification(result.record, plan)
            : null,
      },
      null,
      2,
    ),
  )
  if (result.exitCode !== 0) process.exitCode = result.exitCode
}

function commandRunStatus(positionals, options) {
  console.log(
    JSON.stringify(
      runStatus({ runId: positionals[0] || null, verbose: Boolean(options.verbose) }),
      null,
      2,
    ),
  )
}

function commandNext(options) {
  if (!options.plan) throw new Error('next requires --plan IGT-000')
  const remoteDelivery = options['verify-remote']
    ? verifyRemoteDelivery()
    : { remote_sync: 'not_verified', branch: null, remote_commit: null }
  const allPlans = listPlans()
  const plan = allPlans.find(
    (candidate) =>
      candidate.relativePath === options.plan || candidate.metadata?.id === options.plan,
  )
  if (!plan) throw new Error(`structured plan not found: ${options.plan}`)
  const releaseEntry = listReleases().find(({ value }) => value.id === plan.metadata.release)
  const releasePath = releaseEntry?.path
    ? releaseEntry.path.slice(repositoryRoot.length + 1).replaceAll('\\', '/')
    : `docs/plans/releases/${plan.metadata.release}.json`
  const registry = specificationRegistry()
  const featurePaths = [
    ...new Set(
      (plan.metadata.requirements || []).map((id) => registry.requirements.get(id)).filter(Boolean),
    ),
  ]
  const planFailures = validatePlan(plan, { allowLegacy: false })
  const failures = [
    ...planFailures,
    ...validatePlanDependencies(plan, allPlans),
    ...validatePlanReleaseContract(plan, releaseEntry?.value),
    ...(releaseEntry
      ? validateRelease(
          releaseEntry.value,
          new Map(allPlans.map((item) => [item.metadata?.id, item])),
        ).map((error) => `Release ${releaseEntry.value.id}: ${error}`)
      : []),
  ]
  const fingerprintForPlan = createInputFingerprintContext()
  const latestRun = runStatus({ verbose: true }).find(
    (run) => run.plan_id === plan.metadata.id && run.status !== 'corrupt',
  )
  const runState = latestRun?.derived_status || null
  const currentRunInput = latestRun?.input_fingerprint === fingerprintForPlan(plan)
  const evidenceStatus = evidenceCoverage(plan, null, {
    validationFailures: planFailures,
    fingerprintForPlan,
  })
  const missingEvidence = evidenceStatus
    .filter((item) => item.status !== 'passed')
    .map((item) => item.evidence_id)
  const unfinishedTasks = (plan.metadata.tasks || []).filter((task) => task.status !== 'done')
  let nextAction
  if (failures.length) {
    const integrationLost = failures.some(
      (item) =>
        !item.startsWith('Release ') &&
        /integrated_commit (must be an ancestor|must be a real)/.test(item),
    )
    nextAction = integrationLost
      ? {
          kind: 'reintegrate',
          reason: failures,
          command: `pnpm ignite plan reintegrate ${plan.metadata.id}`,
        }
      : {
          kind: 'repair-input',
          reason: failures,
          files: [plan.relativePath, releasePath],
          command: null,
        }
  } else if (['done', 'cancelled', 'superseded'].includes(plan.metadata.status)) {
    nextAction = { kind: 'report-result', reason: plan.metadata.status, command: null }
  } else if (plan.metadata.status === 'blocked') {
    nextAction = {
      kind: 'wait-for-blocker',
      reason: plan.metadata.blocker,
      command: null,
    }
  } else if (runState === 'running') {
    nextAction = {
      kind: 'wait-for-run',
      reason: `run ${latestRun.run_id} is still active`,
      command: `pnpm ignite run status ${latestRun.run_id}`,
    }
  } else if (currentRunInput && ['failed', 'orphaned', 'cancelled'].includes(runState)) {
    nextAction = {
      kind: 'diagnose-run',
      reason: latestRun.failure_reason || `run ${latestRun.run_id} ${runState}`,
      command: `pnpm ignite run status ${latestRun.run_id} --verbose`,
    }
  } else if (plan.metadata.status === 'draft') {
    nextAction = {
      kind: 'complete-plan',
      reason: 'close open questions and complete the execution contract',
      command: `pnpm ignite plan set-status ${plan.metadata.id} ready`,
    }
  } else if (plan.metadata.status === 'ready') {
    nextAction = {
      kind: 'start-plan',
      reason: 'dependencies and input are ready',
      command: `pnpm ignite plan set-status ${plan.metadata.id} active`,
    }
  } else if (plan.metadata.status === 'active') {
    nextAction = plan.metadata.remaining_work?.length
      ? {
          kind: 'address-acceptance-gap',
          reason: `${plan.metadata.remaining_work.length} acceptance gaps remain; first: ${plan.metadata.remaining_work[0]}`,
          command: null,
        }
      : plan.metadata.execution_contract === 1 && unfinishedTasks.length
        ? {
            kind: 'continue-task',
            reason:
              'Resume unfinished work using the Plan goals and whole-task judgment; choose the priority from that basis. Fast checks remain available as needed.',
            task_ids: (unfinishedTasks.some((task) => task.status === 'doing')
              ? unfinishedTasks.filter((task) => task.status === 'doing')
              : unfinishedTasks
            ).map((task) => task.id),
            files: [plan.relativePath, ...featurePaths],
            command: null,
          }
        : !missingEvidence.includes(
              plan.metadata.risk === 'docs' ? 'check-dev' : 'check-integration',
            )
          ? {
              kind: 'start-verification',
              reason: 'the current development checks passed; continue to release verification',
              command: `pnpm ignite plan set-status ${plan.metadata.id} verifying --commit HEAD`,
            }
          : {
              kind: 'implement-and-check',
              reason: 'implement the next task and validate its acceptance criteria',
              command: `pnpm ignite check --plan ${plan.metadata.id} --level auto`,
            }
  } else if (plan.metadata.status === 'verifying') {
    const missingIntegration = missingEvidence.includes('check-integration')
    const missingDev = missingEvidence.includes('check-dev')
    const nextLevel = missingIntegration ? 'integration' : missingDev ? 'dev' : 'release'
    nextAction = plan.metadata.remaining_work?.length
      ? {
          kind: 'complete-remaining-work',
          reason: plan.metadata.remaining_work,
          command: `pnpm ignite plan set-status ${plan.metadata.id} active`,
        }
      : missingEvidence.length
        ? {
            kind: `verify-${nextLevel}`,
            reason: `missing evidence: ${missingEvidence.join(', ')}`,
            command: `pnpm ignite check --plan ${plan.metadata.id} --level ${nextLevel}`,
          }
        : unfinishedTasks.length
          ? {
              kind: 'complete-tasks',
              reason: `finish and record the remaining tasks: ${unfinishedTasks.map((task) => task.id).join(', ')}`,
              command: null,
            }
          : {
              kind: 'complete-plan',
              reason: 'required evidence is bound; current inputs still need final validation',
              command: `pnpm ignite plan set-status ${plan.metadata.id} done`,
            }
  } else {
    nextAction = { kind: 'report-result', reason: plan.metadata.status, command: null }
  }
  const fullOutput = {
    plan_id: plan.metadata.id,
    status: plan.metadata.status,
    outcome: plan.metadata.outcome,
    goals: plan.metadata.goals || [],
    constraints: plan.metadata.constraints || [],
    non_goals: plan.metadata.non_goals || [],
    authorization: plan.metadata.authorization || null,
    open_questions: plan.metadata.open_questions || [],
    remaining_work: plan.metadata.remaining_work || [],
    tasks: plan.metadata.tasks || [],
    evidence_coverage: evidenceStatus,
    shared_files: plan.metadata.shared_files || [],
    dependency_contracts: plan.metadata.dependency_contracts || [],
    handoff: plan.metadata.handoff || null,
    plan_path: plan.relativePath,
    context: {
      repository_root: repositoryRoot,
      base_commit: plan.metadata.base_commit,
      write_scope: plan.metadata.write_scope || [],
      requirements: plan.metadata.requirements || [],
      features: featurePaths,
      acceptance: plan.metadata.acceptance || [],
      entrypoints: {
        rules: 'AGENTS.md',
        standards: 'docs/standards/',
        designs: 'docs/designs/',
      },
    },
    latest_run: latestRun
      ? {
          run_id: latestRun.run_id,
          status: runState,
          input_current: currentRunInput,
          current_command: latestRun.current_command || null,
          last_output_at: latestRun.last_output_at || null,
        }
      : null,
    next_action: nextAction,
    delivery: {
      deliverables: plan.metadata.deliverables || [],
      local_commit: currentCommit(),
      local_plan_status: plan.metadata.status,
      ...remoteDelivery,
      deployed_url: null,
    },
  }
  const output = options.verbose
    ? fullOutput
    : {
        plan_id: fullOutput.plan_id,
        status: fullOutput.status,
        outcome: fullOutput.outcome,
        goals: fullOutput.goals,
        constraints: fullOutput.constraints,
        non_goals: fullOutput.non_goals,
        tasks: fullOutput.tasks,
        plan_path: fullOutput.plan_path,
        remaining_work: fullOutput.remaining_work,
        evidence_coverage: fullOutput.evidence_coverage,
        latest_run: fullOutput.latest_run,
        next_action: fullOutput.next_action,
        delivery: fullOutput.delivery,
      }
  console.log(JSON.stringify(output, null, 2))
}

export async function main(argv = process.argv.slice(2)) {
  const requestsHelp = argv[0] === 'help' || argv.includes('--help') || argv.includes('-h')
  if (requestsHelp) {
    const target = argv
      .filter((argument) => argument !== '--help' && argument !== '-h')
      .slice(argv[0] === 'help' ? 1 : 0)
    printHelp(target)
    return
  }
  const command = argv[0]
  const hasSubcommand = ['plan', 'run', 'release', 'task', 'example', 'tdd'].includes(command)
  const subcommand = hasSubcommand ? argv[1] : null
  const { options, positionals } = parseArgs(argv.slice(hasSubcommand ? 2 : 1))

  if (command === 'validate') return commandValidate(options)
  if (command === 'task' && subcommand === 'set-status') {
    if (positionals.length !== 3)
      throw new Error('task set-status <plan-id> <task-id> <todo|doing|done>')
    console.log(JSON.stringify(updatePlanTask(...positionals).metadata.tasks, null, 2))
    return
  }
  if (command === 'plan' && subcommand === 'refresh') {
    const plan = findPlan(positionals[0])
    updatePlanMetadata(plan, (metadata) => metadata)
    writeGeneratedStatus()
    return
  }
  if (command === 'example' && subcommand === 'removal-plan') {
    console.log(JSON.stringify(exampleRemovalPlan(positionals[0] || 'tasks'), null, 2))
    return
  }
  if (command === 'adopt-history') {
    console.log(JSON.stringify(adoptHistory({ apply: options.apply === true }), null, 2))
    return
  }
  if (command === 'status') return commandStatus(options)
  if (command === 'next') return commandNext(options)
  if (command === 'check') return commandCheck(options)
  if (command === 'plan' && subcommand === 'validate') return commandPlanValidate(positionals)
  if (command === 'plan' && subcommand === 'set-status')
    return commandPlanSetStatus(positionals, options)
  if (command === 'plan' && subcommand === 'reintegrate') {
    if (!positionals[0]) throw new Error('plan reintegrate requires <plan-id>')
    const plan = reintegratePlan(positionals[0])
    console.log(`Reintegrated ${plan.metadata.id}; rerun integration and release on merged HEAD.`)
    return
  }
  if (command === 'run' && subcommand === 'status') return commandRunStatus(positionals, options)
  if (command === 'run' && subcommand === 'cancel') {
    if (!positionals[0]) throw new Error('run cancel requires <run-id>')
    console.log(JSON.stringify(requestRunCancellation(positionals[0]), null, 2))
    return
  }
  if (command === 'release' && subcommand === 'status')
    return commandReleaseStatus(positionals, options)
  if (command === 'release' && subcommand === 'verify')
    return commandReleaseVerify(positionals, options)
  if (command === 'tdd' && subcommand === 'red') return commandTddRed(options)
  throw new Error('Unknown command. Run pnpm ignite --help to see valid commands.')
}

export function runMain() {
  main().catch((error) => fail(error.stack || error.message))
}
