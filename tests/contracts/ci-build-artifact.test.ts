import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import { repositoryRoot } from './ignite-fixture'

type Step = { run?: string; uses?: string; with?: { path?: string } }
const workflow = () =>
  parse(readFileSync(join(repositoryRoot, '.github/workflows/ci.yml'), 'utf8')) as {
    jobs: Record<string, { steps: Step[] }>
  }
function write(path: string, text: string) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}
function installedClient(root: string) {
  const modules = join(root, 'node_modules/.pnpm/client-fixture/node_modules')
  write(
    join(modules, '@prisma/client/default.js'),
    "module.exports = require('.prisma/client/default')\n",
  )
  write(join(modules, '.prisma/client/default.js'), "module.exports = { health: 'ok' }\n")
}
function runnerPath(path: string, runnerTemp: string) {
  return path.replaceAll('${{ runner.temp }}', runnerTemp).replaceAll('$RUNNER_TEMP', runnerTemp)
}
function runTar(step: Step, cwd: string, runnerTemp: string) {
  const tokens = (step.run || '').match(/"[^"]*"|\S+/g) || []
  const [command, ...args] = tokens.map((part) =>
    runnerPath(part.replace(/^"|"$/g, ''), runnerTemp),
  )
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', windowsHide: true })
  expect(result.status, `${result.error || ''}\n${result.stderr}`).toBe(0)
}
async function freePort() {
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No diagnostic port allocated')
  const port = address.port
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  )
  return port
}

describe('CI production build handoff', () => {
  it('[AC-EXECUTION-041] loads external dependencies after the configured artifact round trip', () => {
    const fixture = mkdtempSync(join(tmpdir(), 'ignite-build-handoff-'))
    try {
      const sender = join(fixture, 'sender')
      const receiver = join(fixture, 'receiver')
      const senderTemp = join(fixture, 'sender-temp')
      const receiverTemp = join(fixture, 'receiver-temp')
      for (const path of [sender, receiver, senderTemp, receiverTemp])
        mkdirSync(path, { recursive: true })
      installedClient(sender)
      installedClient(receiver)
      const alias = '.next/node_modules/@prisma/client-fixture'
      mkdirSync(dirname(join(sender, alias)), { recursive: true })
      symlinkSync(
        '../../../node_modules/.pnpm/client-fixture/node_modules/@prisma/client',
        join(sender, alias),
      )
      const jobs = workflow().jobs
      const upload = jobs.build.steps.find((step) =>
        step.uses?.startsWith('actions/upload-artifact@'),
      )!
      const download = jobs.e2e.steps.find((step) =>
        step.uses?.startsWith('actions/download-artifact@'),
      )!
      const archive = runnerPath(upload.with!.path!, senderTemp)
      if (archive.endsWith('.tar')) {
        runTar(
          jobs.build.steps.find((step) => step.run?.startsWith('tar -cf '))!,
          sender,
          senderTemp,
        )
        const destination = runnerPath(download.with!.path!, receiverTemp)
        mkdirSync(destination, { recursive: true })
        copyFileSync(archive, join(destination, 'ignite-next-build.tar'))
        runTar(
          jobs.e2e.steps.find((step) => step.run?.startsWith('tar -xf '))!,
          receiver,
          receiverTemp,
        )
      } else {
        // A directory uploaded as ZIP dereferences links and loses pnpm's resolution context.
        cpSync(join(sender, upload.with!.path!), join(receiver, download.with!.path!), {
          recursive: true,
          dereference: true,
        })
      }
      const result = spawnSync(
        process.execPath,
        [
          '-e',
          `console.log(JSON.stringify(require(${JSON.stringify(join(receiver, alias, 'default.js'))})))`,
        ],
        { encoding: 'utf8', windowsHide: true },
      )
      expect({ exitCode: result.status, output: result.stdout.trim() }, result.stderr).toEqual({
        exitCode: 0,
        output: '{"health":"ok"}',
      })
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })

  it('[AC-EXECUTION-030] preserves actual server output when CI startup fails before tests', async () => {
    const fixture = mkdtempSync(join(tmpdir(), 'ignite-startup-output-'))
    try {
      symlinkSync(join(repositoryRoot, 'node_modules'), join(fixture, 'node_modules'), 'junction')
      write(
        join(fixture, 'server.cjs'),
        "console.log('IGNITE_STARTUP_STDOUT'); console.error('IGNITE_STARTUP_STDERR'); process.exit(1)\n",
      )
      write(
        join(fixture, 'cases/startup.test.js'),
        "const {test} = require('@playwright/test'); test('never starts a browser', () => {})\n",
      )
      const port = await freePort()
      write(
        join(fixture, 'playwright.config.ts'),
        `import base from ${JSON.stringify(join(repositoryRoot, 'playwright.config.ts'))}
export default { ...base, testDir: './cases', outputDir: './output', projects: [{name: 'startup-diagnostic'}],
  reporter: base.reporter.map(([name, options]) => [name.startsWith('./') ? ${JSON.stringify(repositoryRoot)} + '/' + name : name, name === 'html' ? {...options, outputFolder: './report'} : options]),
  webServer: {...base.webServer, command: ${JSON.stringify(`"${process.execPath}" "${join(fixture, 'server.cjs')}"`)}, url: 'http://127.0.0.1:${port}', timeout: 5000}
}\n`,
      )
      const result = spawnSync(
        process.execPath,
        [
          join(repositoryRoot, 'node_modules/@playwright/test/cli.js'),
          'test',
          '--config',
          join(fixture, 'playwright.config.ts'),
        ],
        {
          cwd: fixture,
          env: { ...process.env, CI: 'true', DEBUG: 'pw:webserver' },
          encoding: 'utf8',
          windowsHide: true,
          timeout: 25000,
        },
      )
      expect(result.status).not.toBe(0)
      expect(`${result.stdout}\n${result.stderr}`).toContain('IGNITE_STARTUP_STDOUT')
      expect(`${result.stdout}\n${result.stderr}`).toContain('IGNITE_STARTUP_STDERR')
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  }, 30000)
})
