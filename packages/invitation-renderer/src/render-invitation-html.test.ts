import { describe, expect, it } from 'vitest'
import { renderInvitationHtml } from './render-invitation-html.js'

describe('renderInvitationHtml', () => {
  it('renders names as text and refuses an unknown template', () => {
    const html = renderInvitationHtml({
      template: 'editorial-ivory',
      displayNames: ['<script>alert(1)</script>', 'Mai & An'],
      eventTitle: 'Lễ "cưới"',
      greeting: null,
    })
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('Mai &amp; An')
    expect(html).toContain('Lễ &quot;cưới&quot;')
    expect(html).not.toContain('<script>')
    expect(html).toContain('invitation-editorial-ivory')
    expect(() =>
      renderInvitationHtml({
        template: 'custom' as 'editorial-ivory',
        displayNames: ['A', 'B'],
        eventTitle: 'Lễ',
        greeting: null,
      }),
    ).toThrow(/Unknown invitation template/)
  })
})
