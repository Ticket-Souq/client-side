import { useState } from 'react'
import './Refunds.css'

const REFUNDS = [
  { id: 'RFD-001', order: 'ORD-2026-0715', customer: 'Alex M.', amount: 450, reason: 'Event cancelled', status: 'Approved', date: '18 Jul' },
  { id: 'RFD-002', order: 'ORD-2026-0712', customer: 'Sara K.', amount: 1500, reason: 'Duplicate charge', status: 'Pending', date: '17 Jul' },
  { id: 'RFD-003', order: 'ORD-2026-0710', customer: 'Omar H.', amount: 250, reason: 'Changed mind', status: 'Pending', date: '16 Jul' },
  { id: 'RFD-004', order: 'ORD-2026-0708', customer: 'Lina W.', amount: 800, reason: 'Wrong ticket type', status: 'Rejected', date: '15 Jul' },
  { id: 'RFD-005', order: 'ORD-2026-0705', customer: 'Youssef M.', amount: 120, reason: 'Service fee dispute', status: 'Pending', date: '14 Jul' },
  { id: 'RFD-006', order: 'ORD-2026-0703', customer: 'Nour A.', amount: 3000, reason: 'Event rescheduled', status: 'Approved', date: '13 Jul' },
]

const STATUS_BADGE: Record<string, string> = {
  Approved: 'badge-green',
  Pending: 'badge-orange',
  Rejected: 'badge-ink',
}

export default function Refunds() {
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('')
  const [refunds, setRefunds] = useState(REFUNDS)

  const handleSubmit = () => {
    if (!orderId || !reason) return
    const newRefund = {
      id: `RFD-${String(refunds.length + 1).padStart(3, '0')}`,
      order: orderId,
      customer: 'You',
      amount: 0,
      reason,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    }
    setRefunds([newRefund, ...refunds])
    setOrderId('')
    setReason('')
  }

  const stats = {
    total: refunds.length,
    pending: refunds.filter((r) => r.status === 'Pending').length,
    amount: refunds.reduce((sum, r) => sum + (r.status === 'Approved' ? r.amount : 0), 0),
  }

  return (
    <main className="wrap">
      <div className="page-head" style={{ padding: '46px 0 5px' }}>
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>Refund Management</h1>
          <p className="section-sub" style={{ margin: '4px 0 0' }}>Process and track refund requests</p>
        </div>
      </div>

      <div className="card-white">
        <h2 className="card-title" style={{ marginBottom: 20 }}>Request a refund</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input className="form-input" type="text" placeholder="Order ID" style={{ fontFamily: "'IBM Plex Mono',monospace" }} value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          <textarea className="form-input" style={{ height: 100, paddingTop: 14, resize: 'vertical', fontFamily: 'Inter,sans-serif' }} placeholder="Reason for refund…" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>Submit request</button>
        </div>
      </div>

      <div className="card-white">
        <h2 className="card-title" style={{ marginBottom: 20 }}>Refund history</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Refund ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r, i) => (
                <tr key={i}>
                  <td className="mono">{r.id}</td>
                  <td className="mono">{r.order}</td>
                  <td>{r.customer}</td>
                  <td style={{ fontWeight: 600 }}>EGP {r.amount.toLocaleString()}</td>
                  <td>{r.reason}</td>
                  <td><span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
                  <td>{r.date}</td>
                  <td>
                    {r.status === 'Pending' ? (
                      <div className="refund-actions">
                        <span className="action-link" style={{ color: '#2e7d32' }}>Approve</span>
                        <span className="action-link" style={{ color: '#c62828' }}>Reject</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <p className="stat-label">Total refunds</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Pending</p>
          <p className="stat-value yellow">{stats.pending}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Amount refunded</p>
          <p className="stat-value">EGP {stats.amount.toLocaleString()}</p>
        </div>
      </div>
    </main>
  )
}
