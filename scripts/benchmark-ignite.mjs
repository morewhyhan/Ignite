import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repositoryRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const outputDirectory = join(repositoryRoot, 'docs', 'others', 'evidence', 'benchmarks')
const date = new Date().toISOString().slice(0, 10)

function measure(label, command, args) {
  const started = performance.now()
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
    env: { ...process.env, APP_ENV: 'test' },
  })
  const durationMs = Math.round(performance.now() - started)
  return {
    label,
    command: [command, ...args],
    duration_ms: durationMs,
    status: result.status === 0 ? 'passed' : 'failed',
    exit_code: result.status ?? 1,
    output_tail: `${result.stdout || ''}\n${result.stderr || ''}`.trim().slice(-2000),
  }
}

const samples = [
  {
    id: 'docs',
    description: '普通说明文件的反馈',
    baseline: measure('baseline-full-check', 'pnpm', ['check']),
    optimized: measure('optimized-doc-check', 'node', [
      'scripts/ignite.mjs',
      'check',
      '--plan',
      'IGT-001',
      '--level',
      'dev',
      '--files',
      'README.md',
    ]),
  },
  {
    id: 'business',
    description: 'Tasks 权限与持久化 API 代表切片',
    baseline: measure('baseline-full-check', 'pnpm', ['check']),
    optimized: measure('optimized-api-slice', 'pnpm', [
      'exec',
      'vitest',
      'run',
      'tests/api/tasks.test.ts',
      '--hookTimeout=30000',
    ]),
  },
  {
    id: 'integration',
    description: '模板执行机制的契约检查',
    baseline: measure('baseline-full-check', 'pnpm', ['check']),
    optimized: measure('optimized-cli-contract', 'pnpm', [
      'exec',
      'vitest',
      'run',
      'tests/contracts/ignite-cli.test.ts',
    ]),
  },
]

mkdirSync(outputDirectory, { recursive: true })
const outputPath = join(outputDirectory, `${date}-ignite-execution.json`)
writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      schema: 1,
      measured_at: new Date().toISOString(),
      machine_note:
        '同一工作树、同一 Node/pnpm 入口；baseline 是升级前常用全量入口的代理，非历史工时回放。',
      target: '中位耗时降低 30% 是待验证目标，不由本记录直接宣称达成。',
      samples,
    },
    null,
    2,
  )}\n`,
  'utf8',
)
const prettierBinary = join(
  repositoryRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prettier.cmd' : 'prettier',
)
if (existsSync(prettierBinary)) {
  spawnSync(prettierBinary, ['--write', outputPath], { cwd: repositoryRoot, windowsHide: true })
}

console.log(`Wrote ${outputPath}`)
for (const sample of samples) {
  console.log(
    `${sample.id}: baseline ${sample.baseline.status}/${sample.baseline.duration_ms}ms; optimized ${sample.optimized.status}/${sample.optimized.duration_ms}ms`,
  )
}

if (samples.some((sample) => sample.optimized.status !== 'passed')) process.exitCode = 1
