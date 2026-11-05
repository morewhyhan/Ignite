const STATUSES = new Set(['met', 'partial', 'missing', 'unknown', 'conflict', 'deferred', 'excluded'])
const SOURCE = /^(?:REQ|AC)-[A-Z0-9-]+$|^(?:STD|DES)-[A-Z]+-\d{3}$|^ADR-\d{4}$|^RELEASE-[A-Z0-9-]+$/

export function validateBindings(metadata) {
  if (metadata?.binding_contract !== 1) return []
  const failures = []
  const bindings = metadata.bindings
  if (!Array.isArray(bindings) || bindings.length === 0) return ['bindings must list at least one source']

  const taskIds = new Set((metadata.tasks || []).map((task) => task.id))
  const ids = new Set()
  const sources = new Set()
  for (const binding of bindings) {
    if (!/^BIND-\d{3}$/.test(binding.id || '')) failures.push(`invalid binding id: ${binding.id}`)
    if (ids.has(binding.id)) failures.push(`duplicate binding id: ${binding.id}`)
    ids.add(binding.id)
    if (!SOURCE.test(binding.source || '')) failures.push(`${binding.id}: invalid source id ${binding.source}`)
    if (sources.has(binding.source)) failures.push(`${binding.id}: duplicate source ${binding.source}`)
    sources.add(binding.source)
    if (typeof binding.applicable !== 'string' || !binding.applicable.trim())
      failures.push(`${binding.id}: applicable reason is required`)
    if (!STATUSES.has(binding.status)) failures.push(`${binding.id}: invalid status ${binding.status}`)
    if (!taskIds.has(binding.task)) failures.push(`${binding.id}: unknown task ${binding.task}`)
    if (typeof binding.check !== 'string' || !binding.check.trim())
      failures.push(`${binding.id}: check is required`)
  }
  for (const requirement of metadata.requirements || [])
    if (!sources.has(requirement)) failures.push(`${requirement}: no binding`)
  for (const criterion of metadata.acceptance || [])
    if (!sources.has(criterion.id)) failures.push(`${criterion.id}: no binding`)
  return failures
}
