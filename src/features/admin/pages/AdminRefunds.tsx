import { useState } from 'react'

type RefundStatus = 'Approved' | 'Pending' | 'Rejected'

interface RefundRecord {
  id: string
  refundId: string
  orderId: string
  customer: string
  amount: string
  amountValue: number
  reason: string
  status: RefundStatus
  date: string
}

const MOCK_REFUNDS: RefundRecord[] = [
  { id: 'r-1', refundId: 'RFD-001', orderId: 'ORD-2026-0718-001', customer: 'Alex M.', amount: 'EGP 450', amountValue: 450, reason: 'Event cancelled', status: 'Approved', date: '18 Jul' },
  { id: 'r-2', refundId: 'RFD-002', orderId: 'ORD-2026-0717-002', customer: 'Sara K.', amount: 'EGP 1,500', amountValue: 1500, reason: 'Duplicate charge', status: 'Pending', date: '17 Jul' },
  { id: 'r-3', refundId: 'RFD-003', orderId: 'ORD-2026-0716-003', customer: 'Omar H.', amount: 'EGP 250', amountValue: 250, reason: 'Changed mind', status: 'Pending', date: '16 Jul' },
  { id: 'r-4', refundId: 'RFD-004', orderId: 'ORD-2026-0715-004', customer: 'Lina W.', amount: 'EGP 800', amountValue: 800, reason: 'Wrong ticket type', status: 'Rejected', date: '15 Jul' },
  { id: 'r-5', refundId: 'RFD-005', orderId: 'ORD-2026-0714-005', customer: 'Youssef M.', amount: 'EGP 120', amountValue: 120, reason: 'Service fee dispute', status: 'Pending', date: '14 Jul' },
  { id: 'r-6', refundId: 'RFD-006', orderId: 'ORD-2026-0713-006', customer: 'Nour A.', amount: 'EGP 3,000', amountValue: 3000, reason: 'Event rescheduled', status: 'Approved', date: '13 Jul' },
]

const STATUS_BADGE: Record<string, string> = {
  Approved: 'badge badge-green',
  Pending: 'badge badge-orange',
  Rejected: 'badge badge-red',
}

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState(MOCK_REFUNDS)
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('')

  const totalRefunds = refunds.length
  const pendingCount = refunds.filter((r) => r.status === 'Pending').length
  const totalAmount = refunds.reduce((sum, r) => sum + r.amountValue, 0)

  const updateStatus = (id: string, newStatus: RefundStatus) => {
    setRefunds((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim() || !reason.trim()) return
    const newRefund: RefundRecord = {
      id: `r-${Date.now()}`,
      refundId: `RFD-${String(refunds.length + 1).padStart(3, '0')}`,
      orderId: orderId.trim(),
      customer: 'Current User',
      amount: 'EGP 0',
      amountValue: 0,
      reason: reason.trim(),
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    }
    setRefunds((prev) => [newRefund, ...prev])
    setOrderId('')
    setReason('')
  }

  return (
    <div className="wrap" style={{ padding: '36px 0' }}>
      <section className="row-section">
        <h1 className="section-title" style={{ margin: '0 0 4px' }}>Refund Management</h1>
        <p className="section-sub" style={{ margin: '0 0 28px' }}>
          Process and track refund requests across all orders.
        </p>

        <div className="card-white" style={{ maxWidth: 600, marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>Request a refund</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Order ID</label>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. ORD-2026-0719-0042"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Reason</label>
              <textarea
                className="form-input"
                placeholder="Tell us why you're requesting a refund…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Submit request
            </button>
          </form>
        </div>

        <div className="row-head">
          <h2 className="row-title">Refund history</h2>
        </div>
        <div className="card-white table-wrap">
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
              {refunds.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.refundId}</td>
                  <td className="mono">{r.orderId}</td>
                  <td>{r.customer}</td>
                  <td>{r.amount}</td>
                  <td>{r.reason}</td>
                  <td><span className={STATUS_BADGE[r.status]}>{r.status}</span></td>
                  <td className="mono">{r.date}</td>
                  <td>
                    {r.status === 'Pending' && (
                      <div className="refund-actions" style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r.id, 'Approved')}>Approve</button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)' }}
                          onClick={() => updateStatus(r.id, 'Rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="stats-row" style={{ display: 'flex', gap: 24, marginTop: 24 }}>
          <div className="stat-box" style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <p className="stat-label mono" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
              Total refunds
            </p>
            <p className="stat-value" style={{ fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1, margin: 0 }}>
              {totalRefunds}
            </p>
          </div>
          <div className="stat-box" style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <p className="stat-label mono" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
              Pending
            </p>
            <p className="stat-value" style={{ fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1, margin: 0 }}>
              {pendingCount}
            </p>
          </div>
          <div className="stat-box" style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <p className="stat-label mono" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
              Amount refunded
            </p>
            <p className="stat-value" style={{ fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1, margin: 0, color: 'var(--yellow)' }}>
              EGP {totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
