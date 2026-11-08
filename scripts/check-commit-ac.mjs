import { spawnSync } from 'node:child_process'

const git = (args) => spawnSync('git', args, { encoding: 'utf8' })
const base = process.env.DIFF_BASE || 'HEAD~1'
const log = git(['log', '--format=%H', base + '..HEAD'])
if (log.status !== 0) {
  console.error('check-commit-ac: cannot read history from ' + base)
  process.exit(1)
}
const commits = log.stdout.trim().split(/\r?\n/).filter(Boolean)
const problems = []
for (const sha of commits) {
  const files = git(['show', '--name-only', '--format=', sha]).stdout.split(/\r?\n/).filter(Boolean)
  const touchesSource = files.some((file) => /^src\//.test(file))
  if (!touchesSource) continue
  const message = git(['log', '-1', '--format=%B', sha]).stdout
  if (!/^AC: AC-[A-Z]+-\d+$/m.test(message)) problems.push(sha.slice(0, 8) + ' 改了 src/ 但没有 AC: 行')
}
if (problems.length > 0) {
  console.error('提交缺少需求编号：')
  for (const problem of problems) console.error('- ' + problem)
  console.error('在提交信息最后加一行：AC: AC-XXX-001')
  process.exitCode = 1
} else {
  console.log('提交与 AC 编号一致（检查 ' + commits.length + ' 个提交）')
}