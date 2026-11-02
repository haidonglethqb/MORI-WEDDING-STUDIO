# ADR-16: Shared Zod Contracts in packages/contracts with Custom Validation Pipe

**Context:** API contracts must be consistent between OpenAPI documentation and runtime validation. `nestjs-zod` officially supports NestJS up to v11; NestJS 12 is unsupported.

**Decision:** Store Zod schemas in `packages/contracts` shared across NestJS and Next.js. NestJS validation uses a custom `ZodValidationPipe` in `apps/api/src/common/zod-validation.pipe.ts` (not nestjs-zod). OpenAPI is generated from Zod via `@asteasolutions/zod-to-openapi@9.1.0` using `scripts/generate-openapi.ts` (dynamic import to avoid ESM static-link issues with `extendZodWithOpenApi`).

**Rejected alternatives:**
- nestjs-zod: incompatible with NestJS 12 (peer dep: `^10||^11`)
- Manual OpenAPI: duplicates schema and risks drift

**Consequences:**
- Single source of contract truth (Zod)
- Custom pipe is maintainable and under our control
- OpenAPI generated, never hand-edited (drift-checked in CI)
- Need to monitor nestjs-zod for NestJS 12 support

**Status:** Accepted  
**Date:** 2026-10-31  
**See:** Spec 9.6, handoff-brief section 2 (Zod + OpenAPI), P00 version spike section 2.3 (nestjs-zod incompatibility), section 2.4 (dynamic import workaround)
