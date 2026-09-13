export type AppEnvironment = 'development' | 'test' | 'production'

export function authRateLimitEnabled(appEnvironment: AppEnvironment) {
  return appEnvironment === 'production'
}
