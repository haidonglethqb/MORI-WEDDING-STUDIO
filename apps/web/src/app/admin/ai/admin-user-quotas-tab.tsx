'use client'

import { useEffect, useState } from 'react'

interface UserQuotaRow {
  id: string
  displayName: string
  email: string
  role: string
  status: string
  todayUsed: number
  customDailyLimit: number | null
  effectiveDailyLimit: number | null
}

export function AdminUserQuotasTab() {
  const [users, setUsers] = useState<UserQuotaRow[]>([])
  const [defaultLimit, setDefaultLimit] = useState<string>('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  async function loadQuotas() {
    setLoading(true)
    try {
      const res = await fetch('/admin/ai/user-quotas', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as {
        defaultUserDailyLimit: number | null
        users: UserQuotaRow[]
      }
      setDefaultLimit(data.defaultUserDailyLimit === null ? '' : String(data.defaultUserDailyLimit))
      setUsers(data.users ?? [])
      const nextDrafts: Record<string, string> = {}
      for (const u of data.users ?? []) {
        nextDrafts[u.id] = u.customDailyLimit === null ? '' : String(u.customDailyLimit)
      }
      setDrafts(nextDrafts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadQuotas()
  }, [])

  async function saveDefault(val: string) {
    setBusyId('default')
    setFeedback('')
    const parsed = val.trim() === '' ? null : Math.max(0, Math.floor(Number(val)))
    try {
      const res = await fetch('/admin/ai/user-quotas', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ defaultUserDailyLimit: Number.isNaN(parsed) ? null : parsed }),
      })
      if (res.ok) {
        setFeedback(parsed === null ? '✓ Đã đặt mặc định: Không giới hạn cho tài khoản đăng nhập.' : `✓ Đã đặt mặc định ${parsed} lượt/ngày.`)
        await loadQuotas()
      }
    } finally {
      setBusyId(null)
    }
  }

  async function saveUser(userId: string, rawVal: string) {
    setBusyId(userId)
    setFeedback('')
    const parsed = rawVal.trim() === '' ? null : Math.max(0, Math.floor(Number(rawVal)))
    try {
      const res = await fetch('/admin/ai/user-quotas', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId, dailyLimit: Number.isNaN(parsed) ? null : parsed }),
      })
      if (res.ok) {
        setFeedback(parsed === null ? '✓ Đã gỡ giới hạn riêng (dùng mức mặc định).' : `✓ Đã cập nhật hạn mức ${parsed} lượt/ngày cho người dùng.`)
        await loadQuotas()
      }
    } finally {
      setBusyId(null)
    }
  }

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  return (
    <div className="admin-quota-wrap">
      <div className="admin-quota-default-card">
        <div>
          <strong>Hạn mức mặc định cho tài khoản đã đăng nhập</strong>
          <p>Để trống = <strong>Không giới hạn</strong> lượt nhắn AI mỗi ngày. Khách chưa đăng nhập luôn cố định 5 câu/ngày.</p>
        </div>
        <div className="admin-quota-default-controls">
          <input
            type="number"
            min={0}
            placeholder="Không giới hạn"
            value={defaultLimit}
            onChange={(e) => setDefaultLimit(e.target.value)}
          />
          <button type="button" className="btn-secondary" disabled={busyId === 'default'} onClick={() => void saveDefault('')}>
            Không giới hạn
          </button>
          <button type="button" className="btn-primary" disabled={busyId === 'default'} onClick={() => void saveDefault(defaultLimit)}>
            Lưu mặc định
          </button>
        </div>
      </div>

      <div className="admin-quota-toolbar">
        <input
          type="search"
          className="admin-quota-search"
          placeholder="Tìm theo tên hoặc email tài khoản..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-secondary" onClick={() => void loadQuotas()}>
          Tải lại
        </button>
      </div>

      {feedback ? <div className="save-status-box">{feedback}</div> : null}

      {loading ? (
        <p className="admin-quota-empty">Đang tải danh sách tài khoản...</p>
      ) : filtered.length === 0 ? (
        <p className="admin-quota-empty">Chưa có tài khoản nào phù hợp.</p>
      ) : (
        <div className="admin-quota-table-wrap">
          <table className="admin-quota-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Vai trò</th>
                <th>Hôm nay</th>
                <th>Đang áp dụng</th>
                <th>Chỉnh lượt/ngày riêng</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const draft = drafts[u.id] ?? ''
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.displayName}</strong>
                      <div className="admin-quota-sub">{u.email}</div>
                    </td>
                    <td><span className="admin-quota-role">{u.role}</span></td>
                    <td><strong>{u.todayUsed}</strong> lượt</td>
                    <td>
                      <span className={`admin-quota-badge ${u.effectiveDailyLimit === null ? 'is-unlimited' : ''}`}>
                        {u.effectiveDailyLimit === null ? 'Không giới hạn' : `${u.effectiveDailyLimit} lượt/ngày`}
                      </span>
                    </td>
                    <td>
                      <div className="admin-quota-row-controls">
                        <input
                          type="number"
                          min={0}
                          placeholder="Mặc định"
                          value={draft}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}
                        />
                        <button type="button" className="admin-quota-mini" disabled={busyId === u.id} onClick={() => void saveUser(u.id, draft)}>
                          Lưu
                        </button>
                        {u.customDailyLimit !== null ? (
                          <button type="button" className="admin-quota-mini is-ghost" disabled={busyId === u.id} onClick={() => void saveUser(u.id, '')}>
                            Gỡ giới hạn
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
