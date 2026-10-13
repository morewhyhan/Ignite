import type { FullConfig } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
import { prepareE2eRoutes } from '../../scripts/testing/e2e-runtime.mjs'

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL
  if (typeof baseURL !== 'string') {
    throw new Error('E2E startup preparation requires a configured baseURL.')
  }

  const snapshotPath = process.env.E2E_NEXT_ENV_SNAPSHOT
  if (snapshotPath) {
    const generatedTypes = await readFile('next-env.d.ts', 'utf8').catch(() => '')
    if (/\.next\/e2e\/(?:dev\/)?types\/routes\.d\.ts/.test(generatedTypes)) {
      await writeFile(snapshotPath, generatedTypes)
    }
  }

  const prepared = await prepareE2eRoutes({ baseURL })
  console.log(
    `E2E startup prepared ${prepared.map(({ path, status }) => `${path} (${status})`).join(', ')}.`,
  )
}
