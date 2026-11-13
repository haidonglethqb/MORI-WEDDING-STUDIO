/**
 * Generate OpenAPI 3.0 document from @mori/contracts Zod schemas.
 *
 * Dynamic-imports @mori/contracts AFTER calling extendZodWithOpenApi so that
 * the schema objects are created with the extended Zod prototype.
 *
 * Usage:
 *   node --import tsx/esm scripts/generate-openapi.ts --write   # write file
 *   node --import tsx/esm scripts/generate-openapi.ts --check   # drift check
 */
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Extend Zod BEFORE any schema objects are instantiated
extendZodWithOpenApi(z)

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '../../../docs/api/openapi.json')

// Dynamic import so schemas are created AFTER extendZodWithOpenApi runs
const contracts = await import('@mori/contracts')
const {
  CreateSpikeCheckRequestSchema,
  SpikeCheckResponseSchema,
  ProblemDetailsSchema,
  EstimateRequestSchema,
  EstimateResponseSchema,
} = contracts

// ─── Registry ────────────────────────────────────────────────────────────────

const registry = new OpenAPIRegistry()

registry.register('CreateSpikeCheckRequest', CreateSpikeCheckRequestSchema)
registry.register('SpikeCheckResponse', SpikeCheckResponseSchema)
registry.register('ProblemDetails', ProblemDetailsSchema)

// ─── Paths ────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/api/v1/health/live',
  summary: 'Liveness probe',
  description: 'Returns 200 when the process is running. No dependency checks.',
  tags: ['Health'],
  responses: {
    200: {
      description: 'Process is alive',
      content: {
        'application/json': {
          schema: z.object({ status: z.literal('ok') }),
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/health/ready',
  summary: 'Readiness probe',
  description: 'Returns 200 when all required dependencies (DB) are reachable.',
  tags: ['Health'],
  responses: {
    200: {
      description: 'All required dependencies are reachable',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('ok'),
            checks: z.record(z.string(), z.string()),
          }),
        },
      },
    },
    503: {
      description: 'One or more required dependencies are unavailable',
      content: {
        'application/problem+json': { schema: ProblemDetailsSchema },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/spike-checks',
  summary: 'Create a spike check record',
  description: 'Validates the request body with Zod and persists to PostgreSQL.',
  tags: ['Spike'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': { schema: CreateSpikeCheckRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Record created',
      content: { 'application/json': { schema: SpikeCheckResponseSchema } },
    },
    422: {
      description: 'Validation error — unknown keys or constraint violations',
      content: { 'application/problem+json': { schema: ProblemDetailsSchema } },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/pricing/estimate',
  summary: 'Indicative price estimate',
  description: 'Server calculates the amount. The client cannot supply a total.',
  tags: ['Pricing'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: EstimateRequestSchema } },
    },
  },
  responses: {
    200: {
      description: 'Estimate or quote-required result',
      content: { 'application/json': { schema: EstimateResponseSchema } },
    },
  },
})

// ─── Generate ─────────────────────────────────────────────────────────────────

const generator = new OpenApiGeneratorV3(registry.definitions)
const document = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'MORI Wedding Studio API',
    version: '0.0.0',
    description:
      'Internal API — auto-generated from Zod contracts. Do not edit by hand.',
  },
  servers: [{ url: '/api/v1', description: 'Current environment' }],
})

const json = JSON.stringify(document, null, 2) + '\n'

// ─── Write / Check ────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const mode = args.includes('--check') ? 'check' : 'write'

if (mode === 'write') {
  writeFileSync(OUTPUT_PATH, json, 'utf-8')
  console.log(`✓ OpenAPI document written to ${OUTPUT_PATH}`)
} else {
  if (!existsSync(OUTPUT_PATH)) {
    console.error(
      `✗ Drift check failed: ${OUTPUT_PATH} does not exist. Run pnpm api:generate first.`,
    )
    process.exit(1)
  }
  const existing = readFileSync(OUTPUT_PATH, 'utf-8').replaceAll('\r\n', '\n')
  if (existing !== json) {
    console.error(
      '✗ Drift check failed: docs/api/openapi.json is stale. Run pnpm api:generate.',
    )
    process.exit(1)
  }
  console.log('✓ OpenAPI document is up to date (no drift)')
}
