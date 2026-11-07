
import { readFileSync, writeFileSync } from 'node:fs'
const c = JSON.parse(readFileSync('.ignite/c3.json', 'utf8'))
writeFileSync('r.json', JSON.stringify({
  reviewer: 'ignite-reviewer', executor: c.executor, source: 'docs/plans/README.md draft review checklist',
  stage: 'draft', identity_assurance: 'declared', verdict: 'approved',
  subject_fingerprint: c.subject_fingerprint, findings: [],
}, null, 2))
console.log('rec3 ok')
