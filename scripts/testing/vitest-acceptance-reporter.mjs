import { acceptanceFailures } from './acceptance-results.mjs'

export default class AcceptanceReporter {
  onTestRunEnd(modules) {
    const cases = modules.flatMap((module) =>
      [...module.children.allTests()].map((test) => ({
        file: module.moduleId,
        title: test.name,
        passed:
          test.result().state === 'passed' && !test.options.fails && !test.diagnostic()?.retryCount,
      })),
    )
    const failures = acceptanceFailures(cases, 'vitest')
    if (failures.length) {
      console.error(`Ignite acceptance failed:\n- ${failures.join('\n- ')}`)
      process.exitCode = 1
    }
  }
}
