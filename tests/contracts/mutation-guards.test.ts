import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from './ignite-fixture'

const route = '/src/server/api/routes/tasks/index.ts'
const mutants = [
  { name: 'list', original: 'where: { userId },', changed: 'where: {},' },
  {
    name: 'update',
    original: 'const result = await tx.task.updateMany({\n          where: { id, userId },',
    changed: 'const result = await tx.task.updateMany({\n          where: { id },',
  },
  {
    name: 'delete',
    original: 'const result = await prisma.task.deleteMany({\n      where: { id, userId },',
    changed: 'const result = await prisma.task.deleteMany({\n      where: { id },',
  },
]

describe('Tasks ownership regression sensitivity', () => {
  it('[AC-PRODUCT-013] fails when Tasks ownership checks are removed', () => {
    const directory = mkdtempSync(join(tmpdir(), 'ignite-mutation-'))
    try {
      for (const mutant of mutants) {
        const config = join(directory, `${mutant.name}.config.mjs`)
        writeFileSync(
          config,
          `export default {
            resolve: { alias: { '@': ${JSON.stringify(join(repositoryRoot, 'src'))} } },
            plugins: [{
              name: 'owned-resource-fault-injection',
              enforce: 'pre',
              transform(source, id) {
                if (!id.replaceAll('\\\\', '/').endsWith(${JSON.stringify(route)})) return null
                const original = ${JSON.stringify(mutant.original)}
                if (!source.includes(original)) throw new Error('Mutation target changed: ' + original)
                process.stderr.write('MUTATION_APPLIED:${mutant.name}\\n')
                return source.replace(original, ${JSON.stringify(mutant.changed)})
              },
            }],
            test: { include: ['tests/api/tasks.test.ts'], environment: 'node', reporters: ['default'] },
          }\n`,
        )
        const result = spawnSync(
          process.execPath,
          [
            join(repositoryRoot, 'node_modules/vitest/vitest.mjs'),
            'run',
            'tests/api/tasks.test.ts',
            '--config',
            config,
            '-t',
            'does not expose or delete another user task',
          ],
          {
            cwd: repositoryRoot,
            encoding: 'utf8',
            windowsHide: true,
            timeout: 25_000,
            env: { ...process.env, IGNITE_PLAN_ID: '' },
          },
        )
        const output = `${result.stdout || ''}\n${result.stderr || ''}`
        expect(output, `${mutant.name}: ${result.error?.message || output}`).toContain(
          `MUTATION_APPLIED:${mutant.name}`,
        )
        expect(result.status, `${mutant.name}: ${output}`).not.toBe(0)
        expect(output, mutant.name).toContain('does not expose or delete another user task')
      }
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  }, 90_000)
})
