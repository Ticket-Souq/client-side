import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { authFetch } from '../../../shared/auth'
import { API } from '../../../shared/api'
import './TeamManagement.css'

interface Member {
  userId: string
  name: string
  email: string
  memberRole: string
  orgId: string
  organizationName: string
  active: boolean
}

interface GeneratedAccount {
  userId: string
  email: string
  password: string
  role: string
}

const TABS = ['All', 'Agents', 'Consumers']

export default function TeamManagement() {
  const [tab, setTab] = useState('All')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [agentCount, setAgentCount] = useState('')
  const [consumerCount, setConsumerCount] = useState('')
  const [toast, setToast] = useState('')
  const [generatedAccounts, setGeneratedAccounts] = useState<GeneratedAccount[]>([])

  const fetchMembers = async () => {
    try {
      const res = await authFetch(API.org.members)
      if (!res.ok) throw new Error('Failed to load members')
      const data = await res.json()
      setMembers(data)
    } catch {
      setToast('Failed to load team members')
      setTimeout(() => setToast(''), 4000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [])

  const stats = useMemo(() => ({
    total: members.length,
    agents: members.filter((m) => m.memberRole === 'AGENT').length,
    consumers: members.filter((m) => m.memberRole === 'CONSUMER').length,
    active: members.filter((m) => m.active).length,
    inactive: members.filter((m) => !m.active).length,
  }), [members])

  const filtered = members.filter((m) => {
    if (tab === 'All') return true
    if (tab === 'Agents') return m.memberRole === 'AGENT'
    if (tab === 'Consumers') return m.memberRole === 'CONSUMER'
    return true
  })

  const toggleActive = async (member: Member) => {
    const url = member.active ? API.org.deactivate : API.org.activate
    const method = member.active ? 'DELETE' : 'POST'
    try {
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'text/plain' },
        body: member.userId,
      })
      if (!res.ok) throw new Error('Failed to update')
      setMembers(members.map((m) =>
        m.userId === member.userId ? { ...m, active: !m.active } : m
      ))
    } catch {
      setToast('Failed to update member status')
      setTimeout(() => setToast(''), 4000)
    }
  }

  const handleGenerate = async () => {
    const agents = parseInt(agentCount) || 0
    const consumers = parseInt(consumerCount) || 0
    if (agents === 0 && consumers === 0) return

    try {
      const res = await authFetch(API.org.generateAccounts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentCount: agents, consumerCount: consumers }),
      })
      if (!res.ok) throw new Error('Failed to generate accounts')
      const data: GeneratedAccount[] = await res.json()
      setGeneratedAccounts(data)
      setModalOpen(false)
      setAgentCount('')
      setConsumerCount('')
      fetchMembers()
    } catch {
      setToast('Failed to generate accounts')
      setTimeout(() => setToast(''), 4000)
    }
  }

  const roleBadge = (role: string) => {
    if (role === 'AGENT') return 'badge-yellow'
    if (role === 'CONSUMER') return 'badge-soft'
    return 'badge-blue'
  }

  const roleLabel = (role: string) => {
    if (role === 'HEAD') return 'Head'
    if (role === 'AGENT') return 'Agent'
    if (role === 'CONSUMER') return 'Consumer'
    return role
  }

  return (
    <main className="wrap members-page">
      <div className="members-head">
        <h1 className="section-title" style={{ margin: 0 }}>Team Members</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Generate Members</button>
      </div>

      <div className="stat-chips">
        <div className="stat-chip"><span className="stat-chip-num">{stats.agents}</span> Agents</div>
        <div className="stat-chip"><span className="stat-chip-num">{stats.consumers}</span> Consumers</div>
        <div className="stat-chip"><span className="stat-chip-num">{stats.active}</span> Active</div>
        <div className="stat-chip"><span className="stat-chip-num">{stats.inactive}</span> Inactive</div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card-white" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Loading...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.userId}>
                    <td>{m.email}</td>
                    <td><span className={`badge ${roleBadge(m.memberRole)}`}>{roleLabel(m.memberRole)}</span></td>
                    <td>
                      <span className={`badge ${m.active ? 'badge-green' : 'badge-red'}`}>
                        {m.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {m.memberRole !== 'HEAD' && (
                        <label className={`toggle ${m.active ? 'active' : ''}`} onClick={() => toggleActive(m)}>
                          <span className="toggle-track"></span>
                        </label>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Generate Members</h2>
            <div className="modal-field">
              <label className="modal-label">Agents</label>
              <input className="form-input modal-input" type="number" min="0" value={agentCount} onChange={(e) => setAgentCount(e.target.value)} placeholder="0" />
            </div>
            <div className="modal-field">
              <label className="modal-label">Consumers</label>
              <input className="form-input modal-input" type="number" min="0" value={consumerCount} onChange={(e) => setConsumerCount(e.target.value)} placeholder="0" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleGenerate}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {generatedAccounts.length > 0 && (
        <div className="modal-overlay" onClick={() => setGeneratedAccounts([])}>
          <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{ marginBottom: 8 }}>Generated Accounts</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Share these credentials with your team members.</p>
            <div className="table-wrap">
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 14px' }}>Email</th>
                    <th style={{ padding: '8px 14px' }}>Password</th>
                    <th style={{ padding: '8px 14px' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedAccounts.map((a) => (
                    <tr key={a.userId}>
                      <td style={{ padding: '8px 14px' }}>{a.email}</td>
                      <td style={{ padding: '8px 14px' }}><code>{a.password}</code></td>
                      <td style={{ padding: '8px 14px' }}><span className={`badge ${roleBadge(a.role)}`}>{roleLabel(a.role)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setGeneratedAccounts([])}>Done</button>
            </div>
          </div>
        </div>
      )}

      {toast && createPortal(
        <div style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--ink)',
          color: 'var(--white)',
          padding: '14px 28px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          zIndex: 9999,
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}>{toast}</div>,
        document.body,
      )}
    </main>
  )
}
