import { readFileSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { delimiter, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { formatJson } from '../../scripts/ignite/core.mjs'
import {
  cliPath,
  commitAll,
  makeFixture,
  planContent,
  read,
  repositoryRoot,
  write,
} from './ignite-fixture'

describe('TDD receipt formatting', () => {
  it('[AC-EXECUTION-058] writes formatted evidence from a native TDD run', () => {
    const fixture = makeFixture()
    try {
      const { prettier: prettierConfig } = JSON.parse(
        readFileSync(join(repositoryRoot, 'package.json'), 'utf8'),
      )
      write(
        fixture.root,
        'package.json',
        `${JSON.stringify({ packageManager: 'pnpm@9.11.0', prettier: prettierConfig }, null, 2)}\n`,
      )
      write(fixture.root, '.gitignore', '.ignite/\nnode_modules/\n')
      write(
        fixture.root,
        'tests/contracts/sample.test.ts',
        `import { expect, it } from 'vitest'

it('[AC-TEST-001] creates a real target failure', () => {
  expect(false, '[AC-TEST-001] target').toBe(true)
})
`,
      )
      const test = 'tests/contracts/sample.test.ts::[AC-TEST-001] creates a real target failure'
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          status: 'active',
          verification_contract: 2,
          acceptance: [
            {
              id: 'AC-TEST-001',
              tests: [test],
              required_layers: ['unit'],
              checks: [{ test, layer: 'unit' }],
            },
          ],
          tdd_evidence: [],
        }),
      )
      commitAll(fixture.root, 'prepare native TDD fixture')

      const invocation = spawnSync(
        process.execPath,
        [cliPath, 'tdd', 'red', '--plan', 'IGT-900', '--ac', 'AC-TEST-001'],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          env: {
            ...process.env,
            PATH: `${join(repositoryRoot, 'node_modules', '.bin')}${delimiter}${process.env.PATH}`,
            APP_ENV: 'test',
            IGNITE_ROOT: fixture.root,
            IGNITE_SKIP_RUNTIME_CHECK: 'true',
          },
          windowsHide: true,
        },
      )
      expect(invocation.status, invocation.stderr).toBe(0)

      const evidenceDirectory = 'docs/others/evidence/tdd/IGT-900'
      const receipts = readdirSync(join(fixture.root, evidenceDirectory)).filter((name) =>
        name.endsWith('.json'),
      )
      expect(receipts).toHaveLength(1)
      const receiptPath = join(evidenceDirectory, receipts[0])
      const receipt = read(fixture.root, receiptPath)
      const parsedReceipt = JSON.parse(receipt)
      const prettier = spawnSync(
        process.execPath,
        [
          join(repositoryRoot, 'node_modules', 'prettier', 'bin', 'prettier.cjs'),
          '--config',
          join(repositoryRoot, 'package.json'),
          '--check',
          join(fixture.root, receiptPath),
        ],
        { cwd: repositoryRoot, encoding: 'utf8', windowsHide: true },
      )
      expect(parsedReceipt.status).toBe('assertion-failed')
      expect(parsedReceipt.output_sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(parsedReceipt.failure_sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(receipt, '[AC-EXECUTION-058] target').toBe(formatJson(parsedReceipt))
      expect(prettier.status, `${prettier.stdout}${prettier.stderr}`).toBe(0)
    } finally {
      fixture.cleanup()
    }
  })
})
