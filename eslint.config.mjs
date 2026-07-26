import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const moduleInternalPatterns = [
  '@/modules/*/components/**',
  '@/modules/*/hooks/**',
  '@/modules/*/lib/**',
  '**/modules/*/components/**',
  '**/modules/*/hooks/**',
  '**/modules/*/lib/**',
]

const clientSyntaxRestrictions = [
  {
    selector:
      "CallExpression[callee.object.name='globalThis'][callee.property.name='fetch'], CallExpression[callee.object.name='window'][callee.property.name='fetch']",
    message: 'Client business data must use a module Hook backed by the shared Hono client.',
  },
]

const viewSyntaxRestrictions = [
  ...clientSyntaxRestrictions,
  {
    selector: "ImportDeclaration[source.value='hono/client']",
    message: 'Views must use module Hooks instead of constructing or typing an RPC client.',
  },
  {
    selector: "ImportDeclaration[source.value='@/lib/api-client']",
    message: 'Screens and components must access remote business data through their module Hook.',
  },
]

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  prettier,
  {
    files: [
      'src/modules/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/config/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-syntax': ['error', ...clientSyntaxRestrictions],
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Client business data must use a module Hook backed by the shared Hono client.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/server/**', '**/server/**'],
              allowTypeImports: true,
              message: 'Client-safe code may only import server modules with `import type`.',
            },
            {
              group: moduleInternalPatterns,
              allowTypeImports: false,
              message: 'Import another module through its public index instead of its internals.',
            },
            {
              group: ['@prisma/client'],
              allowTypeImports: true,
              message: 'Client-safe code must use module Hooks and the shared API/auth clients.',
            },
            {
              group: ['hono/client'],
              allowTypeImports: true,
              message: 'Create the Hono client only in src/lib/api-client.ts.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/api-client.ts'],
    rules: {
      'no-restricted-imports': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['src/modules/**/components/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...viewSyntaxRestrictions],
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules/**', '@/server/**', '**/modules/**', '**/server/**'],
              allowTypeImports: false,
              message: 'Shared UI primitives must not depend on business or server code.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...viewSyntaxRestrictions],
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'Route pages must compose modules; remote business data belongs in module Hooks.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: moduleInternalPatterns,
              allowTypeImports: false,
              message: 'Import another module through its public index instead of its internals.',
            },
            {
              group: ['@prisma/client', '@/server/database/**'],
              allowTypeImports: true,
              message: 'Route pages must not access the database directly.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/page.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...viewSyntaxRestrictions,
        {
          selector:
            'ImportDeclaration[source.value=/^@\\/server\\//], ImportDeclaration[source.value=/\\/server\\//]',
          message: 'Route pages compose module screens and must not import server implementations.',
        },
      ],
    },
  },
  {
    files: ['src/server/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**', '@/modules/**', '**/app/**', '**/modules/**'],
              allowTypeImports: false,
              message: 'Server infrastructure must not depend on app routes or client modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/server/api/routes/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[source.value='@hono/zod-validator']",
          message:
            'Routes must use the project zValidator wrapper from src/server/api/validator.ts.',
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'coverage/**',
    'out/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
