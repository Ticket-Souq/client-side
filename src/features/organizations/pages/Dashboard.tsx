import './Dashboard.css'

const ACTIVITY = [
  { icon: 'purchase', text: 'Purchased 3 tickets for Nile Nights', time: '12 min ago' },
  { icon: 'ticket', text: 'Transferred ticket to Sarah K.', time: '1 hr ago' },
  { icon: 'user', text: 'New connection request from Cairo Jazz', time: '3 hr ago' },
  { icon: 'edit', text: 'Updated event: Aqua Splash Weekend', time: '6 hr ago' },
  { icon: 'purchase', text: 'Redeemed 2 VIP passes at Rooftop Jazz', time: 'Yesterday' },
  { icon: 'ticket', text: 'Refund processed for Desert Beats', time: 'Yesterday' },
]

const ICON_MAP: Record<string, string> = {
  purchase: '\u2605',
  ticket: '\u2708',
  user: '\u2709',
  edit: '\u270E',
}

const UPCOMING_EVENTS = [
  { day: '25', mon: 'JUL', title: 'Nile Nights Festival', meta: '7:00 PM · Cairo', art: 'art-beams' },
  { day: '26', mon: 'JUL', title: 'Aqua Splash Weekend', meta: '10:00 AM · 6th October', art: 'art-waves' },
  { day: '28', mon: 'JUL', title: 'Stand-up Comedy Night', meta: '9:00 PM · Downtown', art: 'art-grid' },
  { day: '30', mon: 'JUL', title: 'Design & Coffee Meetup', meta: '6:30 PM · Maadi', art: 'art-waves' },
  { day: '2', mon: 'AUG', title: 'Family Fun Carnival', meta: '11:00 AM · New Cairo', art: 'art-confetti' },
  { day: '5', mon: 'AUG', title: 'Sunset DJ Set', meta: '5:00 PM · North Coast', art: 'art-waves' },
]

export default function Dashboard() {
  return (
    <main className="wrap">
      <section style={{ padding: '40px 0 0' }}>
        <div className="summary-card">
          <p className="hero-greeting">Good morning, Alex</p>
          <p className="stat-number">12</p>
          <p className="stat-sub">Upcoming events this month</p>
        </div>
      </section>

      <section className="row-section">
        <div className="row-head">
          <h2 className="row-title">Recent Activity</h2>
          <a href="/org/events" className="row-seeall">View all &rarr;</a>
        </div>
        <div className="hscroll">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="activity-card">
              <div className={`activity-icon ${a.icon}`}>{ICON_MAP[a.icon]}</div>
              <div className="activity-body">
                <p className="activity-text">{a.text}</p>
                <p className="activity-time">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="row-section">
        <div className="row-head">
          <h2 className="row-title">Upcoming Events</h2>
          <a href="/org/events" className="row-seeall">See all &rarr;</a>
        </div>
        <div className="hscroll">
          {UPCOMING_EVENTS.map((e, i) => (
            <div key={i} className="ecard">
              <div className={`art ${e.art}`} style={{ height: 120 }} />
              <span className="corner"><span className="day">{e.day}</span><span className="mon">{e.mon}</span></span>
              <div className="overlay">
                <p className="ev-title">{e.title}</p>
                <p className="ev-meta">{e.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="row-section" style={{ paddingTop: '8px' }}>
        <div className="row-head">
          <h2 className="row-title">Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <a href="/org/events/create" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>+ Create Event</a>
          <a href="/org/venues" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Browse Venues</a>
          <a href="/org/events" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Manage Tickets</a>
          <a href="#" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Analytics</a>
        </div>
      </section>
    </main>
  )
}
