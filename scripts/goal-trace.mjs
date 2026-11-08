import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const walk = (dir) => {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(ts|tsx)$/.test(name)) out.push(full)
  }
  return out
}

const features = readdirSync(join(root, 'docs', 'features')).filter(
  (name) => name.endsWith('.md') && !/README|_template/.test(name),
)
const acToReqs = new Map()
for (const name of features) {
  for (const line of read(join('docs', 'features', name)).split(/\r?\n/)) {
    const match = /^- (AC-[A-Z]+-\d+)（([^）]*)）/.exec(line)
    if (!match) continue
    const reqs = [...match[2].matchAll(/REQ-[A-Z]+-\d+/g)].map((item) => item[0])
    acToReqs.set(match[1], reqs)
  }
}

const goal = read('docs/GOAL.md')
const goalAcs = new Set([...goal.matchAll(/^\s*- (AC-[A-Z]+-\d+)/gm)].map((match) => match[1]))
const goalReqToDomain = new Map()
const domains = []
let currentDomain = null
for (const line of goal.split(/\r?\n/)) {
  const indent = line.length - line.trimStart().length
  const text = line.trim()
  const domainMatch = /^- \*\*(.+?)\*\*/.exec(text)
  if (domainMatch && indent === 2 && domainMatch[1].includes('领域')) {
    currentDomain = domainMatch[1]
    domains.push(currentDomain)
    continue
  }
  const reqMatch = /^- \*\*(REQ-[A-Z]+-\d+)/.exec(text)
  if (reqMatch && currentDomain) {
    goalReqToDomain.set(reqMatch[1], currentDomain)
    continue
  }
  const acMatch = /^- (AC-[A-Z]+-\d+)（([^）]*)）/.exec(text)
  if (acMatch && currentDomain) {
    for (const r of acMatch[2].matchAll(/REQ-[A-Z]+-\d+/g)) {
      if (!goalReqToDomain.has(r[0])) goalReqToDomain.set(r[0], currentDomain)
    }
  }
}
const prefixToDomain = new Map()
for (const [req, name] of goalReqToDomain) prefixToDomain.set(req.split('-')[1], name)

const problems = []
const used = new Set()
for (const file of walk(join(root, 'tests'))) {
  const body = readFileSync(file, 'utf8')
  for (const match of body.matchAll(/\b(?:it|test)\(\s*['"`]([^'"`]{0,200})/g)) {
    for (const id of match[1].matchAll(/\[(AC-[A-Z]+-\d+)\]/g)) used.add(id[1])
  }
}
let goalCovered = 0
const knownPrefixes = new Set([...acToReqs.keys()].map((id) => id.split('-')[1]))
for (const id of used) {
  if (!acToReqs.has(id)) {
    if (!knownPrefixes.has(id.split('-')[1])) continue
    problems.push(id + ': 测试引用的 AC 不在任何 Feature 里')
    continue
  }
  const reqs = acToReqs.get(id)
  if (reqs.length === 0) {
    problems.push(id + ': AC 没有对应的 REQ')
    continue
  }
  if (!goalAcs.has(id)) continue
  goalCovered += 1
  for (const req of reqs) {
    if (!goalReqToDomain.has(req) && !prefixToDomain.has(req.split('-')[1]))
      problems.push(req + ': REQ 没有登记在 GOAL 的任何领域下（' + id + '）')
  }
}
for (const id of goalAcs) {
  if (!used.has(id)) problems.push(id + ': GOAL 里的 AC 没有任何测试引用')
}

if (problems.length > 0) {
  console.error('验收追溯不通过：')
  for (const problem of [...new Set(problems)]) console.error('- ' + problem)
  process.exitCode = 1
} else {
  console.log(
    '验收追溯通过：' +
      used.size +
      ' 个 AC 被测试引用，其中 ' +
      goalCovered +
      ' 个追溯到 GOAL，' +
      domains.length +
      ' 个领域',
  )
}
