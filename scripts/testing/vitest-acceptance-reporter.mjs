import { acceptanceFailures } from './acceptance-results.mjs'

export default class AcceptanceReporter {
  onInit(context) {
    const bound =
      process.env.IGNITE_PLAN_ID ||
      process.env.IGNITE_ACCEPTANCE_RESULTS ||
      process.env.CI === 'true'
    this.selection = bound ? undefined : context.config.testNamePattern
  }

  onTestRunEnd(modules) {
    const cases = modules.flatMap((module) =>
      [...module.children.allTests()]
        .filter((test) => {
          if (!this.selection) return true
          this.selection.lastIndex = 0
          return this.selection.test(test.fullName)
        })
        .map((test) => ({
          file: module.moduleId,
          title: test.name,
          passed:
            test.result().state === 'passed' &&
            !test.options.fails &&
            !test.diagnostic()?.retryCount,
        })),
    )
    const failures = acceptanceFailures(cases, 'vitest')
    if (failures.length) {
      console.error(`Ignite acceptance failed:\n- ${failures.join('\n- ')}`)
      process.exitCode = 1
    }
  }
}
