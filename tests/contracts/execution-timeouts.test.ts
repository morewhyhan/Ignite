import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'
import { repositoryRoot } from './ignite-fixture'

it('[AC-EXECUTION-024] budgets real Prisma migration verification for a slow full suite', () => {
  const path = 'tests/contracts/execution-reliability.test.ts'
  const source = ts.createSourceFile(
    path,
    readFileSync(join(repositoryRoot, path), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  let configuredTimeout = 0
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      ['it', 'test'].includes(node.expression.text) &&
      ts.isStringLiteral(node.arguments[0]) &&
      node.arguments[0].text.includes('preserves related records through real Prisma upgrades')
    ) {
      const timeout = node.arguments.at(-1)
      if (timeout && ts.isNumericLiteral(timeout)) {
        configuredTimeout = Number(timeout.text.replaceAll('_', ''))
      }
    }
    node.forEachChild(visit)
  }
  visit(source)

  expect(configuredTimeout).toBeGreaterThanOrEqual(240_000)
})
