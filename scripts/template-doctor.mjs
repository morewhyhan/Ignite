import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
const isAdopted = /状态：`adopted`/.test(productSpec)
const slug = siteConfig.match(/slug:\s*'([^']+)'/)?.[1]
const siteName = siteConfig.match(/name:\s*'([^']+)'/)?.[1]

if (!slug || !siteName) {
  issue('Unable to read name and slug from src/config/site.ts.')
}

if (isAdopted) {
  if (packageJson.name === 'ignite') issue('Adopted project still uses package name "ignite".')
  if (slug === 'ignite') issue('Adopted project still uses the shared Ignite cookie prefix.')
  if (siteName === 'Ignite') issue('Adopted project still uses the Ignite display name.')
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

if (environment) {
  if (!/^APP_ENV\s*=\s*["']?(?:development|test|production)["']?\s*$/m.test(environment)) {
    issue('.env must declare APP_ENV explicitly.')
  }

  for (const name of ['APP_URL', 'DATABASE_URL', 'BETTER_AUTH_SECRET']) {
    if (!new RegExp(`^${name}\\s*=\\s*.+$`, 'm').test(environment)) {
      issue(`.env must declare ${name}.`)
    }
  }

  if (
    environment.includes(
      'BETTER_AUTH_SECRET="ignite-development-only-secret-change-before-deploying"',
    )
  ) {
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
  if (process.env.BETTER_AUTH_SECRET === 'ignite-development-only-secret-change-before-deploying') {
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
