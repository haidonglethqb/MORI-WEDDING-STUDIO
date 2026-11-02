# Database Conventions

**Spec:** 10.1 | See `MORI_PROJECT_PLAN.md` section 10.1 (Data model conventions)

## Naming

- **Tables:** `PascalCase`, never `snake_case` (Prisma convention)
- **Columns:** `camelCase`
- **Enums:** `SCREAMING_SNAKE_CASE`
- **Foreign keys:** `<tableName>Id` (e.g., `invitationId`, not `invitation_id`)
- **Timestamps:** `createdAt` (DB: `timestamptz`), `updatedAt`, `expiresAt` (explicit timezone)

## Types

- **Identifiers:** UUID v4 primary keys (not auto-increment)
- **Money:** `BigInt` VND (PostgreSQL `bigint`); never float
- **Timestamps:** `timestamptz`; retain event IANA zone separately
- **Booleans:** For immutable flags; use enums for mutable state
- **JSON:** For structured data; validate server-side with Zod
- **Bytea:** For digests/hashes (not credentials)

## Immutability

Some records must never change:

- **Approval records** — `actorUserId`, `revisionId`, `artifactManifestHash`, `briefFingerprint`, `approvedAt` (append-only) [INV-03]
- **Quote snapshots** — Scope, amount, expiresAt (new quote version for any change) [INV-05]
- **Order snapshots** — Accepted revision/specification (never "latest proof") [INV-04]
- **Invitations revisions** — Content, assets, media digests (new revision for edits) [INV-02]

## Relationships

- Use explicit foreign-key constraints (Prisma: `relation`, `@relation.onDelete`)
- Cascade deletes only for truly dependent records (e.g., revision → media mappings)
- Soft-delete flags for audit-requiring records (mark `deletedAt` rather than drop)
- Audit events: append-only `AuditLog` table with `actorUserId`, `action`, `resourceId`, `changes`

## Related

- [Entities: identity & catalogue](./entities-identity-catalogue.md)
- [Constraints & snapshots](./constraints-and-snapshots.md) — Unique indexes, CHECK constraints

---

**Principle:** Schema is the contract. Never break it without a versioned migration and explicit coordination.
