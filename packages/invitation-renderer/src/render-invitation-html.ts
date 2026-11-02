import { templateFamilies, type TemplateFamily } from './template-keys.js'

export interface InvitationRenderInput {
  template: TemplateFamily
  displayNames: [string, string]
  eventTitle: string
  greeting: string | null
}

const allowed = new Set<string>(templateFamilies)

export function renderInvitationHtml(input: InvitationRenderInput): string {
  if (!allowed.has(input.template)) {
    throw new Error('Unknown invitation template')
  }
  const greeting = input.greeting ? `<p>${escapeHtml(input.greeting)}</p>` : ''
  return `<article class="invitation invitation-${input.template}"><h1>${escapeHtml(input.displayNames[0])} &amp; ${escapeHtml(input.displayNames[1])}</h1><p>${escapeHtml(input.eventTitle)}</p>${greeting}</article>`
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
