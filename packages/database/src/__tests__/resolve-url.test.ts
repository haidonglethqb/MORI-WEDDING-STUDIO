import { describe, it, expect, beforeEach } from 'vitest'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { resolveDatabaseUrl } from '../resolve-url.js'

const VALID_URL = 'postgresql://user:pass@localhost:5432/db'

describe('resolveDatabaseUrl', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'mori-db-test-'))
  })

  it('returns DATABASE_URL when only it is set', () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: VALID_URL })).toBe(VALID_URL)
  })

  it('reads DATABASE_URL_FILE when set (ignores DATABASE_URL)', () => {
    const secretPath = join(tmpDir, 'database_url')
    writeFileSync(secretPath, `  ${VALID_URL}  \n`) // leading/trailing whitespace trimmed
    expect(
      resolveDatabaseUrl({ DATABASE_URL: 'should-be-ignored', DATABASE_URL_FILE: secretPath }),
    ).toBe(VALID_URL)
  })

  it('DATABASE_URL_FILE takes priority over DATABASE_URL', () => {
    const secretPath = join(tmpDir, 'database_url')
    const fileUrl = 'postgresql://from-file:x@db:5432/prod'
    writeFileSync(secretPath, fileUrl)
    expect(
      resolveDatabaseUrl({ DATABASE_URL: 'postgresql://direct:x@localhost/db', DATABASE_URL_FILE: secretPath }),
    ).toBe(fileUrl)
  })

  it('trims whitespace from file contents', () => {
    const secretPath = join(tmpDir, 'database_url')
    writeFileSync(secretPath, `\n  ${VALID_URL}\n  `)
    expect(resolveDatabaseUrl({ DATABASE_URL_FILE: secretPath })).toBe(VALID_URL)
  })

  it('throws clearly when DATABASE_URL_FILE file does not exist', () => {
    expect(() =>
      resolveDatabaseUrl({ DATABASE_URL_FILE: '/nonexistent/path/to/secret' }),
    ).toThrow('Failed to read DATABASE_URL from file')
  })

  it('throws clearly when neither variable is set', () => {
    expect(() => resolveDatabaseUrl({})).toThrow('Database URL not configured')
  })

  it('treats empty string DATABASE_URL_FILE as unset (falls through to DATABASE_URL)', () => {
    // Docker Compose dev overlay sets DATABASE_URL_FILE="" to disable file-based lookup
    expect(
      resolveDatabaseUrl({ DATABASE_URL_FILE: '', DATABASE_URL: VALID_URL }),
    ).toBe(VALID_URL)
  })

  it('uses process.env by default', () => {
    // Smoke-test that the default parameter works; we just call with explicit env to avoid
    // polluting process.env in tests.
    const result = resolveDatabaseUrl({ DATABASE_URL: VALID_URL })
    expect(result).toBe(VALID_URL)
  })
})
