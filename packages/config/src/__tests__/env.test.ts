import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { resolveFileSecrets, loadEnv } from '../env.js'

const VALID_BASE = {
  APP_ENV: 'development',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  API_INTERNAL_ORIGIN: 'http://localhost:4000',
  PORT: '4000',
}

describe('resolveFileSecrets', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'mori-test-'))
  })

  afterEach(() => {
    // cleanup handled by OS
  })

  it('passes through regular vars unchanged', () => {
    const result = resolveFileSecrets({ FOO: 'bar', BAZ: 'qux' })
    expect(result['FOO']).toBe('bar')
    expect(result['BAZ']).toBe('qux')
  })

  it('resolves *_FILE to file content', () => {
    const secretPath = join(tmpDir, 'db-url.txt')
    writeFileSync(secretPath, '  postgresql://secret:pass@db:5432/prod  \n')
    const result = resolveFileSecrets({ DATABASE_URL_FILE: secretPath })
    expect(result['DATABASE_URL']).toBe('postgresql://secret:pass@db:5432/prod')
  })

  it('file-based value overrides direct env var', () => {
    const secretPath = join(tmpDir, 'db-url.txt')
    writeFileSync(secretPath, 'postgresql://from-file:x@db:5432/prod')
    const result = resolveFileSecrets({
      DATABASE_URL: 'postgresql://direct:x@localhost:5432/db',
      DATABASE_URL_FILE: secretPath,
    })
    expect(result['DATABASE_URL']).toBe('postgresql://from-file:x@db:5432/prod')
  })

  it('ignores an empty *_FILE value and keeps the direct variable', () => {
    const result = resolveFileSecrets({
      DATABASE_URL: 'postgresql://direct:x@localhost:5432/db',
      DATABASE_URL_FILE: '',
    })
    expect(result['DATABASE_URL']).toBe('postgresql://direct:x@localhost:5432/db')
  })

  it('throws when file does not exist', () => {
    expect(() =>
      resolveFileSecrets({ DATABASE_URL_FILE: '/nonexistent/path/secret.txt' }),
    ).toThrow('Failed to read secret file')
  })
})

describe('loadEnv', () => {
  it('accepts valid environment', () => {
    const env = loadEnv(VALID_BASE)
    expect(env.APP_ENV).toBe('development')
    expect(env.PORT).toBe(4000)
    expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db')
  })

  it('defaults APP_ENV to development', () => {
    const { APP_ENV: _dropped, ...rest } = VALID_BASE
    const env = loadEnv(rest)
    expect(env.APP_ENV).toBe('development')
  })

  it('defaults PORT to 4000', () => {
    const { PORT: _dropped, ...rest } = VALID_BASE
    const env = loadEnv(rest)
    expect(env.PORT).toBe(4000)
  })

  it('throws when DATABASE_URL is missing', () => {
    const { DATABASE_URL: _dropped, ...rest } = VALID_BASE
    expect(() => loadEnv(rest)).toThrow('Environment validation failed')
  })

  it('throws when DATABASE_URL is not a URL', () => {
    expect(() => loadEnv({ ...VALID_BASE, DATABASE_URL: 'not-a-url' })).toThrow(
      'Environment validation failed',
    )
  })

  it('throws on unknown APP_ENV value', () => {
    expect(() => loadEnv({ ...VALID_BASE, APP_ENV: 'production-like' })).toThrow(
      'Environment validation failed',
    )
  })
})
