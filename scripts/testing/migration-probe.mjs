import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const migrationProbeFixturePath = (projectRoot = process.env.IGNITE_ROOT || process.cwd()) =>
  join(resolve(projectRoot), 'tests', 'fixtures', 'migrations', 'values.json')

/** Optional project-owned data values for tables with CHECK/domain constraints. */
export function loadMigrationProbeFixture(path = migrationProbeFixturePath()) {
  if (!existsSync(path)) return { tables: {} }
  let parsed
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    throw new Error(`Invalid migration probe fixture ${path}: ${error.message}`)
  }
  if (
    parsed?.schema !== 1 ||
    !parsed.tables ||
    typeof parsed.tables !== 'object' ||
    Array.isArray(parsed.tables)
  ) {
    throw new Error(
      `Invalid migration probe fixture ${path}: expected schema 1 and a tables object`,
    )
  }
  for (const [table, columns] of Object.entries(parsed.tables)) {
    if (!columns || typeof columns !== 'object' || Array.isArray(columns)) {
      throw new Error(
        `Invalid migration probe fixture ${path}: tables.${table} must be a column-value object`,
      )
    }
    for (const [column, value] of Object.entries(columns)) {
      if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) {
        throw new Error(
          `Invalid migration probe fixture ${path}: tables.${table}.${column} must be a scalar or null`,
        )
      }
    }
  }
  return parsed
}

function quote(value) {
  return `"${value.replaceAll('"', '""')}"`
}

function tables(database) {
  return database
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations' ORDER BY name",
    )
    .all()
    .map((row) => row.name)
}

function assertIntegrity(database) {
  if (database.prepare('PRAGMA foreign_key_check').all().length) {
    throw new Error('migration violates foreign key integrity')
  }
  const integrity = database.prepare('PRAGMA integrity_check').all()
  if (integrity.some((row) => row.integrity_check !== 'ok')) {
    throw new Error('migration violates database integrity')
  }
}

function sampleValue(table, column) {
  if (/INT|REAL|NUMERIC|DECIMAL|BOOL/i.test(column.type)) return 1
  if (/DATE|TIME/i.test(column.type)) return '2026-01-01T00:00:00.000Z'
  return `probe-${table}-${column.name}`
}

/** Seed only empty tables; preserve existing migration-provided rows and valid relations. */
export function seedMigrationProbe(
  database,
  {
    fixturePath = migrationProbeFixturePath(),
    fixture = loadMigrationProbeFixture(fixturePath),
  } = {},
) {
  assertIntegrity(database)
  const descriptors = new Map(
    tables(database).map((table) => {
      const columns = database.prepare(`PRAGMA table_info(${quote(table)})`).all()
      return [
        table,
        {
          columns,
          foreignKeys: database.prepare(`PRAGMA foreign_key_list(${quote(table)})`).all(),
          existing: database.prepare(`SELECT * FROM ${quote(table)} LIMIT 1`).get(),
        },
      ]
    }),
  )
  function valueFor(table, column, seen = new Set()) {
    const key = `${table}\0${column}`
    if (seen.has(key))
      throw new Error(
        `cyclic probe value for ${table}.${column}; add a project-specific migration fixture`,
      )
    const descriptor = descriptors.get(table)
    const field = descriptor?.columns.find((entry) => entry.name === column)
    if (!field) throw new Error(`unknown migration probe field ${table}.${column}`)
    if (descriptor.existing) return descriptor.existing[column]
    if (Object.hasOwn(fixture.tables[table] || {}, column)) {
      const value = fixture.tables[table][column]
      return typeof value === 'boolean' ? Number(value) : value
    }
    const relation = descriptor.foreignKeys.find((entry) => entry.from === column)
    if (!relation) return sampleValue(table, field)
    const target =
      relation.to ||
      descriptors
        .get(relation.table)
        ?.columns.filter((entry) => entry.pk)
        .sort((a, b) => a.pk - b.pk)[relation.seq]?.name
    return valueFor(relation.table, target, new Set([...seen, key]))
  }

  database.exec('PRAGMA foreign_keys = ON; BEGIN; PRAGMA defer_foreign_keys = ON;')
  try {
    for (const [table, descriptor] of descriptors) {
      if (descriptor.existing) continue
      const columns = descriptor.columns.map((column) => column.name)
      try {
        database
          .prepare(
            `INSERT INTO ${quote(table)} (${columns.map(quote).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
          )
          .run(...columns.map((column) => valueFor(table, column)))
      } catch (error) {
        throw new Error(
          `table ${table} needs valid probe data: ${error.message}. Set tables.${table} in ${fixturePath}`,
        )
      }
    }
    assertIntegrity(database)
    database.exec('COMMIT;')
  } catch (error) {
    database.exec('ROLLBACK;')
    throw new Error(
      `Cannot seed a valid migration probe: ${error.message}. Extend the project migration fixture; do not disable integrity checks.`,
    )
  }
  return new Map(
    [...descriptors.keys()].map((table) => [
      table,
      database.prepare(`SELECT * FROM ${quote(table)}`).all(),
    ]),
  )
}

/** Existing values must survive; additive columns, rows and tables remain allowed. */
export function assertMigrationProbe(database, snapshot) {
  assertIntegrity(database)
  const currentTables = new Set(tables(database))
  for (const [table, expected] of snapshot) {
    if (!currentTables.has(table)) throw new Error(`migration drops existing data table ${table}`)
    if (!expected.length) continue
    const columns = Object.keys(expected[0])
    const currentColumns = new Set(
      database
        .prepare(`PRAGMA table_info(${quote(table)})`)
        .all()
        .map((column) => column.name),
    )
    if (columns.some((column) => !currentColumns.has(column))) {
      throw new Error(`migration removes columns with existing data in ${table}`)
    }
    const actual = database
      .prepare(`SELECT ${columns.map(quote).join(', ')} FROM ${quote(table)}`)
      .all()
    const counts = new Map()
    for (const row of actual) {
      const encoded = JSON.stringify(row)
      counts.set(encoded, (counts.get(encoded) || 0) + 1)
    }
    for (const row of expected) {
      const encoded = JSON.stringify(row)
      const remaining = counts.get(encoded) || 0
      if (!remaining) throw new Error(`migration changes existing data in ${table}`)
      counts.set(encoded, remaining - 1)
    }
  }
}
