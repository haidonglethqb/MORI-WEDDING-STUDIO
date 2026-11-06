import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    root: resolve(import.meta.dirname, '../..'),
    include: ['tests/adversarial/**/*.test.ts'],
    passWithNoTests: true,
  },
})
