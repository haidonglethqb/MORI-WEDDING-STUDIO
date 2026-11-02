# Env and Secrets

**Spec:** 17.3 | See `MORI_PROJECT_PLAN.md` section 17.3 (Configuration and secrets management)

## Configuration Strategy

**Zod-validated env schema** (`packages/config`):

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  // Or file-based:
  DATABASE_URL_FILE: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().url(),
  
  // Storage (S3-compatible)
  MINIO_ENDPOINT: z.string().url(),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  
  // Mail
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  
  // Scanning
  CLAMAV_HOST: z.string(),
  CLAMAV_PORT: z.coerce.number(),
  
  // AI (provider)
  AI_PROVIDER: z.enum(['DISABLED', 'FAKE', 'REAL']),
  AI_API_KEY: z.string().optional(),
  
  // Feature flags
  PILOT_MODE: z.coerce.boolean().default(true),
});

export const config = envSchema.parse(process.env);
```

## `*_FILE` Convention

For secrets in Docker:

```yaml
services:
  api:
    environment:
      DATABASE_URL_FILE: /run/secrets/db_url
    secrets:
      db_url:
        file: /path/to/secret
```

At startup:
```typescript
const databaseUrl = process.env.DATABASE_URL_FILE
  ? readFileSync(process.env.DATABASE_URL_FILE, 'utf8').trim()
  : process.env.DATABASE_URL;
```

## Development vs. Production

| Setting | Dev | Prod |
| --- | --- | --- |
| **DATABASE_URL** | postgres://postgres:dev_password@postgres/mori_dev | (secret) |
| **AI_PROVIDER** | FAKE | REAL (or DISABLED) |
| **LOG_LEVEL** | debug | warn |
| **SESSION_SECURE** | false (localhost HTTP) | true (HTTPS only) |
| **CLAMAV_ENABLED** | false | true |

## Secrets Never in Code

[ INV-15] Never commit:
- `.env` files with real credentials
- Database passwords in strings
- API keys
- Private signing keys

Use `.env.example` with placeholder values only.

## Related

- [Compose services](./compose-services.md) — Service env vars
- [Commands and CI](./commands-and-ci.md) — Build process
- [Privacy and retention](../security/privacy-and-retention.md) — Credential redaction

---

**Principle:** Configuration is code; secrets are rotatable; validation is early and explicit.
