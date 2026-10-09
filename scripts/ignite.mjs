#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from './ignite/arguments.mjs'
import { commandSkillRead } from './ignite/skill-reader.mjs'

try {
  const root = resolve(
    process.env.IGNITE_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..'),
  )
  const path = join(root, '.ai/runtime.json')
  if (process.env.IGNITE_SKIP_RUNTIME_CHECK !== 'true' && existsSync(path)) {
    const { node } = JSON.parse(readFileSync(path, 'utf8'))
    if (node !== process.versions.node)
      throw new Error(
        `Node ${node} is required; current runtime is ${process.versions.node}. In WSL/Linux, run nvm use ${node}, then retry node scripts/runtime-doctor.mjs --preflight.`,
      )
  }
  const argv = process.argv.slice(2)
  if (
    argv[0] === 'skill' &&
    argv[1] === 'read' &&
    !argv.includes('--help') &&
    !argv.includes('-h')
  ) {
    const { options, positionals } = parseArgs(argv.slice(2))
    commandSkillRead(root, options, positionals)
  } else {
    const { main } = await import('./ignite/cli.mjs')
    await main(argv)
  }
} catch (error) {
  console.error(`Ignite: ${error.message}`)
  process.exitCode = 1
}
