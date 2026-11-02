import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/src/generated/**',
      'docs/api/openapi.json',
      'eslint.config.mjs',
      // Agent/skill files - not application code
      '.agents/**',
      '.claude/**',
      '.cursor/**',
      // vitest and prisma configs are not in tsconfig - exclude from typed lint
      '**/vitest.config.ts',
      '**/prisma.config.ts',
    ],
  },
  // Typed lint for main source files
  {
    files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}', 'apps/*/scripts/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked, prettierConfig],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  // Plain lint for config files (no type info needed)
  {
    files: ['**/*.ts', '**/*.mts'],
    ignores: [
      'apps/*/src/**/*.{ts,tsx}',
      'packages/*/src/**/*.{ts,tsx}',
      'apps/*/scripts/**/*.ts',
    ],
    extends: [...tseslint.configs.recommended, prettierConfig],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
