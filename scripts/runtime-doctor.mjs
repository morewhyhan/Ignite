#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { hostname } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = resolve(process.env.IGNITE_ROOT || defaultRoot)
const contractPath = join(repositoryRoot, '.ai', 'runtime.json')
const markerPath = join(repositoryRoot, 'node_modules', '.ignite-platform.json')

function fail(message) {
  console.error(`Ignite runtime: ${message}`)
  process.exitCode = 1
}

function currentIdentity() {
  const userAgentVersion = process.env.npm_config_user_agent?.match(/^pnpm\/([^ ]+)/)?.[1]
  const pnpm = spawnSync('corepack', ['pnpm', '--version'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
  })
  return {
    schema: 1,
    platform: process.platform,
    arch: process.arch,
    node: process.versions.node,
    pnpm: userAgentVersion || (pnpm.status === 0 ? pnpm.stdout.trim() : 'unavailable'),
    host_id: createHash('sha256')
      .update(`${hostname()}\0${process.platform}\0${process.arch}`)
      .digest('hex')
      .slice(0, 12),
  }
}

if (!existsSync(contractPath)) {
  fail(`missing ${contractPath}`)
} else {
  const contract = JSON.parse(readFileSync(contractPath, 'utf8'))
  const current = currentIdentity()

  if (!contract.supported_platforms?.includes(current.platform)) {
    fail(`platform ${current.platform} is not supported`)
  }
  if (!contract.supported_architectures?.includes(current.arch)) {
    fail(`architecture ${current.arch} is not supported`)
  }
  if (contract.node !== current.node) {
    fail(`Node ${contract.node} is required; current runtime is ${current.node}`)
  }
  const requiredPnpm = String(contract.package_manager || '').replace(/^pnpm@/, '')
  if (current.pnpm !== requiredPnpm) {
    fail(`pnpm ${requiredPnpm} is required; current package manager is ${current.pnpm}`)
  }

  if (process.argv.includes('--record') && !process.exitCode) {
    mkdirSync(dirname(markerPath), { recursive: true })
    writeFileSync(markerPath, `${JSON.stringify(current, null, 2)}\n`, 'utf8')
    console.log(`Recorded ${current.platform}/${current.arch} dependency runtime.`)
  } else if (!process.argv.includes('--record') && !process.exitCode && !existsSync(markerPath)) {
    fail('dependency platform marker is missing; run pnpm install in this environment')
  } else if (!process.argv.includes('--record') && !process.exitCode) {
    const installed = JSON.parse(readFileSync(markerPath, 'utf8'))
    if (installed.platform !== current.platform || installed.arch !== current.arch) {
      fail(
        `node_modules was installed for ${installed.platform}/${installed.arch}, ` +
          `but this process is ${current.platform}/${current.arch}. Reinstall dependencies ` +
          'in one environment and do not share node_modules between Windows and WSL.',
      )
    } else if (installed.node !== current.node) {
      fail(
        `node_modules was installed with Node ${installed.node}; current runtime is ${current.node}`,
      )
    } else if (installed.pnpm !== current.pnpm) {
      fail(
        `node_modules was installed with pnpm ${installed.pnpm}; current runtime is ${current.pnpm}`,
      )
    } else {
      console.log(
        `Runtime contract passed (${current.platform}/${current.arch}, Node ${current.node}).`,
      )
    }
  }
}
