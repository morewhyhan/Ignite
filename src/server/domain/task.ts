export type DomainErrorCode = 'title_invalid' | 'not_found' | 'invalid_update'

export class DomainError extends Error {
  readonly code: DomainErrorCode

  constructor(code: DomainErrorCode) {
    super(code)
    this.name = 'DomainError'
    this.code = code
  }
}

const TITLE_MIN = 1
const TITLE_MAX = 200

export function normalizeTitle(raw: string): string {
  const title = raw.trim()
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) throw new DomainError('title_invalid')
  return title
}

export function assertOwnership(task: { userId: string } | null, userId: string): void {
  if (!task || task.userId !== userId) throw new DomainError('not_found')
}

export function assertUpdatePayload(patch: { title?: string; completed?: boolean }): void {
  if (patch.title === undefined && patch.completed === undefined)
    throw new DomainError('invalid_update')
}
