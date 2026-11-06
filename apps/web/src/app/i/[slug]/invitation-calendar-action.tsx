import { MoriIcon } from '../../../components/mori-icon'

export function InvitationCalendarAction({ href }: { href: string }) {
  return (
    <a className="public-calendar-link" href={href}>
      <MoriIcon name="calendar" />
      <span>Tải lịch sự kiện (.ics)</span>
    </a>
  )
}
