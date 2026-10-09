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
