import { useNavigate } from 'react-router-dom'
import { EventCreateForm } from '../../events/components/EventCreateForm'
import { useCreateEvent } from '../../events/hooks/useCreateEvent'

export default function EventCreate() {
  const navigate = useNavigate()
  const { submitting, error, created, handleSubmit } = useCreateEvent()

  if (created) {
    return (
      <div className="wrap">
        <div className="page-head">
          <div>
            <h1 className="section-title">Event created</h1>
            <p className="section-sub" style={{ margin: '4px 0 0' }}>Your event has been submitted for review.</p>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/org/events')}>Back to events</button>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1 className="section-title">Create Event</h1>
          <p className="section-sub" style={{ margin: '4px 0 0' }}>Set up a new event for your audience</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#991b1b' }}>
          {error}
        </div>
      )}

      <EventCreateForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/org/events')}
        loading={submitting}
      />
    </div>
  )
}
