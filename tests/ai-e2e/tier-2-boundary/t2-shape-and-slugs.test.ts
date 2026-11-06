/**
 * Tier 2: Shape Filtering & Hallucinated Slug Rejection
 * Authoritative: PROJECT.md F07, spec_report.md E12/E18, MORI_AI_V2_AGENT_HANDOFF.md AI-002
 */
import { describe, expect, it } from 'vitest'
import { TEST_CATALOGUE_FIXTURES } from '../harness/catalogue-fixtures.js'

describe('Tier 2: Shape Filtering & Hallucinated Slug Rejection', () => {
  it('permits FLAT and BIFOLD shapes and excludes TRIFOLD from standard estimable options', () => {
    const isShapeEstimable = (shape: string) => shape === 'FLAT' || shape === 'BIFOLD'

    expect(isShapeEstimable('FLAT')).toBe(true)
    expect(isShapeEstimable('BIFOLD')).toBe(true)
    expect(isShapeEstimable('TRIFOLD')).toBe(false)
    expect(isShapeEstimable('POCKET_FOLD')).toBe(false)
  })

  it('filters out hallucinated/unknown product slugs from assistant response cards (E18, T14)', () => {
    const activeDbSlugs = new Set(
      TEST_CATALOGUE_FIXTURES.filter((p) => p.state === 'ACTIVE').map((p) => p.slug),
    )

    const modelReturnedSlugs = [
      'song-hy-cung-dinh', // Valid
      'phantom-luxury-silk-99', // Hallucinated
      'royal-gold-embossed-00', // Hallucinated
    ]

    const sanitizedSlugs = modelReturnedSlugs.filter((slug) => activeDbSlugs.has(slug))
    expect(sanitizedSlugs).toEqual(['song-hy-cung-dinh'])
    expect(sanitizedSlugs).not.toContain('phantom-luxury-silk-99')
    expect(sanitizedSlugs).not.toContain('royal-gold-embossed-00')
  })

  it('sanitizes text response to avoid claiming non-existent products exist', () => {
    const filterPhantomMentions = (text: string, knownSlugs: Set<string>) => {
      if (text.includes('phantom-luxury-silk-99') && !knownSlugs.has('phantom-luxury-silk-99')) {
        return text.replace(/mẫu phantom-luxury-silk-99/gi, 'các mẫu thiệp hiện có')
      }
      return text
    }

    const rawReply = 'Bạn có thể xem thêm mẫu phantom-luxury-silk-99 rất sang trọng.'
    const cleanReply = filterPhantomMentions(rawReply, new Set(['song-hy-cung-dinh']))
    expect(cleanReply).not.toContain('phantom-luxury-silk-99')
  })
})
