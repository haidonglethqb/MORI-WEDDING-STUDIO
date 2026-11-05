interface InvitationListItem {
  invitationId: string
  slug: string
  status: string
  eventTitle: string
  displayNames: [string, string]
}

const statusLabel: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đang phát hành',
  UNPUBLISHED: 'Đã gỡ',
  EXPIRED: 'Hết hạn',
}

export function InvitationList({ items }: { items: InvitationListItem[] }) {
  if (items.length === 0) {
    return <div className="workspace-empty">Bạn chưa tạo thiệp nào. Nhấn "+ Tạo thiệp mới" để bắt đầu.</div>
  }

  return (
    <ul className="workspace-list">
      {items.map((item) => (
        <li key={item.invitationId} className="workspace-item">
          <div className="workspace-item-info">
            <span className="workspace-item-title">
              {item.displayNames[0]} &amp; {item.displayNames[1]}
            </span>
            <span className="workspace-item-meta">{item.eventTitle || 'Thiệp cưới'}</span>
          </div>
          <div className="workspace-item-actions">
            <span className={`badge-tag ${item.status}`}>{statusLabel[item.status] ?? item.status}</span>
            <a href={`/invitations/${item.invitationId}`} className="workspace-action-link">
              Chỉnh sửa
            </a>
            {item.status === 'PUBLISHED' ? (
              <a href={`/i/${item.slug}`} target="_blank" rel="noreferrer" className="workspace-action-link">
                Xem trang khách ↗
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
