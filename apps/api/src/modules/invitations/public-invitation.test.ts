import { describe, expect, it } from 'vitest'
import { InvitationContentSchema } from '@mori/contracts'
import { toPublicInvitation } from './public-invitation.js'

describe('public invitation DTO & schema', () => {
  it('accepts minimal legacy payload and rich template payload', () => {
    const minimal = InvitationContentSchema.parse({
      schemaVersion: 1,
      displayNames: ['Mai', 'An'],
      eventTitle: 'Lễ cưới',
    })
    expect(minimal.displayNames).toEqual(['Mai', 'An'])

    const rich = toPublicInvitation('mai-an', {
      schemaVersion: 1,
      displayNames: ['Quốc Bảo', 'Minh Anh'],
      coupleRoles: ['Tân Lang', 'Tân Nương'],
      eventTitle: 'Lễ Thành Hôn',
      greeting: 'Trân trọng kính mời',
      templateId: 'editorial-vogue',
      families: {
        groomParents: 'Ông Bà Long Mai',
        groomOrigin: 'Hà Nội',
        brideParents: 'Ông Bà Nam Phượng',
        brideOrigin: 'TP.HCM',
      },
      lunarDate: 'Ngày 12 tháng 11 năm Bính Ngọ',
      venueName: 'White Palace',
      venueAddress: '194 Hoàng Văn Thụ',
      mapUrl: 'https://maps.google.com/?q=White+Palace',
      scheduleItems: [{ time: '18:00', label: 'Đón khách' }],
      photos: {
        heroUrl: '/images/landing/hero-ivory-suite.jpg',
        galleryUrls: ['data:image/jpeg;base64,/9j/4AAQSkZJRg=='],
        storyCaption: 'Bốn mùa bên nhau',
      },
      templateConfig: {
        paletteId: 'champagne-atelier',
        frameStyle: 'arch-dome',
        motifStyle: 'wax-seal',
        showFamilies: true,
        showLunarDate: true,
        showGallery: true,
      },
    })

    expect(rich.slug).toBe('mai-an')
    expect(rich.templateId).toBe('editorial-vogue')
    expect(rich.families?.groomParents).toBe('Ông Bà Long Mai')
    expect(rich.photos?.heroUrl).toBe('/images/landing/hero-ivory-suite.jpg')
    expect(rich.templateConfig?.showFamilies).toBe(true)
  })

  it('rejects unsafe javascript URLs in photos and mapUrl', () => {
    expect(() =>
      InvitationContentSchema.parse({
        schemaVersion: 1,
        displayNames: ['A', 'B'],
        eventTitle: 'Cưới',
        mapUrl: 'javascript:alert(1)',
      }),
    ).toThrow()

    expect(() =>
      InvitationContentSchema.parse({
        schemaVersion: 1,
        displayNames: ['A', 'B'],
        eventTitle: 'Cưới',
        photos: { heroUrl: 'javascript:alert(1)' },
      }),
    ).toThrow()
  })
})
