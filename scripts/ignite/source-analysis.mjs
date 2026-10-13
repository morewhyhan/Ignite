import ts from 'typescript'
import { createHash } from 'node:crypto'
import { dirname, join, normalize } from 'node:path'

/** @param {(path: string) => string | null} readFile @returns {string[]} */
export function configuredBrowserSetupPaths(readFile) {
  const config = readFile('playwright.config.ts')
  if (typeof config !== 'string') return []
  return [...config.matchAll(/(?:globalSetup|globalTeardown)\s*:\s*(['"])([^'"]+)\1/g)].map(
    (match) => match[2].replaceAll('\\', '/').replace(/^\.\//, ''),
  )
}

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

function hasTestBody(callback) {
  if (ts.isIdentifier(callback)) return callback.text !== 'undefined'
  if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback)) return false
  return (
    !ts.isBlock(callback.body) ||
    callback.body.statements.some((statement) => !ts.isEmptyStatement(statement))
  )
}

function parseTestSource(content) {
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
  const expectBindings = new Set(['expect'])
  const hookBindings = new Set(['beforeEach', 'beforeAll', 'afterEach', 'afterAll'])
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
      if (testModules.has(statement.moduleSpecifier.text) && imported === 'expect')
        expectBindings.add(element.name.text)
      if (
        testModules.has(statement.moduleSpecifier.text) &&
        ['beforeEach', 'beforeAll', 'afterEach', 'afterAll'].includes(imported)
      )
        hookBindings.add(element.name.text)
    }
  }
  return { file, bindings, expectBindings, hookBindings }
}

/** Find AC tags in statically registered, enabled tests, never in comments or test data. */
export function acceptanceTestTitles(content) {
  const { file, bindings } = parseTestSource(content)

  const ids = new Set()
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const call = invocation(node.expression, bindings)
      if (call) {
        const title = node.arguments[0]
        // Vitest also accepts a timeout/options argument after the callback.
        const callback = node.arguments[1]
        if (!isActive(call) || !title || !callback || callback === title) return
        if (call.kind === 'suite') {
          if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
            visit(callback.body)
          return
        }
        if (
          (ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title)) &&
          hasTestBody(callback)
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

/**
 * @param {string} content
 * @param {string} acceptanceId
 * @param {string | null} [expectedTitle]
 * @returns {string | null}
 */
export function acceptanceTestSource(content, acceptanceId, expectedTitle = null) {
  const { file, bindings } = parseTestSource(content)
  let selected = null

  function visit(node) {
    if (selected) return
    if (ts.isCallExpression(node)) {
      const call = invocation(node.expression, bindings)
      if (call) {
        const title = node.arguments[0]
        const callback = node.arguments[1]
        if (!isActive(call) || !title || !callback || callback === title) return
        if (call.kind === 'suite') {
          if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
            visit(callback.body)
          return
        }
        if (
          (ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title)) &&
          title.text.includes(`[${acceptanceId}]`) &&
          (expectedTitle === null ||
            expectedTitle === `[${acceptanceId}]` ||
            title.text === expectedTitle) &&
          hasTestBody(callback)
        ) {
          selected = node.getText(file)
        }
        return
      }
    }
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))
      return
    ts.forEachChild(node, visit)
  }

  visit(file)
  return selected
}

