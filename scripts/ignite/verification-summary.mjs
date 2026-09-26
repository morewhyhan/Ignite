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
export function summarizeVerification() {
  return {}
}
