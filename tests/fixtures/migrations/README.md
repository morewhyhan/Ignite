# Migration probe values

`pnpm test:migrations` creates temporary SQLite databases and seeds representative data before each migration. It never writes to the application's database.

If a project's new table has `CHECK` or domain constraints that a generic value cannot satisfy, add `values.json` beside this file:

```json
{
  "schema": 1,
  "tables": {
    "invoice": {
      "status": "PENDING",
      "quantity": 2,
      "unitPriceCents": 100,
      "totalCents": 200
    }
  }
}
```

Only scalar column overrides are accepted. Foreign-key values are generated from related seeded rows unless explicitly overridden. A failed insert names the table and the `tables.<name>` entry to provide. The fixture is project-owned; keep constraints enabled and use real legal examples.

`upgrade-schema.prisma` is solely the frozen test schema for the baseline migration-upgrade contract, not a project schema or code-generation target.