/** Detect scaffold failures only inside the active test registered for this AC. */
export function acceptanceTestHasScaffoldFailure(content, acceptanceId) {
  const { file, bindings, expectBindings } = parseTestSource(content)
  let found = false

  function inspectTestBody(body) {
    function inspect(node) {
      if (found) return
      if (ts.isBlock(node)) {
        node.statements.forEach(inspect)
        return
      }
      if (ts.isExpressionStatement(node)) {
        inspect(node.expression)
        return
      }
      const expression = unwrap(node)
      if (ts.isThrowStatement(node) && ts.isNewExpression(node.expression)) {
        const errorConstructor = unwrap(node.expression.expression)
        if (ts.isIdentifier(errorConstructor) && errorConstructor.text === 'Error') found = true
      }
      if (
        ts.isCallExpression(expression) &&
        ts.isPropertyAccessExpression(expression.expression) &&
        ts.isIdentifier(expression.expression.expression) &&
        expectBindings.has(expression.expression.expression.text) &&
        expression.expression.name.text === 'fail'
      ) {
        found = true
      }
    }

    inspect(body)
  }

  function visit(node) {
    if (found) return
    if (ts.isCallExpression(node)) {
      const call = invocation(node.expression, bindings)
      if (call) {
        const title = node.arguments[0]
        const callback = node.arguments[1]
        if (!isActive(call) || !title || !callback || callback === title) return
        if (call.kind === 'suite') {
          if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
            visit(callback.body)
          return
        }
        if (
          (ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title)) &&
          title.text.includes(`[${acceptanceId}]`) &&
          (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
        ) {
          inspectTestBody(callback.body)
        }
        return
      }
    }
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))
      return
    ts.forEachChild(node, visit)
  }

  visit(file)
  return found
}

function findAcceptanceCase(content, acceptanceId, expectedTitle = null) {
  const { file, bindings } = parseTestSource(content)
  let selected = null

  function visit(node, suites) {
    if (selected) return
    if (ts.isCallExpression(node)) {
      const call = invocation(node.expression, bindings)
      if (call) {
        const title = node.arguments[0]
        const callback = node.arguments[1]
        if (!isActive(call) || !title || !callback || callback === title) return
        if (call.kind === 'suite') {
          if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
            visit(callback.body, [...suites, node])
          return
        }
        if (
          (ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title)) &&
          title.text.includes(`[${acceptanceId}]`) &&
          (expectedTitle === null ||
            expectedTitle === `[${acceptanceId}]` ||
            title.text === expectedTitle) &&
          (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
        ) {
          selected = { file, node, callback, suites, title: title.text }
        }
        return
      }
    }
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))
      return
    ts.forEachChild(node, (child) => visit(child, suites))
  }

  visit(file, [])
  return selected
}

function hookNodes(testCase, hookBindings, testBindings) {
  const hooks = []
  for (const suite of [...testCase.suites, null]) {
    const container = suite ? suite.arguments[1] : testCase.file
    if (
      !container ||
      (!ts.isArrowFunction(container) &&
        !ts.isFunctionExpression(container) &&
        !ts.isSourceFile(container))
    )
      continue
    const body = ts.isSourceFile(container) ? container : container.body
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const expression = unwrap(node.expression)
        const directHook = ts.isIdentifier(expression) && hookBindings.has(expression.text)
        const frameworkHook =
          ts.isPropertyAccessExpression(expression) &&
          hookBindings.has(expression.name.text) &&
          ['test', 'it'].includes(testBindings.get(rootIdentifier(expression.expression)))
        if ((directHook || frameworkHook) && node.arguments[0]) hooks.push(node)
      }
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node)
      )
        return
      ts.forEachChild(node, visit)
    }
    visit(body)
  }
  return hooks
}

function rootIdentifier(node) {
  node = unwrap(node)
  if (ts.isIdentifier(node)) return node.text
  if (ts.isPropertyAccessExpression(node)) return rootIdentifier(node.expression)
  if (ts.isCallExpression(node)) return rootIdentifier(node.expression)
  return null
}

function assertionCall(node, expectBindings) {
  if (!ts.isCallExpression(node)) return false
  return expectBindings.has(rootIdentifier(node.expression))
}

function assertionExpectCall(node, expectBindings) {
  if (!ts.isCallExpression(node)) return null
  let expression = unwrap(node.expression)
  while (ts.isPropertyAccessExpression(expression)) expression = unwrap(expression.expression)
  if (ts.isCallExpression(expression) && expectBindings.has(rootIdentifier(expression.expression)))
    return expression
  return null
}

