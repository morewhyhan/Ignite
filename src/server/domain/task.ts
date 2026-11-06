export type DomainErrorCode = 'title_invalid' | 'not_found' | 'invalid_update' | 'not_implemented'

export class DomainError extends Error {
  readonly code: DomainErrorCode

  constructor(code: DomainErrorCode) {
    super(code)
    this.name = 'DomainError'
    this.code = code
  }
}

export function normalizeTitle(_raw: string): string {
  throw new DomainError('not_implemented')
}

export function assertOwnership(_task: { userId: string } | null, _userId: string): void {
  throw new DomainError('not_implemented')
}

export function assertUpdatePayload(_patch: { title?: string; completed?: boolean }): void {
  throw new DomainError('not_implemented')
}
