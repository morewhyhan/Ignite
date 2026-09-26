const ACCEPTANCE_COMMANDS = new Set([
  'targeted-tests',
  'targeted-browser-tests',
  'tests',
  'e2e-production',
])

function statusOf(commands) {
  if (!commands.length) return 'not-run'
  if (commands.some((command) => command.status !== 'passed' || command.exit_code !== 0))
    return 'failed'
  return 'passed'
}

function acceptanceSummary(record, plan) {
  const observed = record.acceptance_results || []
  return (plan.metadata.acceptance || []).map((criterion) => {
    const checks = criterion.checks || []
    const missing = checks.filter(
      (check) =>
        !observed.some(
          (result) =>
            result.plan_id === plan.metadata.id &&
            result.criterion === criterion.id &&
            result.test === check.test &&
            result.layer === check.layer &&
            result.passed === true &&
            result.cases > 0,
        ),
    )
    return {
      acceptance_id: criterion.id,
      status: checks.length === 0 ? 'unmapped' : missing.length ? 'incomplete' : 'passed',
      required_layers: criterion.required_layers || [],
      missing_checks: missing.map((check) => ({ test: check.test, layer: check.layer })),
    }
  })
}

/** Present the three separate meanings of green without equating any one with delivery. */
export function summarizeVerification(record, plan, { planEvidencePassed = false } = {}) {
  const commands = record.commands || []
  const isReleaseRun = record.release_id && record.evidence_id === 'check-release'
  const engineering = commands.filter((command) => !ACCEPTANCE_COMMANDS.has(command.label))
  const planCommands = commands.filter((command) => ACCEPTANCE_COMMANDS.has(command.label))
  const planChecks = isReleaseRun ? [] : acceptanceSummary(record, plan)
  const planStatus = isReleaseRun
    ? planEvidencePassed
      ? 'passed-before-release'
      : 'not-confirmed'
    : planChecks.length && planChecks.every((item) => item.status === 'passed')
      ? statusOf(planCommands)
      : planCommands.some((command) => command.status !== 'passed')
        ? 'failed'
        : 'incomplete'
  const releaseCommands = isReleaseRun
    ? commands.filter((command) => ['build', 'e2e-production'].includes(command.label))
    : []

  return {
    engineering_gates: {
      status: statusOf(engineering),
      commands: engineering.map((command) => ({
        label: command.label,
        status: command.status,
        exit_code: command.exit_code,
      })),
    },
    plan_acceptance: {
      status: planStatus,
      criteria: planChecks,
      note: isReleaseRun
        ? 'Plan-level evidence was checked before the combined Release run.'
        : 'A passing Plan check is not the same as Plan status done or Release acceptance.',
    },
    release_acceptance: {
      status: isReleaseRun ? statusOf(releaseCommands) : 'not-run',
      release_id: record.release_id || null,
      integrated_commit: isReleaseRun && record.status === 'passed' ? record.commit : null,
      package_version: isReleaseRun ? record.release_identity?.package_version || null : null,
      tags: isReleaseRun ? record.release_identity?.tags || [] : [],
    },
    run_status: record.status,
    next_action:
      record.status !== 'passed'
        ? 'Read this run’s failed command and repair the same Plan or Release scope.'
        : isReleaseRun
          ? 'Read `pnpm ignite status --json`; it is the source for the derived Release status.'
          : `Continue with pnpm ignite next --plan ${plan.metadata.id}; a green check alone does not complete the Plan.`,
  }
}
