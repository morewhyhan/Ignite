import { join, resolve, win32 } from 'node:path'
import { readFileSync } from 'node:fs'

export function taskHandoff(plan, taskId, root, validationFailures = [], { features = [] } = {}) {
  const task = (plan.metadata.tasks || []).find((candidate) => candidate.id === taskId)
  if (!task) throw new Error(`unknown task ${taskId} in ${plan.metadata.id}`)
  const runtime = JSON.parse(readFileSync(join(root, '.ai/runtime.json'), 'utf8'))
  const tasks = new Map((plan.metadata.tasks || []).map((candidate) => [candidate.id, candidate]))
  const blockers = (task.depends_on || [])
    .filter((id) => tasks.get(id)?.status !== 'done')
    .map((id) => `dependency ${id} is not done`)
  if (task.phase === 'implement' && plan.metadata.status !== 'active')
    blockers.push('implementation requires an active Plan and valid red evidence')
  blockers.push(...validationFailures)
  const absoluteRoot = resolve(root)
  const drive = win32.parse(absoluteRoot).root
  const linuxRoot = /^[A-Za-z]:\\$/.test(drive)
    ? `/mnt/${drive[0].toLowerCase()}/${absoluteRoot.slice(drive.length).replaceAll('\\', '/')}`
    : process.platform === 'linux'
      ? absoluteRoot
      : null
  const mounted = /^\/mnt\/([a-z])\/(.*)$/.exec(absoluteRoot)
  const windowsRoot = /^[A-Za-z]:\\$/.test(drive)
    ? absoluteRoot
    : mounted
      ? `${mounted[1].toUpperCase()}:\\${mounted[2].replaceAll('/', '\\')}`
      : null
  return {
    purpose: 'agent-task-handoff',
    plan_id: plan.metadata.id,
    plan_path: plan.relativePath,
    original_goal: plan.metadata.outcome,
    constraints: plan.metadata.constraints || [],
    authorization: plan.metadata.authorization,
    workspace: { root: absoluteRoot, linux_root: linuxRoot, windows_root: windowsRoot },
    runtime,
    context: {
      base_commit: plan.metadata.base_commit,
      features,
      requirements: plan.metadata.requirements || [],
      designs: 'docs/designs/',
      depends_on: plan.metadata.depends_on || [],
      dependency_contracts: plan.metadata.dependency_contracts || [],
    },
    task: { ...task },
    blockers: [...new Set(blockers)],
    interfaces: (plan.metadata.handoff?.interfaces || []).filter(
      (entry) => entry.consumer === task.owner || entry.owner === task.owner,
    ),
    shared_files: plan.metadata.shared_files || [],
    acceptance: (plan.metadata.acceptance || []).filter((entry) =>
      (task.acceptance || []).includes(entry.id),
    ),
    commands: {
      status: ['pnpm', 'ignite', 'next', '--plan', plan.metadata.id],
      feedback: ['pnpm', 'ignite', 'check', '--plan', plan.metadata.id, '--feedback'],
    },
    coordinator_only: ['plan-state', 'shared-files', 'integration', 'release'],
    rules: [
      'AGENTS.md',
      'docs/plans/README.md',
      'docs/standards/testing.md',
      'docs/others/evidence/README.md',
      ...(task.phase === 'prepare' ? ['docs/features/README.md'] : []),
      ...(task.phase === 'implement' || task.phase === 'verify' ? ['docs/designs/README.md'] : []),
      ...(task.phase === 'red' || task.phase === 'verify'
        ? ['docs/others/test-cases/README.md']
        : []),
    ],
    method_commands: [
      ['pnpm', 'ignite', 'skill', 'read', '--for', 'docs/plans/README.md', '--list'],
      ...(['prepare', 'implement', 'red', 'verify'].includes(task.phase)
        ? (task.phase === 'prepare'
            ? ['docs/features/README.md']
            : task.phase === 'implement'
              ? ['docs/designs/README.md']
              : ['docs/others/test-cases/README.md', 'docs/others/evidence/README.md']
          ).map((path) => ['pnpm', 'ignite', 'skill', 'read', '--for', path, '--list'])
        : []),
    ],
    required_report: [
      'status',
      'files',
      'tested_commit',
      'actual_runs',
      'remaining_work',
      'handoff',
    ],
    execution_rules: [
      'Run commands in this exact workspace using the declared runtime; Windows cwd belongs to the host tool, Linux cwd belongs inside WSL.',
      'Preserve the whole command result including exit code and session ID. Running or silent is not completion; resume that session before dependent work.',
      'Write only this task scope; the coordinator owns Plan state and shared-file integration.',
      'Report actual files, observations, remaining work and run IDs. Do not claim tests ran when prohibited or reuse another workspace results.',
      'Blockers describe missing prerequisites; this packet never authorizes bypassing them or expands the user authorization.',
    ],
    spawned: false,
  }
}
