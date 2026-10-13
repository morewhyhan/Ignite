import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { commandsForLevel } from '../../scripts/ignite/checks.mjs'
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

const waitFor = async (predicate: () => boolean, timeoutMs = 5_000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (predicate()) return true
    await new Promise((resolve) => setTimeout(resolve, 25))
  }
  return predicate()
}

function processIsRunning(pid: number) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8')
    return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[0] !== 'Z'
  } catch {
    return false
  }
}

describe('execution behavior proof', () => {
  it('[AC-EXECUTION-042] cleans up detached descendants after the primary command exits', async () => {
    expect(process.platform, 'The declared WSL runtime is Linux').toBe('linux')
    const pidFile = join(tmpdir(), `ignite-descendant-${process.pid}-${Date.now()}.pid`)
    const worker = spawn(
      process.execPath,
      [
        join(repositoryRoot, 'scripts/ignite/check-worker.mjs'),
        process.execPath,
        '-e',
        `const {spawn}=require('node:child_process'); const {writeFileSync}=require('node:fs'); const child=spawn(process.execPath,['-e',"process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"],{detached:true,stdio:'ignore'}); child.unref(); writeFileSync(${JSON.stringify(pidFile)},String(child.pid));`,
      ],
      { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] },
    )
    const closedPromise = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5_000)
      worker.once('close', () => {
        clearTimeout(timeout)
        resolve(true)
      })
    })
    let descendant: number | null = null
    let stderr = ''
    worker.stderr?.setEncoding('utf8')
    worker.stderr?.on('data', (text) => (stderr += text))
    try {
      const started = await waitFor(() => existsSync(pidFile))
      expect(started, 'Detached descendant fixture setup must succeed').toBe(true)
      if (started) descendant = Number(readFileSync(pidFile, 'utf8'))
      const closed = await closedPromise
      const cleaned = descendant !== null && (await waitFor(() => !processIsRunning(descendant!)))
      expect({ closed, cleaned, stderr }, '[AC-EXECUTION-042] target').toMatchObject({
        closed: true,
        cleaned: true,
      })
    } finally {
      if (descendant !== null && processIsRunning(descendant)) {
        try {
          process.kill(descendant, 'SIGKILL')
        } catch {}
      }
      if (existsSync(pidFile)) unlinkSync(pidFile)
      if (worker.exitCode === null) worker.kill('SIGKILL')
    }
  }, 15_000)

  it('[AC-EXECUTION-043] gives development-mode Next its own build directory', () => {
    const configPath = join(repositoryRoot, 'next.config.mjs')
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `console.log((await import(${JSON.stringify(configPath)})).default.distDir)`,
      ],
      {
        cwd: repositoryRoot,
        encoding: 'utf8',
        env: { ...process.env, E2E_SERVER_MODE: 'development' },
      },
    )
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout.trim(), '[AC-EXECUTION-043] target').toBe('.next/e2e')
  })

  it('[AC-EXECUTION-044] prepares historical code in an isolated recovery worktree', () => {
    const fixture = makeFixture()
    let recoveryPath: string | null = null
    try {
      const test = 'tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence'
      write(fixture.root, 'src/example.txt', 'before implementation\n')
      const before = commitAll(fixture.root, 'pre-implementation behavior')
      write(fixture.root, 'src/example.txt', 'implemented behavior\n')
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          status: 'active',
          verification_contract: 2,
          write_scope: ['src/', 'docs/', 'tests/'],
          acceptance: [
            {
              id: 'AC-TEST-001',
              tests: [test],
              required_layers: ['unit'],
              checks: [{ test, layer: 'unit' }],
            },
          ],
          tasks: [
            {
              id: 'implement',
              phase: 'implement',
              acceptance: ['AC-TEST-001'],
              scope: ['src/'],
            },
          ],
          tdd_evidence: [],
        }),
      )
      commitAll(fixture.root, 'current implementation')
      const prepared = runCli(
        fixture.root,
        'tdd',
        'recover',
        '--plan',
        'IGT-900',
        '--ac',
        'AC-TEST-001',
        '--from',
        before,
        '--restore',
        'src/example.txt',
      )
      const result = prepared.status === 0 ? JSON.parse(prepared.stdout) : null
      recoveryPath = result?.workspace || null
      expect(
        result &&
          result.evidence_created === false &&
          read(fixture.root, 'src/example.txt') === 'implemented behavior\n' &&
          read(result.workspace, 'src/example.txt') === 'before implementation\n' &&
          read(result.workspace, 'tests/contracts/sample.test.ts') ===
            read(fixture.root, 'tests/contracts/sample.test.ts'),
        '[AC-EXECUTION-044] target',
      ).toBe(true)
    } finally {
      if (recoveryPath) git(fixture.root, 'worktree', 'remove', '--force', recoveryPath)
      fixture.cleanup()
    }
  }, 30_000)

  it('[AC-EXECUTION-045] returns a task packet with its executable workspace and dependency', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          tasks: [
            {
              id: 'prepare',
              phase: 'prepare',
              title: 'Confirm scope',
              status: 'todo',
              owner: 'reader',
              scope: ['docs/features/product.md'],
              result: 'Confirmed scope',
              depends_on: [],
            },
            {
              id: 'implement',
              phase: 'implement',
              title: 'Implement behavior',
              status: 'todo',
              owner: 'developer',
              scope: ['README.md'],
              result: 'Record can be saved',
              depends_on: ['prepare'],
              acceptance: ['AC-TEST-001'],
            },
          ],
        }),
      )
      const result = runCli(
        fixture.root,
        'next',
        '--plan',
        'IGT-900',
        '--task',
        'implement',
        '--handoff',
      )
      const packet = result.status === 0 ? JSON.parse(result.stdout) : null
      expect(
        packet?.task?.owner === 'developer' &&
          packet.task.scope.includes('README.md') &&
          packet.workspace.root === fixture.root &&
          packet.blockers.includes('dependency prepare is not done') &&
          packet.spawned === false,
        '[AC-EXECUTION-045] target',
      ).toBe(true)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-046] appends an execution note without changing the review subject', () => {
    const fixture = makeFixture()
    try {
      const before = runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft')
      const noteText = 'The API task is handed back; browser verification remains pending.'
      const result = runCli(fixture.root, 'plan', 'note', 'IGT-900', '--text', noteText)
      const after = runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft')
      const unchanged =
        before.status === 0 &&
        after.status === 0 &&
        JSON.parse(before.stdout).subject_fingerprint ===
          JSON.parse(after.stdout).subject_fingerprint
      expect(
        result.status === 0 &&
          read(fixture.root, 'docs/plans/fixture.md').includes(noteText) &&
          unchanged,
        '[AC-EXECUTION-046] target',
      ).toBe(true)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-047] selects only mapped feedback cases without writing evidence', () => {
    const fixture = makeFixture()
    try {
      const test = 'tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence'
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          acceptance: [
            {
              id: 'AC-TEST-001',
              tests: [test],
              required_layers: ['unit'],
              checks: [{ test, layer: 'unit' }],
            },
            {
              id: 'AC-TEST-002',
              tests: ['tests/contracts/other.test.ts::[AC-TEST-002]'],
              required_layers: ['unit'],
              checks: [{ test: 'tests/contracts/other.test.ts::[AC-TEST-002]', layer: 'unit' }],
            },
          ],
        }),
      )
      const before = read(fixture.root, 'docs/plans/fixture.md')
      const result = runCli(
        fixture.root,
        'check',
        '--plan',
        'IGT-900',
        '--feedback',
        '--ac',
        'AC-TEST-001',
        '--dry-run',
      )
      const feedback = result.status === 0 ? JSON.parse(result.stdout) : null
      const command = feedback?.commands.flat().join(' ') || ''
      expect(
        feedback?.purpose === 'development-feedback' &&
          feedback.acceptance_evidence === false &&
          command.includes('tests/contracts/sample.test.ts') &&
          !command.includes('tests/contracts/other.test.ts') &&
          read(fixture.root, 'docs/plans/fixture.md') === before,
        '[AC-EXECUTION-047] target',
      ).toBe(true)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-048] keeps working and committed delivery reviews equal with CRLF input', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'docs/plans/fixture.md', planContent(fixture.baseCommit))
      const feature = read(fixture.root, 'docs/features/product.md')
      write(
        fixture.root,
        'docs/features/product.md',
        `${feature.replace(/\n/g, '\r\n')}\r\n## Additional CRLF input\r\nCommitted in Git LF form.\r\n`,
      )
      const commit = commitAll(fixture.root, 'commit normalized Feature text')
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `import {findPlan,planReviewContext} from ${JSON.stringify(join(repositoryRoot, 'scripts/ignite/state.mjs'))}; const plan=findPlan('IGT-900'); console.log(JSON.stringify({current:planReviewContext(plan,'delivery'),historical:planReviewContext(plan,'delivery',${JSON.stringify(commit)})}));`,
        ],
        { cwd: fixture.root, encoding: 'utf8', env: { ...process.env, IGNITE_ROOT: fixture.root } },
      )
      expect(result.status, result.stderr).toBe(0)
      const contexts = result.status === 0 ? JSON.parse(result.stdout) : null
      expect(
        contexts?.current.subject_fingerprint === contexts?.historical.subject_fingerprint,
        '[AC-EXECUTION-048] target',
      ).toBe(true)
    } finally {
      fixture.cleanup()
    }
  }, 30_000)

  it('[AC-EXECUTION-049] exposes independent todo work alongside a task already in progress', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          execution_contract: 1,
          verification_requirements: ['unit'],
          dependency_contracts: [],
          shared_files: [],
          handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
          acceptance: [
            {
              id: 'AC-TEST-001',
              tests: ['tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence'],
              required_layers: ['unit'],
              checks: [
                {
                  test: 'tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence',
                  layer: 'unit',
                },
              ],
            },
          ],
          tasks: [
            { id: 'API', title: 'API task', status: 'doing' },
            { id: 'UI', title: 'Independent UI task', status: 'todo' },
          ],
        }),
      )
      const release = JSON.parse(read(fixture.root, 'docs/plans/releases/fixture-v1.json'))
      release.coverage_version = 1
      release.scope = [
        {
          id: 'G1',
          text: 'The execution result is current',
          source: 'fixture request',
          requirements: ['REQ-TEST-001'],
          plan_ids: ['IGT-900'],
          disposition: 'included',
        },
      ]
      write(fixture.root, 'docs/plans/releases/fixture-v1.json', JSON.stringify(release))
      const plan = read(fixture.root, 'docs/plans/fixture.md')
      write(
        fixture.root,
        'docs/plans/fixture.md',
        `${plan}\n<!-- ignite-progress -->\n\n状态：\`active\`（由元数据生成）\n\n- [ ] API · API task · doing\n- [ ] UI · Independent UI task · todo\n\n验收缺口：未记录；完成仍须实际证据\n证据：尚无\n<!-- /ignite-progress -->`,
      )
      const result = runCli(fixture.root, 'next', '--plan', 'IGT-900')
      expect(result.status, result.stderr).toBe(0)
      const action = result.status === 0 ? JSON.parse(result.stdout).next_action : null
      expect(action?.kind, 'fixture must produce a resumable task action').toBe('continue-task')
      expect(action.task_ids, '[AC-EXECUTION-049] target').toEqual(['API', 'UI'])
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-050] reports an unfinished upstream Plan as a handoff blocker', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/upstream.md',
        planContent(fixture.baseCommit, {
          id: 'IGT-901',
          status: 'draft',
          outcome: 'upstream work',
        }),
      )
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          depends_on: ['IGT-901'],
          dependency_contracts: [],
          tasks: [
            {
              id: 'implement',
              phase: 'implement',
              title: 'Implement after upstream',
              status: 'todo',
              scope: ['README.md'],
              owner: 'developer',
              acceptance: ['AC-TEST-001'],
            },
          ],
        }),
      )
      const result = runCli(
        fixture.root,
        'next',
        '--plan',
        'IGT-900',
        '--task',
        'implement',
        '--handoff',
      )
      const packet = result.status === 0 ? JSON.parse(result.stdout) : null
      expect(
        packet?.blockers?.some((blocker: string) =>
          blocker.includes('dependency IGT-901 is not done'),
        ),
        '[AC-EXECUTION-050] target',
      ).toBe(true)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-051] includes the tool-script type check in the policy integration commands', () => {
    const commands = commandsForLevel('integration', [], {
      metadata: { base_commit: '55989ef', acceptance: [] },
    })
    expect(
      commands.some(
        (item) => item.label === 'tools-typecheck' && item.args.includes('tools:check'),
      ),
      '[AC-EXECUTION-051] target',
    ).toBe(true)
  })

  it('[AC-EXECUTION-052] updates a task without scanning an unrelated malformed Release', () => {
    const fixture = makeFixture()
    try {
      const statusPath = 'docs/others/ignite-status.md'
      const sentinel = 'derived status intentionally left for explicit refresh\n'
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          execution_contract: 1,
          tasks: [{ id: 'T1', title: 'Scoped work', status: 'todo' }],
        }),
      )
      write(fixture.root, statusPath, sentinel)
      write(fixture.root, 'docs/plans/releases/unrelated.json', '{"schema":')
      expect(read(fixture.root, 'docs/plans/releases/unrelated.json')).toBe('{"schema":')
      const result = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T1', 'doing')
      const metadata = JSON.parse(
        read(fixture.root, 'docs/plans/fixture.md').match(
          /<!-- ignite-plan\s*([\s\S]*?)\s*-->/,
        )![1],
      )
      expect(
        result.status === 0 &&
          metadata.tasks[0].status === 'doing' &&
          read(fixture.root, statusPath) === sentinel,
        '[AC-EXECUTION-052] target',
      ).toBe(true)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-053] rejects a Feature with missing preparation headings and a broken local link', () => {
    const fixture = makeFixture()
    try {
      const template = readFileSync(join(repositoryRoot, 'docs/plans/_template.md'), 'utf8')
      write(fixture.root, 'docs/plans/_template.md', template)
      write(
        fixture.root,
        'docs/features/product.md',
        `# Product\n\n## 业务规则\n\n- R1（REQ-TEST-001）：The execution result is current.\n\n## 验收标准\n\n- AC-TEST-001（REQ-TEST-001）：Given a Plan When it is validated Then stale evidence is rejected.\n\nSee [missing guide](./missing-guide.md).\n`,
      )
      const body = [...template.matchAll(/^## .+$/gm)]
        .map(([heading]) => `${heading}\n\nFixture preparation.\n`)
        .join('\n')
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, { status: 'draft' }) + body,
      )
      const result = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
      const report = JSON.parse(result.stdout)
      expect(report.failures, '[AC-EXECUTION-053] target').toEqual(
        expect.arrayContaining([
          'docs/features/product.md: missing heading "## 背景与目标"',
          'docs/features/product.md: broken local link ./missing-guide.md',
        ]),
      )
    } finally {
      fixture.cleanup()
    }
  })
})
