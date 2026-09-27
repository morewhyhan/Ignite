import { randomBytes } from 'node:crypto'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'

function ensureDirectory(path, root, createdDirectories) {
  if (existsSync(path)) return
  const parent = dirname(path)
  if (parent !== path && parent !== root) ensureDirectory(parent, root, createdDirectories)
  mkdirSync(path)
  createdDirectories.push(path)
}

function temporarySibling(path, label) {
  return joinPath(
    dirname(path),
    `.${path.split(sep).at(-1)}.ignite-${label}-${randomBytes(6).toString('hex')}`,
  )
}

function joinPath(directory, name) {
  return resolve(directory, name)
}

function removeCreatedDirectories(paths) {
  for (const path of [...paths].reverse()) {
    try {
      rmdirSync(path)
    } catch {
      // A directory that is no longer empty belongs to a committed artifact.
    }
  }
}

/** Stage and promote one generated artifact set; restore all targets if promotion fails. */
export function writeFileSetAtomically(root, entries) {
  const absoluteRoot = resolve(root)
  const destinations = new Set()
  const states = entries.map(([path, content]) => {
    if (isAbsolute(path)) throw new Error(`Scaffold path must be relative: ${path}`)
    const target = resolve(absoluteRoot, path)
    const fromRoot = relative(absoluteRoot, target)
    if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot))
      throw new Error(`Scaffold path escapes repository root: ${path}`)
    if (destinations.has(target)) throw new Error(`Duplicate scaffold target: ${path}`)
    destinations.add(target)

    let original = null
    if (existsSync(target)) {
      if (!lstatSync(target).isFile()) throw new Error(`Scaffold target is not a file: ${path}`)
      original = readFileSync(target)
    }

    return {
      target,
      content,
      original,
      staged: temporarySibling(target, 'stage'),
      backup: original === null ? null : temporarySibling(target, 'backup'),
      promoted: false,
      backedUp: false,
    }
  })
  const createdDirectories = []

  try {
    for (const state of states) {
      ensureDirectory(dirname(state.target), absoluteRoot, createdDirectories)
      writeFileSync(state.staged, state.content, 'utf8')
    }
    for (const state of states) {
      if (state.original !== null) {
        renameSync(state.target, state.backup)
        state.backedUp = true
      }
      renameSync(state.staged, state.target)
      state.promoted = true
    }
  } catch (error) {
    const rollbackErrors = []
    for (const state of [...states].reverse()) {
      try {
        if (state.promoted && existsSync(state.target)) rmSync(state.target, { force: true })
        if (state.backedUp && state.backup && existsSync(state.backup)) {
          try {
            renameSync(state.backup, state.target)
          } catch {
            writeFileSync(state.target, state.original)
            rmSync(state.backup, { force: true })
          }
        } else if (state.original === null && existsSync(state.target)) {
          rmSync(state.target, { force: true })
        }
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
      try {
        rmSync(state.staged, { force: true })
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
    }
    removeCreatedDirectories(createdDirectories)
    if (rollbackErrors.length)
      throw new AggregateError(
        [error, ...rollbackErrors],
        'scaffold failed and rollback was incomplete',
      )
    throw error
  }

  for (const state of states) {
    if (state.backup) rmSync(state.backup, { force: true })
  }
  return states.map((state) => state.target)
}
