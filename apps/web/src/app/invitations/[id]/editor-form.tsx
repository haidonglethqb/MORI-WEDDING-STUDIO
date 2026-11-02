'use client'

import { useState } from 'react'
import { RevokeGuests } from './revoke-guests'
import { ReopenRsvp } from './reopen-rsvp'
import { RetireEvent } from './retire-event'
import { RotateHandle } from './rotate-handle'
import { SwitchRsvpMode } from './switch-rsvp-mode'

export interface EditorDraft {
  invitationId: string
  version: number
  slug: string
  displayNames: [string, string]
  eventTitle: string
  greeting: string
  published: boolean
  rsvpMode: 'OFF' | 'OPEN' | 'GUEST_LIST'
}

export function EditorForm({ draft }: { draft: EditorDraft }) {
  const [firstName, setFirstName] = useState(draft.displayNames[0])
  const [secondName, setSecondName] = useState(draft.displayNames[1])
  const [eventTitle, setEventTitle] = useState(draft.eventTitle)
  const [greeting, setGreeting] = useState(draft.greeting)
  const [version, setVersion] = useState(draft.version)
  const [slug, setSlug] = useState(draft.slug)
  const [published, setPublished] = useState(draft.published)
  const [rsvpMode, setRsvpMode] = useState(draft.rsvpMode)
  const [status, setStatus] = useState(draft.published ? 'Đã xuất bản' : 'Chưa lưu')

  async function save() {
    setStatus('Đang lưu')
    const content: {
      schemaVersion: 1
      displayNames: [string, string]
      eventTitle: string
      greeting?: string
    } = {
      schemaVersion: 1,
      displayNames: [firstName.trim(), secondName.trim()],
      eventTitle: eventTitle.trim(),
    }
    if (greeting.trim()) content.greeting = greeting.trim()
    const response = await fetch(`/invitations/${draft.invitationId}/save`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expectedVersion: version, content }),
    })
    if (response.status === 409) {
      setStatus('Bản nháp đã đổi. Tải lại trước khi lưu.')
      return
    }
    if (!response.ok) {
      setStatus('Chưa lưu được')
      return
    }
    const saved = (await response.json()) as EditorDraft
    setVersion(saved.version)
    setPublished(saved.published)
    setStatus(`Đã lưu lúc phiên bản ${saved.version}`)
  }

  async function publish() {
    setStatus('Đang xuất bản')
    const response = await fetch(`/invitations/${draft.invitationId}/publish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expectedVersion: version }),
    })
    if (response.status === 409) {
      setStatus('Bản nháp đã đổi. Lưu lại trước khi xuất bản.')
      return
    }
    if (!response.ok) {
      setStatus('Chưa xuất bản được')
      return
    }
    const next = (await response.json()) as EditorDraft
    setVersion(next.version)
    setPublished(true)
    setStatus('Đã xuất bản')
  }

  return (
    <form
      className="editor"
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <h1>Soạn thiệp</h1>
      <RotateHandle
        invitationId={draft.invitationId}
        slug={slug}
        version={version}
        onRotated={(next) => {
          setSlug(next.slug)
          setVersion(next.version)
        }}
      />
      <label>
        Tên một
        <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
      </label>
      <label>
        Tên hai
        <input value={secondName} onChange={(event) => setSecondName(event.target.value)} />
      </label>
      <label>
        Tên buổi
        <input value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} />
      </label>
      <label>
        Lời mời
        <textarea value={greeting} onChange={(event) => setGreeting(event.target.value)} />
      </label>
      <button type="submit">Lưu</button>
      <button type="button" onClick={() => void publish()}>
        Xuất bản bản đã lưu
      </button>
      {published ? <p><a href={`/i/${slug}`}>Xem trang khách</a></p> : null}
      <RevokeGuests invitationId={draft.invitationId} version={version} onRevoked={setVersion} />
      <SwitchRsvpMode invitationId={draft.invitationId} mode={rsvpMode} onSwitched={() => setRsvpMode('GUEST_LIST')} />
      <ReopenRsvp invitationId={draft.invitationId} />
      <RetireEvent invitationId={draft.invitationId} />
      <p>{status}</p>
    </form>
  )
}
