import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'

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
