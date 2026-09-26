import { writeFileSync } from 'node:fs'
import { acceptanceFailures } from './acceptance-results.mjs'

export default class AcceptanceReporter {
  onBegin(_config, suite) {
    this.suite = suite
  }

  async onEnd() {
    const cases = (this.suite?.allTests() || []).map((test) => ({
      file: test.location.file,
      title: test.title,
      passed:
        test.expectedStatus === 'passed' &&
        test.outcome() === 'expected' &&
        test.results.length > 0 &&
        test.results.every((result) => result.status === 'passed'),
      status:
        test.expectedStatus === 'passed' && test.outcome() === 'expected' ? 'passed' : 'failed',
      failures: test.results.flatMap((result) =>
        [result.error?.message, ...(result.errors || []).map((error) => error.message)].filter(
          Boolean,
        ),
      ),
    }))
    const reportPath = process.env.IGNITE_TDD_REPORT_PATH
    if (reportPath) writeFileSync(reportPath, JSON.stringify({ tests: cases }, null, 2))

    const failures = acceptanceFailures(cases, 'playwright')
    if (failures.length) {
      console.error(`Ignite acceptance failed:\n- ${failures.join('\n- ')}`)
      return { status: 'failed' }
    }
  }
}
