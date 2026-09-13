import ts from 'typescript'

const testModules = new Set(['vitest', '@playwright/test', 'node:test'])
const inactiveModifiers = new Set(['skip', 'todo', 'only', 'fails'])
const activeModifiers = new Set(['concurrent', 'sequential', 'serial', 'parallel'])

function unwrap(expression) {
  while (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    expression = expression.expression
  }
  return expression
}

function invocation(expression, bindings) {
  expression = unwrap(expression)
  if (ts.isIdentifier(expression)) {
    const name = bindings.get(expression.text)
    return name ? { kind: name === 'describe' ? 'suite' : 'test', modifiers: [] } : null
  }
  if (ts.isPropertyAccessExpression(expression)) {
    const call = invocation(expression.expression, bindings)
    if (!call) return null
    if (expression.name.text === 'describe' && call.kind === 'test') call.kind = 'suite'
    else call.modifiers.push({ name: expression.name.text, arguments: null })
    return call
  }
  if (ts.isCallExpression(expression)) {
    const call = invocation(expression.expression, bindings)
    const modifier = call?.modifiers.at(-1)
    if (!modifier || modifier.arguments !== null) return null
    modifier.arguments = expression.arguments
    return call
  }
  if (ts.isTaggedTemplateExpression(expression)) {
    const call = invocation(expression.tag, bindings)
    const modifier = call?.modifiers.at(-1)
    if (modifier?.name !== 'each') return null
    modifier.arguments = [expression.template]
    return call
  }
  return null
}

function isActive(call) {
  return call.modifiers.every(({ name, arguments: args }) => {
    if (inactiveModifiers.has(name)) return false
    if (activeModifiers.has(name)) return args === null
    if (name === 'skipIf' || name === 'runIf') {
      const value = args?.[0] && unwrap(args[0])
      return (
        value?.kind === (name === 'skipIf' ? ts.SyntaxKind.FalseKeyword : ts.SyntaxKind.TrueKeyword)
      )
    }
    if (name === 'each') {
      const data = args?.[0] && unwrap(args[0])
      // Empty static tables register no cases. Dynamic tables still need runtime evidence.
      return Boolean(data) && (!ts.isArrayLiteralExpression(data) || data.elements.length > 0)
    }
    return false
  })
}

/** Find AC tags in statically registered, enabled tests, never in comments or test data. */
export function acceptanceTestTitles(content) {
  const file = ts.createSourceFile(
    'acceptance.tsx',
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const bindings = new Map([
    ['it', 'it'],
    ['test', 'test'],
    ['describe', 'describe'],
  ])
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue
    const named = statement.importClause?.namedBindings
    if (!named || !ts.isNamedImports(named)) continue
    for (const element of named.elements) {
      const imported = element.propertyName?.text || element.name.text
      if (
        testModules.has(statement.moduleSpecifier.text) &&
        ['it', 'test', 'describe'].includes(imported)
      ) {
        bindings.set(element.name.text, imported)
      } else {
        bindings.delete(element.name.text)
      }
    }
  }

  const ids = new Set()
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const call = invocation(node.expression, bindings)
      if (call) {
        const title = node.arguments[0]
        const callback = node.arguments.at(-1)
        if (!isActive(call) || !title || !callback || callback === title) return
        if (call.kind === 'suite') {
          if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
            visit(callback.body)
          return
        }
        if (
          (ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title)) &&
          (ts.isArrowFunction(callback) ||
            ts.isFunctionExpression(callback) ||
            (ts.isIdentifier(callback) && callback.text !== 'undefined'))
        ) {
          for (const match of title.text.matchAll(/\[(AC-[A-Z0-9-]+)\]/g)) ids.add(match[1])
        }
        // A test's callback does not register additional top-level tests.
        return
      }
    }
    // Uncalled helpers and callback data cannot establish test coverage by themselves.
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))
      return
    ts.forEachChild(node, visit)
  }
  visit(file)
  return ids
}
