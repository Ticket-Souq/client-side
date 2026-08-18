import { useState, useMemo, useEffect } from 'react'
import { request } from '../../../shared/http'
import { API } from '../../../shared/api'
import { toast } from '../../../shared/components/display/Toast/Toast'
import { PageHeader } from '../../../shared/components/layout/PageHeader/PageHeader'
import { StatChips } from '../../../shared/components/display/StatChips/StatChips'
import { LoadingState } from '../../../shared/components/display/StateViews/StateViews'
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
  const [generatedAccounts, setGeneratedAccounts] = useState<GeneratedAccount[]>([])

  const fetchMembers = async () => {
    try {
      const data = await request<Member[]>(API.org.members)
      setMembers(data)
    } catch {
      toast('Failed to load team members', 'error')
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
      await request(url, {
        method,
        headers: { 'Content-Type': 'text/plain' },
        body: member.userId,
      })
      setMembers(members.map((m) =>
        m.userId === member.userId ? { ...m, active: !m.active } : m
      ))
    } catch {
      toast('Failed to update member status', 'error')
    }
  }

  const handleGenerate = async () => {
    const agents = parseInt(agentCount) || 0
    const consumers = parseInt(consumerCount) || 0
    if (agents === 0 && consumers === 0) return

    try {
      const data = await request<GeneratedAccount[]>(API.org.generateAccounts, {
        method: 'POST',
        body: { agentCount: agents, consumerCount: consumers },
      })
      setGeneratedAccounts(data)
      setModalOpen(false)
      setAgentCount('')
      setConsumerCount('')
      fetchMembers()
    } catch {
      toast('Failed to generate accounts', 'error')
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
      <PageHeader
        title="Team Members"
        className="members-head"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Generate Members</button>
        }
      />

      <StatChips
        items={[
          { label: 'Agents', value: stats.agents },
          { label: 'Consumers', value: stats.consumers },
          { label: 'Active', value: stats.active },
          { label: 'Inactive', value: stats.inactive },
        ]}
      />

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card-white" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <LoadingState message="Loading..." />
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
    </main>
  )
}