/**
 * @param {string} content
 * @param {string} acceptanceId
 * @param {string | null} [expectedTitle=null]
 * @param {{ requireTargetMarker?: boolean }} [options]
 * @returns {Array<{ line: number, column: number, endLine: number, endColumn: number, target: boolean }>}
 */
export function acceptanceTestAssertionLocations(
  content,
  acceptanceId,
  expectedTitle = null,
  { requireTargetMarker = false } = {},
) {
  const testCase = findAcceptanceCase(content, acceptanceId, expectedTitle)
  if (!testCase) return []
  const { expectBindings } = parseTestSource(content)
  const locations = []
  function visit(node) {
    const expectCall = assertionCall(node, expectBindings)
      ? assertionExpectCall(node, expectBindings)
      : null
    const marker = expectCall?.arguments[1]
    const marked =
      marker &&
      (ts.isStringLiteral(marker) || ts.isNoSubstitutionTemplateLiteral(marker)) &&
      marker.text.includes(`[${acceptanceId}]`) &&
      /\btarget\b/i.test(marker.text)
    if (expectCall && (!requireTargetMarker || marked)) {
      const start = testCase.file.getLineAndCharacterOfPosition(node.getStart(testCase.file))
      const end = testCase.file.getLineAndCharacterOfPosition(node.getEnd())
      locations.push({
        line: start.line + 1,
        column: start.character + 1,
        endLine: end.line + 1,
        endColumn: end.character + 1,
        target: Boolean(marked),
      })
    }
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))
      return
    ts.forEachChild(node, visit)
  }
  visit(testCase.callback.body)
  return locations
}

function referencedNames(nodes) {
  const names = new Set()
  for (const root of nodes) {
    function visit(node) {
      if (ts.isIdentifier(node)) names.add(node.text)
      ts.forEachChild(node, visit)
    }
    visit(root)
  }
  return names
}

function localDeclarations(file) {
  const declarations = new Map()
  for (const statement of file.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      declarations.set(statement.name.text, statement)
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations)
        if (ts.isIdentifier(declaration.name)) declarations.set(declaration.name.text, statement)
    }
  }
  return declarations
}

function exportedDeclarations(file) {
  const exports = new Map()
  for (const statement of file.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      const modifiers = statement.modifiers || []
      if (modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
        exports.set(statement.name.text, statement.name.text)
      if (modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword))
        exports.set('default', statement.name.text)
    } else if (ts.isVariableStatement(statement)) {
      if (
        (statement.modifiers || []).some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        )
      ) {
        for (const declaration of statement.declarationList.declarations)
          if (ts.isIdentifier(declaration.name))
            exports.set(declaration.name.text, declaration.name.text)
      }
    } else if (
      ts.isExportDeclaration(statement) &&
      !statement.moduleSpecifier &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements)
        exports.set(element.name.text, element.propertyName?.text || element.name.text)
    } else if (ts.isExportAssignment(statement)) {
      exports.set(
        'default',
        ts.isIdentifier(statement.expression) ? statement.expression.text : null,
      )
    }
  }
  return exports
}

function testSupportPath(path) {
  return (
    /(?:^|\/)tests\/(?:.*\/)?(?:test-support|test-helpers|test-utils|fixtures|helpers|utils)(?:\/|$)/.test(
      path,
    ) ||
    /(?:^|\/)tests\/(?:.*\/)?[^/]*(?:-fixture|\.fixture)\.(?:ts|tsx|js|jsx|mjs)$/.test(path) ||
    /(?:^|\/)tests\/(?:.*\/)?(?:helpers?|global-setup)\.(?:ts|tsx|js|jsx|mjs)$/.test(path)
  )
}

function resolveLocalImport(fromPath, specifier, readFile) {
  if (!specifier.startsWith('.')) return null
  const base = normalize(join(dirname(fromPath), specifier)).replaceAll('\\', '/')
  for (const candidate of [
    base,
    ...['.ts', '.tsx', '.js', '.jsx', '.mjs'].map((ext) => `${base}${ext}`),
    ...['index.ts', 'index.tsx', 'index.js'].map((name) => join(base, name)),
  ]) {
    if (readFile(candidate) !== null) return candidate.replaceAll('\\', '/')
  }
  return null
}

