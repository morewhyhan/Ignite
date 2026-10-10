import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default {
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
}
