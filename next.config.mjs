import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default {
  distDir: process.env.E2E_SERVER_MODE === 'development' ? '.next/e2e' : '.next',
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
}
