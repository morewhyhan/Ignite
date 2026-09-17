export const developmentSecret = 'ignite-development-only-secret-change-before-deploying'

/** @param {{ NODE_ENV?: string, APP_ENV?: string, APP_URL?: string, DATABASE_URL?: string, BETTER_AUTH_SECRET?: string }} value */
export function environmentPolicyIssues(value) {
  const issues = []
  if (value.BETTER_AUTH_SECRET && value.BETTER_AUTH_SECRET.length < 32) {
    issues.push({
      path: 'BETTER_AUTH_SECRET',
      message: 'BETTER_AUTH_SECRET must contain at least 32 characters.',
    })
  }
  let appUrl
  if (value.APP_URL) {
    try {
      appUrl = new URL(value.APP_URL)
      if (value.APP_URL !== appUrl.origin) {
        issues.push({
          path: 'APP_URL',
          message: 'APP_URL must be an origin only, for example https://app.example.com.',
        })
      }
    } catch {
      issues.push({ path: 'APP_URL', message: 'APP_URL must be a valid URL.' })
    }
  }

  if (value.APP_ENV !== 'production') return issues
  if (value.NODE_ENV && value.NODE_ENV !== 'production') {
    issues.push({
      path: 'APP_ENV',
      message:
        'APP_ENV=production requires NODE_ENV=production. Development and test APP_ENV values may use either Next.js build mode.',
    })
  }
  if (appUrl) {
    const hostname = appUrl.hostname.toLowerCase()
    if (appUrl.protocol !== 'https:') {
      issues.push({ path: 'APP_URL', message: 'Production APP_URL must use HTTPS.' })
    }
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      /^127(?:\.\d{1,3}){3}$/.test(hostname) ||
      hostname === '[::1]' ||
      hostname === '0.0.0.0'
    ) {
      issues.push({
        path: 'APP_URL',
        message: 'Production APP_URL must use the deployed public origin.',
      })
    }
  }
  if (value.BETTER_AUTH_SECRET === developmentSecret) {
    issues.push({
      path: 'BETTER_AUTH_SECRET',
      message: 'Production must not use the development-only secret.',
    })
  }
  if (value.DATABASE_URL?.startsWith('file:')) {
    issues.push({
      path: 'DATABASE_URL',
      message:
        'The bundled SQLite setup is local-only. Migrate the Prisma provider, adapter, and migrations before production.',
    })
  }
  return issues
}
