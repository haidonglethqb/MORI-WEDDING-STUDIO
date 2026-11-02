/**
 * Zod-validated environment loader with *_FILE secret convention.
 *
 * For each `FOO_FILE` env var, the loader reads the file at that path
 * and uses its trimmed content as the value of `FOO`. This allows
 * Docker secrets mounted as files to be consumed without custom entrypoints.
 */
import { readFileSync } from 'node:fs'
import { z } from 'zod'

// ─── File-secret resolution ───────────────────────────────────────────────────

/**
 * Given a record of raw env vars, resolve any `*_FILE` entries by reading
 * the referenced file. The file-based value takes precedence over the
 * direct env var of the same name.
 */
export function resolveFileSecrets(raw: NodeJS.ProcessEnv): Record<string, string> {
  const resolved: Record<string, string> = {}

  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue
    resolved[key] = value
  }

  // Resolve *_FILE convention. An empty value means "not set" (Compose
  // interpolation of an unset variable), so the direct env var is kept.
  for (const [key, value] of Object.entries(raw)) {
    if (!key.endsWith('_FILE') || !value) continue
    const targetKey = key.slice(0, -5) // strip _FILE suffix
    try {
      const content = readFileSync(value, 'utf-8').trim()
      resolved[targetKey] = content
    } catch (err) {
      throw new Error(
        `Failed to read secret file for ${targetKey} (${key}=${value}): ${String(err)}`,
      )
    }
  }

  return resolved
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const AppEnvSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  DATABASE_URL: z.string().url().min(1),
  API_INTERNAL_ORIGIN: z.string().url().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
})

export type AppEnv = z.infer<typeof AppEnvSchema>

// ─── Loader ───────────────────────────────────────────────────────────────────

/**
 * Parse and validate the current process environment.
 * Resolves *_FILE secrets before validation.
 *
 * Throws a descriptive ZodError if any required variable is missing.
 */
export function loadEnv(raw: NodeJS.ProcessEnv = process.env): AppEnv {
  const resolved = resolveFileSecrets(raw)
  const result = AppEnvSchema.safeParse(resolved)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Environment validation failed:\n${issues}`)
  }
  return result.data
}
