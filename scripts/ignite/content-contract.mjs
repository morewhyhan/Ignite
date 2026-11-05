/** @type {Array<[string, number]>} */
const REQUIRED = [
  ['## 来源规格', 3],
  ['## 目标映射', 2],
  ['## 主要矛盾', 3],
  ['## 次要矛盾', 1],
  ['## 决策原则', 2],
  ['## 方案比较', 2],
  ['## 约束绑定矩阵', 2],
  ['## 回退', 2],
]
const BOILERPLATE = /^(?:按 .*说明以下判断.*|简单任务可以用几句话回答.*|待填写)$/m
const SEPARATOR = /^\|[\s:|-]+\|$/

function section(content, heading) {
  const start = content.indexOf(heading + '\n')
  if (start < 0) return null
  const rest = content.slice(start + heading.length)
  const end = rest.search(/\n## /)
  return end < 0 ? rest : rest.slice(0, end)
}

function substantive(body) {
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const kept = []
  for (const line of lines) {
    if (SEPARATOR.test(line)) {
      if (kept.length && kept[kept.length - 1].startsWith('|')) kept.pop()
      continue
    }
    kept.push(line)
  }
  return kept
}

export function contentGaps(content) {
  const gaps = []
  for (const [heading, minimum] of REQUIRED) {
    const body = section(content, heading)
    if (body === null) {
      gaps.push(`${heading}: missing section`)
      continue
    }
    const lines = substantive(body)
    if (lines.length < minimum) gaps.push(`${heading}: only ${lines.length} substantive lines`)
    if (BOILERPLATE.test(body)) gaps.push(`${heading}: template boilerplate`)
  }
  return gaps
}
