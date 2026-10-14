import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'

function localPath(root, target) {
  const local = relative(root, target)
  if (local === '..' || local.startsWith('../') || local.startsWith('..\\') || isAbsolute(local))
    throw new Error('Method source resolves outside the current project')
  return local.replaceAll('\\', '/')
}

function readLocalSource(root, target) {
  localPath(root, target)
  if (!existsSync(target))
    throw new Error(`Required method source is missing: ${localPath(root, target)}`)
  const actual = realpathSync(target)
  return { path: localPath(root, actual), content: readFileSync(actual, 'utf8') }
}

function requiredLinks(content, paragraph, owner) {
  const section = content.split(/^## 固定维护方法\s*$/m)[1]?.split(/^## /m)[0]
  const declaration = section?.match(paragraph)?.[0]
  const links = declaration ? [...declaration.matchAll(/\[[^\]]+\]\(([^)]+\/SKILL\.md)\)/g)] : []
  if (!links.length) throw new Error(`No required method declaration found in ${owner}`)
  return links.map((match) => match[1])
}

export function readDocumentMethods(root, owner) {
  root = realpathSync(root)
  if (typeof owner !== 'string' || !owner.endsWith('.md'))
    throw new Error('skill read --for requires an owning Markdown document')
  const ownerPath = resolve(root, owner)
  const source = readLocalSource(root, ownerPath)
  const writingPath = join(root, 'docs/standards/ai-agents.md')
  const writing = readLocalSource(root, writingPath)
  const paths = [
    ...requiredLinks(
      source.content,
      /涉及本类文档时，先读取以下必需方法：[^\r\n]+/,
      source.path,
    ).map((link) => resolve(dirname(ownerPath), link)),
    ...requiredLinks(writing.content, /涉及文档写作时，必须读取 [^\r\n]+/, writing.path).map(
      (link) => resolve(dirname(writingPath), link),
    ),
  ]
  return [...new Set(paths)].map((path) => {
    const local = localPath(root, path)
    if (!/^\.ai\/(?:pstack\/)?skills\/[a-z0-9]+(?:-[a-z0-9]+)*\/SKILL\.md$/.test(local))
      throw new Error(`Required method link must target a project canonical skill: ${local}`)
    return readLocalSource(root, path)
  })
}

export function readDocumentMethodSteps(root, owner) {
  root = realpathSync(root)
  const source = readLocalSource(root, resolve(root, owner))
  const section = source.content.split(/^## 固定维护方法\s*$/m)[1]?.split(/^## /m)[0]
  const declared = new Set(
    readDocumentMethods(root, owner).map((method) => resolve(root, method.path)),
  )
  const core = section?.split(/^### 条件方法\s*$/m)[0]
  const steps = core
    ?.trim()
    .split(/\n\s*\n/)
    .filter((paragraph) =>
      [...paragraph.matchAll(/\[[^\]]+\]\(([^)]+\/SKILL\.md)\)/g)].every((match) =>
        declared.has(resolve(root, dirname(source.path), match[1])),
      ),
    )
    .join('\n\n')
  if (!steps) return null
  return { path: source.path, content: steps }
}

export function readProjectSkill(root, name, requestedPath = null) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name || ''))
    throw new Error('skill read requires a lowercase kebab-case skill name')
  root = realpathSync(root)
  const candidates = [
    join(root, '.ai/skills', name, 'SKILL.md'),
    join(root, '.ai/pstack/skills', name, 'SKILL.md'),
  ]
  const target = candidates.find((path) => existsSync(path))
  if (!target)
    throw new Error(
      `Required skill ${name} is missing in this project. Restore its canonical SKILL.md before continuing; do not skip the method.`,
    )
  const path = realpathSync(target)
  const local = relative(root, path)
  if (local === '..' || local.startsWith('../') || local.startsWith('..\\') || isAbsolute(local))
    throw new Error(`Required skill ${name} resolves outside the current project`)
  return {
    path: local.replaceAll('\\', '/'),
    content: readFileSync(path, 'utf8'),
    recovered: requestedPath !== null && resolve(root, requestedPath) !== path,
  }
}

export function commandSkillRead(root, options, positionals) {
  if (Object.keys(options).some((key) => !['for', 'path', 'list'].includes(key)))
    throw new Error('Unknown skill read option')
  if (options.list !== undefined && (options.list !== true || options.for === undefined))
    throw new Error('skill read --for <owning-document.md> --list')
  if (options.for !== undefined) {
    if (positionals.length || typeof options.for !== 'string' || options.path !== undefined)
      throw new Error('skill read --for <owning-document.md>')
    const methods = readDocumentMethods(root, options.for)
    const steps = readDocumentMethodSteps(root, options.for)
    if (options.list) {
      const index = {
        scope: 'document-method-index',
        preferred_reader: 'native-file',
        owner: options.for,
        instructions: steps?.content || '',
        tool_options: { max_output_tokens: 0 },
        required: methods.map((method) => {
          const name = method.path.split('/').at(-2)
          return {
            name,
            path: method.path,
            read_command: `node scripts/ignite.mjs skill read ${name}`,
            tool_options: {
              max_output_tokens: Math.max(4096, Buffer.byteLength(method.content, 'utf8') + 1024),
            },
          }
        }),
        next_action:
          'Read canonical paths with the host file tool for the current stage. Reuse complete unchanged bodies from this project still present in context. Use read_command only to recover a failed native read, respecting its output budget. Recover truncated content; this index is not reading evidence.',
      }
      index.tool_options.max_output_tokens = Math.max(
        8192,
        Buffer.byteLength(JSON.stringify(index, null, 2), 'utf8') + 1024,
      )
      process.stdout.write(JSON.stringify(index, null, 2) + '\n')
      return
    }
    process.stdout.write(
      (steps ? [steps, ...methods] : methods)
        .map((method) => `\n<!-- ${method.path} -->\n${method.content}`)
        .join('\n'),
    )
    return
  }
  if (positionals.length !== 1 || (options.path !== undefined && typeof options.path !== 'string'))
    throw new Error('skill read <name> [--path <failed-discovery-path>]')
  const skill = readProjectSkill(root, positionals[0], options.path ?? null)
  if (skill.recovered)
    console.error(`Recovered skill discovery path using current project: ${skill.path}`)
  process.stdout.write(skill.content)
}
