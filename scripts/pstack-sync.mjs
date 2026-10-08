import { createHash } from 'node:crypto'
import {
  existsSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  unlinkSync,
  rmdirSync,
} from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse, stringify } from 'yaml'
import { format, resolveConfig } from 'prettier'

const platforms = ['.agents/skills', '.claude/skills']
const retiredPlatforms = ['.cursor/skills', '.opencode/skills']
const marker = 'This file is discovery metadata and a bridge, not a second rules source.'

export async function synchronize(root, write = false) {
  root = resolve(root)
  const formatting = (await resolveConfig(join(root, 'package.json'))) || {}
  const methods = join(root, '.ai/pstack')
  const updates = []
  const removals = []
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
  collect(join(root, '.ai/skills'))
  skills.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  for (const platform of [...platforms, ...retiredPlatforms]) {
    const base = join(root, platform)
    if (!existsSync(base)) continue
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const path = join(base, entry.name, 'SKILL.md')
      if (!existsSync(path)) continue
      if (platforms.includes(platform) && names.has(entry.name)) continue
      if (readFileSync(path, 'utf8').includes(marker)) removals.push(path)
    }
  }
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
      const canonical = slash(relative(dirname(path), skill.path))
      const metadata = stringify({ name: skill.name, description: skill.description }).trimEnd()
      schedule(
        path,
        await format(
          `---\n${metadata}\n---\n\n# ${skill.name}\n\nRead the [canonical skill](${canonical}) and only its task-relevant references. ${marker} Use the current project authorization and host capabilities.\n`,
          { ...formatting, parser: 'markdown' },
        ),
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
    '# pstack 技能目录\n\n按任务读取，正文只维护在真源。需要完整工程流程时，用户启用 [poteto-mode](skills/poteto-mode/SKILL.md)，由 AI 选择流程与技能。项目文档位置和工具使用要求直接写在对应方法中。\n\n| 技能 | 用途 / 调用条件 |\n| --- | --- |\n' +
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
    for (const path of removals) {
      unlinkSync(path)
      if (readdirSync(dirname(path)).length === 0) rmdirSync(dirname(path))
    }
    for (const platform of retiredPlatforms) {
      const base = join(root, platform)
      if (existsSync(base) && readdirSync(base).length === 0) rmdirSync(base)
    }
  }
  return [...updates.map((update) => update.path), ...removals].map((path) =>
    slash(relative(root, path)),
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.some((arg) => arg !== '--write'))
      throw new Error('Usage: node scripts/pstack-sync.mjs [--write]')
    const write = args.includes('--write')
    const paths = await synchronize(resolve(import.meta.dirname, '..'), write)
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
