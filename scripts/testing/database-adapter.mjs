import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'

/** The single supported isolated database capability for this template baseline. */
export const databaseTestAdapter = {
  provider: 'sqlite',
  isolatedUrl(path) {
    return `file:${path.replaceAll('\\', '/')}`
  },
  openMemory() {
    return new DatabaseSync(':memory:')
  },
  assertSchema(path) {
    const schema = readFileSync(path, 'utf8')
    if (!/provider\s*=\s*["']sqlite["']/.test(schema)) {
      throw new Error(
        'The test database adapter supports SQLite only. Select and implement a new isolated adapter before changing the Prisma provider.',
      )
    }
  },
}
