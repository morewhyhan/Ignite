import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const defaultRoot = () => resolve(process.env.IGNITE_ROOT || process.cwd())

function content(root, path) {
  const file = join(root, path)
  return existsSync(file) && statSync(file).isFile() ? readFileSync(file, 'utf8') : ''
}

function filesUnder(root, directory) {
  const absolute = join(root, directory)
  if (!existsSync(absolute)) return []
  return readdirSync(absolute, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
    .sort()
}

/** Current source state only. Historical migrations deliberately do not count as active schema. */
export function tasksExampleState(root = defaultRoot()) {
  const projectRoot = resolve(root)
  const moduleFiles = filesUnder(projectRoot, 'src/modules/tasks')
  const pageFiles = filesUnder(projectRoot, 'src/app/dashboard/tasks')
  const routeFiles = filesUnder(projectRoot, 'src/server/api/routes/tasks')
  const navigationRegistered = /['"]\/dashboard\/tasks(?:\/|['"])/.test(
    content(projectRoot, 'src/config/navigation.ts'),
  )
  const apiRegistered = /['"]\.\/routes\/tasks['"]|\btasksRoute\b/.test(
    content(projectRoot, 'src/server/api/index.ts'),
  )
  const schema = content(projectRoot, 'prisma/schema.prisma')
  const anchorsPresent = [
    'src/config/navigation.ts',
    'src/server/api/index.ts',
    'prisma/schema.prisma',
  ].every((path) => existsSync(join(projectRoot, path)))
  const taskModel = /\bmodel\s+task\s*\{/.test(schema)
  const userRelation = /\btasks\s+task\[\]/.test(schema)
  const ui = moduleFiles.length > 0 || pageFiles.length > 0 || navigationRegistered
  const api = routeFiles.length > 0 || apiRegistered
  const data = taskModel || userRelation
  const fullyRemoved = anchorsPresent && !ui && !api && !data
  const fullyInstalled =
    moduleFiles.length > 0 &&
    pageFiles.length > 0 &&
    navigationRegistered &&
    routeFiles.length > 0 &&
    apiRegistered &&
    taskModel &&
    userRelation
  return {
    ui,
    api,
    schema: data,
    anchorsPresent,
    fullyRemoved,
    partiallyRemoved: !fullyRemoved && !fullyInstalled,
    signals: {
      moduleFiles,
      pageFiles,
      routeFiles,
      navigationRegistered,
      apiRegistered,
      taskModel,
      userRelation,
    },
  }
}

/** Read-only inventory for intentionally keeping, adapting, or removing the Tasks example. */
export function exampleRemovalPlan(name = 'tasks', root = defaultRoot()) {
  if (name !== 'tasks') throw new Error(`No example inventory is registered for ${name}`)
  const projectRoot = resolve(root)
  const state = tasksExampleState(projectRoot)
  const checklist = []
  const add = (path, area, action) => {
    if (existsSync(join(projectRoot, path)) && !checklist.some((entry) => entry.path === path)) {
      checklist.push({ path, area, action })
    }
  }

  for (const path of state.signals.moduleFiles) add(path, 'UI / Hook', 'remove or adapt')
  for (const path of state.signals.pageFiles) add(path, 'page route', 'remove or adapt')
  for (const path of state.signals.routeFiles) add(path, 'business RPC', 'remove or adapt')
  if (state.signals.navigationRegistered)
    add('src/config/navigation.ts', 'navigation', 'remove Tasks entry')
  if (state.signals.apiRegistered)
    add('src/server/api/index.ts', 'API registry', 'remove Tasks registration')
  if (state.signals.taskModel || state.signals.userRelation) {
    add(
      'prisma/schema.prisma',
      'current schema',
      'remove task model and user relation with a new migration',
    )
  }
  add('docs/features/tasks.md', 'feature', 'retire or rewrite the Tasks specification')

  for (const directory of [
    'src/app',
    'src/modules',
    'docs/designs',
    'docs/others/test-cases',
    'tests/api',
    'tests/e2e',
    'tests/contracts',
  ]) {
    for (const path of filesUnder(projectRoot, directory)) {
      const source = content(projectRoot, path)
      const broadExampleReference =
        (directory.startsWith('docs/') || directory.startsWith('src/')) &&
        /\bTasks?\b|\/tasks\b|REQ-TASKS-|AC-TASKS-/i.test(source)
      if (
        broadExampleReference ||
        /\bsrc\/modules\/tasks\b|\bsrc\/server\/api\/routes\/tasks\b|\btests\/api\/tasks\b|\btaskSchema\b|\bTasksScreen\b|\/dashboard\/tasks\b|\bmodel task\b/i.test(
          source,
        ) ||
        /(^|\/)tasks\.(test|spec)\.[cm]?[jt]sx?$/.test(path)
      ) {
        add(
          path,
          directory.startsWith('src/') ? 'other UI reference' : 'documentation or test',
          directory.startsWith('src/')
            ? 'remove or adapt Tasks-specific reference'
            : 'review Tasks-specific assertions; retain independent auth/security coverage',
        )
      }
    }
  }
  for (const path of ['README.md', 'AGENTS.md', 'docs/standards/adoption.md']) {
    if (/\bTasks\b/.test(content(projectRoot, path)))
      add(path, 'project guidance', 'update example references')
  }

  const historicalMigrations = filesUnder(projectRoot, 'prisma/migrations').filter(
    (path) => path.endsWith('/migration.sql') && /\btask\b/i.test(content(projectRoot, path)),
  )
  return {
    name,
    state,
    checklist: checklist.sort((left, right) => left.path.localeCompare(right.path)),
    historicalMigrations: historicalMigrations.map((path) => ({
      path,
      action: 'preserve; add a new migration instead',
    })),
    note: 'Inventory only: no files or migrations were changed. UI, API and current schema must all be absent before Tasks-specific checks may be skipped.',
  }
}
