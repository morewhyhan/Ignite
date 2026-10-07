import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse, stringify } from 'yaml'

const platforms = ['.agents/skills', '.claude/skills', '.cursor/skills', '.opencode/skills']
const marker = 'This file is discovery metadata and a bridge, not a second rules source.'

export function synchronize(root, write = false) {
  root = resolve(root)
  const methods = join(root, '.ai/pstack')
  const updates = []
  const skills = []
  const names = new Set()
  function collect(base) {
    if (!existsSync(base)) return
    for (const item of readdirSync(base, { withFileTypes: true })) {
      if (!item.isDirectory()) continue
      const path = join(base, item.name, 'SKILL.md')
      if (!existsSync(path)) continue
      const content = readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
      const frontmatter = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
      if (!frontmatter) throw new Error(`Missing skill metadata: ${path}`)
      const metadata = parse(frontmatter[1])
      if (metadata.name !== item.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name)) {
        throw new Error(`Skill name must match its directory: ${path}`)
      }
      if (typeof metadata.description !== 'string' || !metadata.description.trim()) {
        throw new Error(`Missing skill description: ${path}`)
      }
      if (names.has(metadata.name)) throw new Error(`Duplicate canonical skill: ${metadata.name}`)
      names.add(metadata.name)
      skills.push({
        path,
        name: metadata.name,
        description: metadata.description.replace(/\s+/g, ' ').trim(),
      })
    }
  }
  collect(join(methods, 'skills'))
  collect(join(methods, 'automations/benny/skills'))
  collect(join(root, '.ai/skills'))
  skills.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  function schedule(path, content, protectedBridge = false) {
    const existing = existsSync(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : null
    if (existing === content) return
    if (protectedBridge && existing !== null && !existing.includes(marker)) {
      throw new Error(`Refusing to overwrite a non-generated skill: ${path}`)
    }
    updates.push({ path, content })
  }
  const slash = (path) => path.split(sep).join('/')
  for (const skill of skills) {
    for (const platform of platforms) {
      const path = join(root, platform, skill.name, 'SKILL.md')
      const adapter = slash(relative(dirname(path), join(methods, 'ADAPTER.md')))
      const canonical = slash(relative(dirname(path), skill.path))
      const metadata = stringify({ name: skill.name, description: skill.description }).trimEnd()
      schedule(
        path,
        `---\n${metadata}\n---\n\n# ${skill.name}\n\nRead the [Ignite adapter](${adapter}), then the [canonical skill](${canonical}) and only its task-relevant references. ${marker} Use the current project authorization and host capabilities.\n`,
        true,
      )
    }
  }
  const rows = skills.map(
    (skill) =>
      `| [${skill.name}](${slash(relative(methods, skill.path))}) | ${skill.description.replace(/\|/g, '\\|')} |`,
  )
  schedule(
    join(methods, 'CATALOG.md'),
    '# pstack 技能目录\n\n按任务读取，正文只维护在真源。先读 [适配说明](ADAPTER.md)。非简单工程任务入口为 [poteto-mode](skills/poteto-mode/SKILL.md)。\n\n| 技能 | 用途 / 调用条件 |\n| --- | --- |\n' +
      rows.join('\n') +
      '\n',
  )
  const manifestPath = join(methods, 'sources.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  for (const file of manifest.files) {
    const target = resolve(methods, file.path)
    if (relative(methods, target).startsWith('..') || target === methods)
      throw new Error(`Invalid source path: ${file.path}`)
    const bytes = readFileSync(target)
    const hash = createHash('sha256').update(bytes).digest('hex')
    file.local_sha256 = hash
    file.adapted = hash !== file.upstream_sha256
  }
  schedule(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  if (write) {
    for (const update of updates) {
      mkdirSync(dirname(update.path), { recursive: true })
      writeFileSync(update.path, update.content)
    }
  }
  return updates.map((update) => slash(relative(root, update.path)))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.some((arg) => arg !== '--write'))
      throw new Error('Usage: node scripts/pstack-sync.mjs [--write]')
    const write = args.includes('--write')
    const paths = synchronize(resolve(import.meta.dirname, '..'), write)
    console.log(
      paths.length
        ? `${write ? 'Updated' : 'Out of date'}: ${paths.length} generated files`
        : 'Skill bridges, catalog and source hashes are current',
    )
    if (!write && paths.length) process.exitCode = 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