/**
 * Fingerprint the selected test and its applicable hooks plus reachable test-support code.
 * Product imports are excluded. Put shared test setup under test-support/, test-helpers/, or
 * fixtures/, or pass their repository-relative paths in testSupportPaths. Default, namespace,
 * and side-effect imports conservatively include their whole test-support module. Other local
 * imports are surfaced as warnings instead of recursively hashing production code.
 * @param {{ entryPath: string, acceptanceId: string, expectedTitle?: string | null, readFile: (path: string) => string | null, testSupportPaths?: string[] }} options
 * @returns {{ context_schema: number, context_sha256: string, context_files: string[], warnings: string[] } | null}
 */
export function acceptanceTestContextFingerprint({
  entryPath,
  acceptanceId,
  expectedTitle = null,
  readFile,
  testSupportPaths = [],
}) {
  const entrySource = readFile(entryPath)
  if (typeof entrySource !== 'string') return null
  const selected = findAcceptanceCase(entrySource, acceptanceId, expectedTitle)
  if (!selected) return null

  const included = new Map()
  const warnings = new Set()
  const requestedModules = new Map()
  const moduleQueue = []
  const queuedModules = new Set()
  function addModule(path, selectedNames = null) {
    path = normalize(path).replaceAll('\\', '/')
    const incomingNames = selectedNames === null ? null : new Set(selectedNames)
    const previousNames = requestedModules.get(path)
    if (requestedModules.has(path) && previousNames === null) return
    let nextNames = incomingNames
    if (requestedModules.has(path) && incomingNames !== null) {
      nextNames = new Set([...previousNames, ...incomingNames])
      if (nextNames.size === previousNames.size) return
    }
    requestedModules.set(path, nextNames)
    if (!queuedModules.has(path)) {
      moduleQueue.push(path)
      queuedModules.add(path)
    }
  }
  function processModule(path) {
    const content = readFile(path)
    if (typeof content !== 'string') {
      warnings.add(`missing test-support source: ${path}`)
      return
    }
    const parsed = ts.createSourceFile(
      path,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    const declarations = localDeclarations(parsed)
    const exports = exportedDeclarations(parsed)
    const selectedNames = requestedModules.get(path)
    let includeWholeFile = selectedNames === null
    const names = selectedNames || new Set(declarations.keys())
    const picked = new Set()
    const queue = [...names]
    while (queue.length) {
      const name = queue.pop()
      const localName = exports.has(name) ? exports.get(name) : name
      const declaration = localName ? declarations.get(localName) : null
      if (exports.has(name) && localName === null) {
        includeWholeFile = true
        for (const item of declarations.values()) picked.add(item)
        break
      }
      if (!declaration || picked.has(declaration)) continue
      picked.add(declaration)
      for (const referenced of referencedNames([declaration]))
        if (declarations.has(referenced) && !picked.has(declarations.get(referenced)))
          queue.push(referenced)
    }
    const pieces = includeWholeFile
      ? [content]
      : [...picked].map((node) => node.getText(parsed)).sort()
    const chosenNames = includeWholeFile
      ? referencedNames([parsed])
      : new Set([...picked].flatMap((node) => [...referencedNames([node])]))
    for (const statement of parsed.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
        continue
      const clause = statement.importClause
      const bindings = clause?.namedBindings
      const importedLocals = []
      if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements)
          if (chosenNames.has(element.name.text))
            importedLocals.push(element.propertyName?.text || element.name.text)
      } else if (
        bindings &&
        ts.isNamespaceImport(bindings) &&
        chosenNames.has(bindings.name.text)
      ) {
        importedLocals.push('*')
      } else if (clause?.name && chosenNames.has(clause.name.text)) {
        importedLocals.push('default')
      } else if (!clause) {
        importedLocals.push('*')
      }
      if (!importedLocals.length) continue
      const resolved = resolveLocalImport(path, statement.moduleSpecifier.text, readFile)
      if (!resolved) continue
      if (!testSupportPath(resolved)) {
        warnings.add(`local dependency excluded outside declared test-support paths: ${resolved}`)
        continue
      }
      addModule(resolved, importedLocals.includes('*') ? null : importedLocals)
    }
    for (const statement of parsed.statements) {
      if (
        !ts.isExportDeclaration(statement) ||
        !statement.moduleSpecifier ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      )
        continue
      const clause = statement.exportClause
      let reexported = []
      if (!clause) {
        reexported = selectedNames === null ? null : [...selectedNames]
      } else if (ts.isNamespaceExport(clause)) {
        if (selectedNames === null || selectedNames.has(clause.name.text)) reexported = null
      } else if (ts.isNamedExports(clause)) {
        reexported = clause.elements
          .filter((element) => selectedNames === null || selectedNames.has(element.name.text))
          .map((element) => element.propertyName?.text || element.name.text)
      }
      if (reexported !== null && !reexported.length) continue
      const resolved = resolveLocalImport(path, statement.moduleSpecifier.text, readFile)
      if (!resolved) continue
      if (!testSupportPath(resolved)) {
        warnings.add(`local dependency excluded outside declared test-support paths: ${resolved}`)
        continue
      }
      addModule(resolved, reexported)
    }
    included.set(path, pieces.join('\n'))
  }

  const entryFile = selected.file
  const parsedEntry = parseTestSource(entrySource)
  const entryHooks = hookNodes(selected, parsedEntry.hookBindings, parsedEntry.bindings)
  const entryParts = [
    selected.node.getText(entryFile),
    ...entryHooks.map((hook) => hook.getText(entryFile)),
  ]
  const declarations = localDeclarations(entryFile)
  const selectedNames = referencedNames([selected.node, ...entryHooks])
  const entryDeclarationNodes = new Set()
  const queue = [...selectedNames]
  while (queue.length) {
    const name = queue.pop()
    const declaration = declarations.get(name)
    if (!declaration || entryDeclarationNodes.has(declaration)) continue
    entryDeclarationNodes.add(declaration)
    for (const referenced of referencedNames([declaration])) queue.push(referenced)
  }
  for (const declaration of entryDeclarationNodes) entryParts.push(declaration.getText(entryFile))
  included.set(entryPath, [...new Set(entryParts)].sort().join('\n'))

  const entryBindings = new Set([...selectedNames, ...referencedNames([...entryDeclarationNodes])])
  for (const statement of entryFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue
    const clause = statement.importClause
    const bindings = clause?.namedBindings
    let imported = []
    if (bindings && ts.isNamedImports(bindings)) {
      imported = bindings.elements
        .filter((element) => entryBindings.has(element.name.text))
        .map((element) => element.propertyName?.text || element.name.text)
    } else if (
      bindings &&
      ts.isNamespaceImport(bindings) &&
      entryBindings.has(bindings.name.text)
    ) {
      imported = ['*']
    } else if (clause?.name && entryBindings.has(clause.name.text)) {
      imported = ['default']
    } else if (!clause) {
      imported = ['*']
    }
    if (!imported.length) continue
    const resolved = resolveLocalImport(entryPath, statement.moduleSpecifier.text, readFile)
    if (!resolved) continue
    if (!testSupportPath(resolved)) {
      warnings.add(`local dependency excluded outside declared test-support paths: ${resolved}`)
      continue
    }
    addModule(resolved, imported.includes('*') ? null : imported)
  }
  for (const path of testSupportPaths) addModule(path)
  while (moduleQueue.length) {
    const path = moduleQueue.shift()
    queuedModules.delete(path)
    processModule(path)
  }
  const entries = [...included.entries()].sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  )
  const digestInput = JSON.stringify(entries)
  return {
    context_schema: 1,
    context_sha256: createHash('sha256').update(digestInput).digest('hex'),
    context_files: entries.map(([path]) => path),
    warnings: [...warnings].sort(),
  }
}
