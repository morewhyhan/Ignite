import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import ts from 'typescript'
import { developmentSecret, environmentPolicyIssues } from '../src/server/env-policy.mjs'

const repositoryRoot = process.cwd()
const issues = []
const notices = []

function read(path) {
  return readFileSync(resolve(repositoryRoot, path), 'utf8')
}

function issue(message) {
  issues.push(message)
}

function notice(message) {
  notices.push(message)
}

const productSpec = read('docs/features/product.md')
const siteConfig = read('src/config/site.ts')
const packageJson = JSON.parse(read('package.json'))
const identityPath = resolve(repositoryRoot, '.ai/project.json')
let identity = null
if (existsSync(identityPath)) {
  try {
    identity = JSON.parse(readFileSync(identityPath, 'utf8'))
    if (identity.schema !== 1 || !['template-baseline', 'adopted'].includes(identity.mode)) {
      issue('.ai/project.json must declare schema 1 and a supported mode.')
    }
    if (
      typeof identity.source_repository !== 'string' ||
      !identity.source_repository.trim() ||
      !(identity.project_repository === null || typeof identity.project_repository === 'string')
    ) {
      issue('.ai/project.json must declare a source repository and a nullable project repository.')
    }
  } catch {
    issue('.ai/project.json is not valid JSON.')
  }
}
const isAdopted = identity ? identity.mode === 'adopted' : /^- 状态：`adopted`$/m.test(productSpec)

function repositoryKey(url) {
  return String(url || '')
    .trim()
    .replace(/^git@github\.com:/i, 'github.com/')
    .replace(/^https?:\/\/github\.com\//i, 'github.com/')
    .replace(/\.git\/?$/i, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

function siteValue(property) {
  const source = ts.createSourceFile('site.ts', siteConfig, ts.ScriptTarget.Latest, true)
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        !['siteConfig', 'site'].includes(declaration.name.text)
      )
        continue
      let expression = declaration.initializer
      while (
        expression &&
        (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression))
      ) {
        expression = expression.expression
      }
      if (!expression || !ts.isObjectLiteralExpression(expression)) continue
      for (const entry of expression.properties) {
        if (!ts.isPropertyAssignment(entry)) continue
        const key =
          ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name) ? entry.name.text : null
        if (key === property && ts.isStringLiteralLike(entry.initializer)) {
          return entry.initializer.text
        }
      }
    }
  }
  return null
}

const slug = siteValue('slug')
const siteName = siteValue('name')

if (!slug || !siteName) {
  issue('Unable to read name and slug from src/config/site.ts.')
}

if (isAdopted) {
  if (packageJson.name === 'ignite') issue('Adopted project still uses package name "ignite".')
  if (slug === 'ignite') issue('Adopted project still uses the shared Ignite cookie prefix.')
  if (siteName === 'Ignite') issue('Adopted project still uses the Ignite display name.')
  const pushUrl = spawnSync('git', ['remote', 'get-url', '--push', 'origin'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
  })
  if (
    pushUrl.status === 0 &&
    repositoryKey(pushUrl.stdout) ===
      repositoryKey(identity?.source_repository || 'git@github.com:morewhyhan/Ignite.git')
  ) {
    issue('Adopted project still pushes to the Ignite template repository; choose its own remote.')
  }
  if (
    identity?.project_repository &&
    pushUrl.status === 0 &&
    repositoryKey(pushUrl.stdout) !== repositoryKey(identity.project_repository)
  ) {
    issue('Git origin push URL differs from .ai/project.json project_repository.')
  }
  if (identity?.project_repository && pushUrl.status !== 0) {
    issue('.ai/project.json declares a project repository but Git origin is not configured.')
  }
  if (
    identity?.project_repository &&
    repositoryKey(identity.project_repository) === repositoryKey(identity.source_repository)
  ) {
    issue('The project repository must differ from the template source repository.')
  }
} else {
  notice('Template baseline detected. Follow docs/standards/adoption.md before product work.')
}

const environmentPath = resolve(repositoryRoot, '.env')
let environment = ''
if (!existsSync(environmentPath)) {
  const message = 'No .env file found. Copy .env.example before running the application.'
  if (isAdopted && !process.env.APP_ENV) issue(message)
  else notice(message)
} else {
  environment = readFileSync(environmentPath, 'utf8')
}

function environmentValues(content) {
  const values = new Map()
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!match) continue
    let value = match[2]
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1)
    } else {
      value = value.split(/\s+#/, 1)[0].trim()
    }
    values.set(match[1], value)
  }
  return values
}

if (environment) {
  const values = environmentValues(environment)
  if (!['development', 'test', 'production'].includes(values.get('APP_ENV'))) {
    issue('.env must declare APP_ENV explicitly.')
  }

  for (const name of ['APP_URL', 'DATABASE_URL', 'BETTER_AUTH_SECRET']) {
    if (!values.get(name)) {
      issue(`.env must declare ${name}.`)
    }
  }

  for (const policyIssue of environmentPolicyIssues(Object.fromEntries(values))) {
    issue(policyIssue.message)
  }

  if (values.get('BETTER_AUTH_SECRET') === developmentSecret) {
    const message = 'Generate a unique BETTER_AUTH_SECRET for this local project.'
    if (isAdopted) issue(message)
    else notice(message)
  }
} else if (isAdopted) {
  if (!['development', 'test', 'production'].includes(process.env.APP_ENV || '')) {
    issue('APP_ENV must be provided when an adopted project has no local .env file.')
  }
  if (!process.env.APP_URL || !process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
    issue('APP_URL, DATABASE_URL and BETTER_AUTH_SECRET are required for an adopted project.')
  }
  for (const policyIssue of environmentPolicyIssues(process.env)) {
    issue(policyIssue.message)
  }
  if (process.env.BETTER_AUTH_SECRET === developmentSecret) {
    issue('Generate a unique BETTER_AUTH_SECRET for this project.')
  }
}

for (const path of [
  'AGENTS.md',
  'docs/standards/workflow.md',
  'docs/plans/_template.md',
  'src/config/navigation.ts',
]) {
  if (!existsSync(resolve(repositoryRoot, path))) issue(`Missing template baseline file: ${path}`)
}

for (const message of notices) console.log(`INFO: ${message}`)

if (issues.length > 0) {
  console.error('Template doctor found adoption issues:')
  for (const message of issues) console.error(`- ${message}`)
  process.exitCode = 1
} else {
  console.log('Template doctor passed.')
}
