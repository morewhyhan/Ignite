// 失败分类入口：把一次失败的运行记录映射到 docs/standards/failure-taxonomy.md 的叶子，
// 并给出第几次、影响面与处置建议。映射是启发式的，允许人工覆盖。
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { repositoryRoot } from './core.mjs'

const LEAF_BY_LABEL = {
  'git-diff': 'C4.2',
  governance: 'A5.2',
  'template-doctor': 'A5.2',
  docs: 'A5.1',
  typecheck: 'A2.1',
  'tools-typecheck': 'A2.1',
  lint: 'A1.3',
  format: 'A5.2',
  behavior: 'A1.1',
}

const LEAF_TEXT = {
  'A1.1': '缺行为：该做的没做或只做了一半',
  'A1.3': '路径错：边界值、异常分支、空值处理',
  'A2.1': '类型或签名不匹配',
  'A5.1': '规格缺项或自相矛盾',
  'A5.2': '元数据不一致：基线、集成提交、指纹、进度块互相牵制',
  'A5.3': '索引与引用失效',
  'B4.1': '检查器判定逻辑错',
  'C1.1': '运行时版本不符',
  'C2.1': '超时：单次预算不够',
  'C2.3': '并发争用',
  'C4.2': '基线或提交错位',
  'C4.3': '证据过期或被新改动作废',
}

export function failedLabels(record) {
  const gates = [
    ...(record?.commands || []),
    ...(record?.verification?.engineering_gates?.commands || []),
  ]
  return gates.filter((item) => item?.status === 'failed').map((item) => String(item.label))
}

export function leafFor(record) {
  const labels = failedLabels(record)
  for (const label of labels) if (LEAF_BY_LABEL[label]) return LEAF_BY_LABEL[label]
  if (record?.verification?.plan_acceptance?.status === 'failed') return 'A1.1'
  const reason = String(record?.failure_reason || '')
  if (reason.includes('check-release') || reason.includes('evidence')) return 'C4.3'
  if (reason.includes('stale') || reason.includes('contract')) return 'A5.2'
  return 'B4.1'
}

function listManifests() {
  const directory = join(repositoryRoot, '.ignite', 'runs')
  if (!existsSync(directory)) return []
  return readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      try {
        return JSON.parse(readFileSync(join(directory, name), 'utf8'))
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

export function describeFailure(planId, record) {
  const leaf = leafFor(record)
  const history = listManifests().filter(
    (item) => item.plan_id === planId && item.status === 'failed' && leafFor(item) === leaf,
  )
  const occurrence = history.length + 1
  return {
    leaf,
    leaf_text: LEAF_TEXT[leaf] || '未登记',
    occurrence,
    escalate: occurrence >= 2,
    rule: 'docs/standards/failure-taxonomy.md',
    action:
      occurrence >= 2
        ? 'STD-FAIL-102 生效：同一叶子第二次出现，停止逐项修，改为修这一类或改结构。'
        : '按该叶子的方法处置；修完只跑一次完整验收，不逐项试探。',
  }
}

export function formatTriage(planId, record) {
  const info = describeFailure(planId, record)
  return [
    '检查未通过，先分类再动手：',
    `  叶子     ${info.leaf} ${info.leaf_text}`,
    `  第几次   ${info.occurrence}`,
    `  判据     ${info.rule}`,
    `  处置     ${info.action}`,
  ].join('\n')
}
