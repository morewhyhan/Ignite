import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  hash,
  isExecutionStatePath,
  normalizeGitText,
  planSemanticNarrative,
  stablePlanContract,
} from '../../scripts/ignite/core.mjs'
import {
  acceptanceTestContextFingerprint,
  acceptanceTestSource,
} from '../../scripts/ignite/source-analysis.mjs'
import {
  commitAll,
  git,
  makeFixture,
  planContent,
  read,
  repositoryRoot,
  runCli,
  write,
} from './ignite-fixture'

describe('Plan semantic identity', () => {
  function fixtureInputFingerprint(root: string) {
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import {findPlan} from ${JSON.stringify(join(repositoryRoot, 'scripts/ignite/state.mjs'))}; import {computeInputFingerprint} from ${JSON.stringify(join(repositoryRoot, 'scripts/ignite/core.mjs'))}; console.log(computeInputFingerprint(findPlan('IGT-900')));`,
      ],
      {
        cwd: root,
        env: { ...process.env, IGNITE_ROOT: root },
        encoding: 'utf8',
      },
    )
    if (result.status !== 0) throw new Error(result.stderr || result.stdout)
    return result.stdout.trim()
  }

  it('invalidates integration and review identity when Plan narrative changes, while ignoring execution notes', () => {
    const fixture = makeFixture()
    try {
      const path = 'docs/plans/fixture.md'
      const source = planContent(fixture.baseCommit)
      write(fixture.root, path, source)
      const integrationBefore = fixtureInputFingerprint(fixture.root)
      const reviewBefore = JSON.parse(
        runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft').stdout,
      ).subject_fingerprint

      const semanticChange = source.replace('# Fixture Plan', '# Changed user outcome')
      write(fixture.root, path, semanticChange)
      const integrationAfter = fixtureInputFingerprint(fixture.root)
      const reviewAfter = JSON.parse(
        runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft').stdout,
      ).subject_fingerprint
      expect(integrationAfter).not.toBe(integrationBefore)
      expect(reviewAfter).not.toBe(reviewBefore)

      const noteOnly = `${semanticChange}\n\n## 状态记录\n\nA progress note.\n`
      write(fixture.root, path, noteOnly)
      expect(fixtureInputFingerprint(fixture.root)).toBe(integrationAfter)
      expect(planSemanticNarrative(noteOnly)).toBe(planSemanticNarrative(semanticChange))

      const progressOnly = `${semanticChange.replace('# Changed user outcome', '# Changed user outcome')}\n\n<!-- ignite-progress -->\nGenerated progress.\n<!-- /ignite-progress -->\n`
      expect(planSemanticNarrative(progressOnly)).toBe(planSemanticNarrative(semanticChange))
      write(fixture.root, path, progressOnly)
      expect(fixtureInputFingerprint(fixture.root)).toBe(integrationAfter)
    } finally {
      fixture.cleanup()
    }
  }, 60_000)

  it('normalizes Plan line endings to Git text form', () => {
    expect(planSemanticNarrative('## Goal\r\n\r\nKeep the result current.\r\n')).toBe(
      planSemanticNarrative('## Goal\n\nKeep the result current.\n'),
    )
    expect(normalizeGitText('Feature\r\ntext\r\n')).toBe('Feature\ntext\n')
  })

  it('preserves the legacy pre-narrative input digest for historical policy versions', () => {
    const fixture = makeFixture()
    try {
      const planPath = 'docs/plans/fixture.md'
      write(fixture.root, planPath, planContent(fixture.baseCommit))
      write(fixture.root, 'docs/features/legacy-fingerprint-input.md', '# Legacy input\n')
      const commit = commitAll(fixture.root, 'legacy fingerprint fixture')
      const planText = read(fixture.root, planPath)
      const metadata = JSON.parse(planText.match(/<!-- ignite-plan\s*([\s\S]*?)\s*-->/)![1])
      const tree = spawnSync('git', ['ls-tree', '-rz', '--full-tree', commit], {
        cwd: fixture.root,
        encoding: 'buffer',
      })
      expect(tree.status, tree.stderr?.toString()).toBe(0)
      const entries = tree.stdout
        .toString('utf8')
        .split('\0')
        .filter(Boolean)
        .map((entry) => {
          const separator = entry.indexOf('\t')
          const [mode, type, objectId] = entry.slice(0, separator).split(' ')
          return { mode, type, objectId, path: entry.slice(separator + 1) }
        })
        .filter((entry) => entry.type === 'blob' && !isExecutionStatePath(entry.path))
        .sort((left, right) => left.path.localeCompare(right.path))
      const historicalDigest = hash(
        `${JSON.stringify(stablePlanContract(metadata))}\0${entries.map(({ path, objectId }) => `${path}\0${objectId}\0`).join('')}`,
      )
      const actual = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `import {computeInputFingerprintAtCommit} from ${JSON.stringify(join(repositoryRoot, 'scripts/ignite/core.mjs'))}; const plan=${JSON.stringify({ metadata, relativePath: planPath })}; console.log(computeInputFingerprintAtCommit(plan,${JSON.stringify(commit)},{includeNarrative:false}));`,
        ],
        { cwd: fixture.root, env: { ...process.env, IGNITE_ROOT: fixture.root }, encoding: 'utf8' },
      )
      expect(actual.status, actual.stderr).toBe(0)
      expect(actual.stdout.trim()).toBe(historicalDigest)
    } finally {
      fixture.cleanup()
    }
  }, 60_000)

  it('rejects stripping context from a receipt produced by the context-aware runner', () => {
    const fixture = makeFixture()
    try {
      const testPath = 'tests/contracts/sample.test.ts'
      const test = `it('[AC-TEST-001] validates current evidence', () => { expect(true, '[AC-TEST-001] target').toBe(true) })\n`
      const runId = 'tdd-20261014000000-aabbcc'
      const runnerPath = 'scripts/ignite/tdd.mjs'
      write(fixture.root, testPath, test)
      write(
        fixture.root,
        runnerPath,
        `const receipt = { target_assertion_contract: 'ac-message-marker-v1' }\n`,
      )
      const redCommit = commitAll(fixture.root, 'context-aware runner and red test')
      const testReference = `${testPath}::[AC-TEST-001] validates current evidence`
      const context = acceptanceTestContextFingerprint({
        entryPath: testPath,
        acceptanceId: 'AC-TEST-001',
        expectedTitle: '[AC-TEST-001] validates current evidence',
        readFile: (path) => (path === testPath ? test : null),
      })
      expect(context).not.toBeNull()
      const failures = [
        'AssertionError: [AC-TEST-001] expected result at tests/contracts/sample.test.ts:1:1',
      ]
      const receipt = {
        schema: 2,
        test_scope: 'acceptance-case',
        run_id: runId,
        plan_id: 'IGT-900',
        acceptance_id: 'AC-TEST-001',
        test: testReference,
        red_commit: redCommit,
        status: 'assertion-failed',
        executor: 'ignite-tdd-runner',
        test_sha256: hash(
          acceptanceTestSource(test, 'AC-TEST-001', '[AC-TEST-001] validates current evidence'),
        ),
        output_sha256: 'a'.repeat(64),
        target_assertion_contract: 'ac-message-marker-v1',
        failure_summary: failures,
        failure_summary_sha256: hash(JSON.stringify(failures)),
        failure_sha256: createHash('sha256').update(failures.join('\n')).digest('hex'),
        context_schema: 1,
        context_sha256: context!.context_sha256,
        context_files: context!.context_files,
      }
      const metadata = {
        schema: 2,
        id: 'IGT-900',
        release: 'fixture-v1',
        status: 'active',
        outcome: 'prove the execution contract',
        change_type: '存量改动',
        base_commit: fixture.baseCommit,
        requirements: ['REQ-TEST-001'],
        acceptance: [{ id: 'AC-TEST-001', tests: [testReference] }],
        verification_contract: 2,
        tdd_evidence: [{ acceptance_id: 'AC-TEST-001', test: testReference, run_id: runId }],
        evidence: [],
        integrated_commit: null,
      }
      const recordPath = `docs/others/evidence/tdd/IGT-900/${runId}.json`
      write(fixture.root, recordPath, JSON.stringify(receipt))
      write(fixture.root, 'docs/plans/fixture.md', planContent(fixture.baseCommit, metadata))
      const validate = () => {
        const result = spawnSync(
          process.execPath,
          [
            '--input-type=module',
            '-e',
            `import {findPlan,validatePlan} from ${JSON.stringify(join(repositoryRoot, 'scripts/ignite/state.mjs'))}; console.log(JSON.stringify(validatePlan(findPlan('IGT-900'))));`,
          ],
          {
            cwd: fixture.root,
            env: { ...process.env, IGNITE_ROOT: fixture.root },
            encoding: 'utf8',
          },
        )
        if (result.status !== 0) throw new Error(result.stderr || result.stdout)
        return JSON.parse(result.stdout) as string[]
      }
      expect(
        validate().some((error) => error.startsWith('AC-TEST-001: TDD red proof is invalid')),
      ).toBe(false)

      const downgraded = { ...receipt }
      delete (downgraded as Partial<typeof receipt>).context_schema
      delete (downgraded as Partial<typeof receipt>).context_sha256
      delete (downgraded as Partial<typeof receipt>).context_files
      write(fixture.root, recordPath, JSON.stringify(downgraded))
      expect(
        validate().some((error) => error.startsWith('AC-TEST-001: TDD red proof is invalid')),
      ).toBe(true)
    } finally {
      fixture.cleanup()
    }
  }, 60_000)

  it('keeps current and committed review identities equal when a Feature uses CRLF', () => {
    const fixture = makeFixture()
    try {
      const featurePath = 'docs/features/product.md'
      const feature = read(fixture.root, featurePath)
      write(fixture.root, featurePath, feature.replace(/\n/g, '\r\n'))
      const commit = git(fixture.root, 'rev-parse', 'HEAD')
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `import {findPlan,planReviewContext} from ${JSON.stringify(join(repositoryRoot, 'scripts/ignite/state.mjs'))}; const plan=findPlan('IGT-900'); console.log(JSON.stringify({current:planReviewContext(plan,'draft'),historical:planReviewContext(plan,'draft',${JSON.stringify(commit)})}));`,
        ],
        {
          cwd: fixture.root,
          env: { ...process.env, IGNITE_ROOT: fixture.root },
          encoding: 'utf8',
        },
      )
      expect(result.status, result.stderr).toBe(0)
      const { current, historical } = JSON.parse(result.stdout)
      expect(historical.subject_fingerprint).toBe(current.subject_fingerprint)
    } finally {
      fixture.cleanup()
    }
  }, 60_000)
})
