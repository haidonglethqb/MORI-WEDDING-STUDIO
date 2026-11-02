# Media Uploads

**Spec:** 14.1 | See `MORI_PROJECT_PLAN.md` section 14.1 (Media and upload workflow)

## Upload Session

1. Client requests session for gallery / revision artwork / audio.
2. Server validates quota (max file size, total count, total bytes).
3. Return presigned S3 PUT URL (time-limited, one object only).
4. Client uploads directly to S3 (staging prefix).
5. Client notifies backend of completion + file digest.

## Scanning & Quarantine

**ClamAV scanning:**
- Runs in separate container (profile: `scan`)
- Queued as durable BullMQ task
- File digest captured; result recorded in `MediaAsset.scanStatus`
- QUARANTINED files not displayed; owner notified
- [INV-12] Scanresult blocks publication of invitation/revision with quarantined media

**Cleanup:** Staging uploads older than 24 hours auto-deleted; scanned files archived to final object key.

## Derivative Generation

**Processors** (in worker):
- **Image:** `sharp` for JPEG/WebP, resize to web dimensions, strip EXIF
- **Audio:** ffmpeg for normalize, transcode to MP3
- **PDF:** poppler `pdftoppm` in sandboxed container (no network, CPU/mem/PID limits)

Derivatives immutable; generated once, stored with source digest. [INV-03]

**Blocking:** Publication blocked until all required derivatives exist; field-specific error message.

## Access Control

**Private media gateway:**
- Every request verifies media belongs to published revision AND visitor authorized
- [INV-09] No redirect to reusable public object URLs
- Presigned URLs never issued to clients for protected media
- Do not assume immutable template CSS/JS caching works for protected content

**Public catalogue media:**
- Image optimization OK if already public
- Separate cache policy for non-derivative template assets

## Related

- [Threat model](./threat-model.md) — Media/asset theft
- [Entities: media, ops, AI](../database/entities-media-ops-ai.md) — MediaAsset schema
- [Background tasks](../workers/background-tasks.md) — Task ledger for processing

---

**Principle:** All media scanned, processed, and access-controlled before publication. No shortcuts for speed; security gates blocks publication.
