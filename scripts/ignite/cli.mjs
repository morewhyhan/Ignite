import { spawnSync } from 'node:child_process'
import { adoptHistory } from './adoption.mjs'
import { planCheck } from './checks.mjs'
import { repositoryRoot } from './core.mjs'
import {
  deriveRelease,
  findPlan,
  listPlanFiles,
  listReleases,
  readPlan,
  renderStatus,
  setPlanStatus,
  templateMode,
  validateAllPlans,
  validateAllReleases,
  validatePlan,
  writeGeneratedStatus,
} from './state.mjs'
import {
  validateAgentBridges,
  validateCiCompletion,
  validateDesignArtifacts,
  validateGeneratedStatus,
  validateRuntimeContract,
  validateTraceability,
} from './governance.mjs'
import { executeCheckPlan, runStatus } from './runs.mjs'

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
  const failures = [
    ...validateAllPlans(),
    ...validateAllReleases(),
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
  const summary = renderStatus()
  if (options.write) {
    const changed = writeGeneratedStatus()
    console.log(changed ? 'Updated docs/others/ignite-status.md.' : 'Status is already current.')
  } else if (options.json) {
    const allPlans = listPlanFiles().map(readPlan)
    console.log(
      JSON.stringify(
        {
          template_mode: templateMode(),
          plans: allPlans.filter((plan) => plan.metadata).map((plan) => plan.metadata),
          legacy_plans: allPlans.filter((plan) => !plan.metadata).map((plan) => plan.relativePath),
          releases: listReleases().map(({ value }) => deriveRelease(value)),
          failures: [...validateAllPlans(), ...validateAllReleases()],
        },
        null,
        2,
      ),
    )
  } else process.stdout.write(summary)
}

function commandReleaseStatus(positionals) {
  const selected = listReleases()
    .map(({ value }) => deriveRelease(value))
    .filter((release) => !positionals[0] || release.id === positionals[0])
  if (positionals[0] && selected.length === 0)
    throw new Error(`release not found: ${positionals[0]}`)
  console.log(JSON.stringify(selected, null, 2))
  if (selected.some((release) => release.status === 'invalid')) process.exitCode = 1
}

async function commandCheck(options) {
  if (!options.plan) throw new Error('check requires --plan IGT-000')
  checkRuntime()
  const plan = findPlan(options.plan)
  const planErrors = validatePlan(plan, { allowLegacy: false })
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

export async function main(argv = process.argv.slice(2)) {
  const command = argv[0]
  const hasSubcommand = ['plan', 'run', 'release'].includes(command)
  const subcommand = hasSubcommand ? argv[1] : null
  const { options, positionals } = parseArgs(argv.slice(hasSubcommand ? 2 : 1))

  if (command === 'validate') return commandValidate(options)
  if (command === 'adopt-history') {
    console.log(JSON.stringify(adoptHistory({ apply: options.apply === true }), null, 2))
    return
  }
  if (command === 'status') return commandStatus(options)
  if (command === 'check') return commandCheck(options)
  if (command === 'plan' && subcommand === 'validate') return commandPlanValidate(positionals)
  if (command === 'plan' && subcommand === 'set-status')
    return commandPlanSetStatus(positionals, options)
  if (command === 'run' && subcommand === 'status') return commandRunStatus(positionals, options)
  if (command === 'release' && subcommand === 'status') return commandReleaseStatus(positionals)
  throw new Error(
    'commands: validate [--ci], status [--write|--json], plan validate [id], ' +
      'plan set-status <id> <status>, check --plan <id> [--level auto|dev|integration|release], ' +
      'run status [run-id] [--verbose], release status [release-id], adopt-history [--apply]',
  )
}

export function runMain() {
  main().catch((error) => fail(error.stack || error.message))
}
