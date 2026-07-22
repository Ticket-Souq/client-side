import './Dashboard.css'

const BOOKINGS = [
  { day: '25', mon: 'JUL', title: 'Nile Nights Festival', meta: '7:00 PM · Cairo', art: 'art-beams' },
  { day: '26', mon: 'JUL', title: 'Aqua Splash Weekend', meta: '10:00 AM · 6th October', art: 'art-waves' },
  { day: '28', mon: 'JUL', title: 'Stand-up Comedy Night', meta: '9:00 PM · Downtown', art: 'art-grid' },
  { day: '30', mon: 'JUL', title: 'Design & Coffee Meetup', meta: '6:30 PM · Maadi', art: 'art-waves' },
  { day: '2', mon: 'AUG', title: 'Family Fun Carnival', meta: '11:00 AM · New Cairo', art: 'art-confetti' },
]

const ACTIVITY = [
  { name: 'Nile Nights Festival', action: 'Tickets purchased', time: '2 hours ago' },
  { name: 'Rooftop Jazz', action: 'Reservation confirmed', time: '1 day ago' },
  { name: 'Comedy Night', action: 'Booking cancelled', time: '3 days ago' },
  { name: 'Art Expo', action: 'Added to wishlist', time: '5 days ago' },
]

const RECOMMENDED = [
  { day: '5', mon: 'AUG', title: 'Sunset DJ Set', meta: '5:00 PM · North Coast', art: 'art-waves' },
  { day: '12', mon: 'AUG', title: 'Electric Nights Tour', meta: '8:00 PM · Cairo Arena', art: 'art-grid' },
  { day: '19', mon: 'AUG', title: 'Oud & Strings Evening', meta: '7:30 PM · Opera House', art: 'art-beams' },
  { day: '23', mon: 'AUG', title: 'Desert Beats Festival', meta: '4:00 PM · North Coast', art: 'art-confetti' },
  { day: '27', mon: 'AUG', title: 'Indie Rock Night', meta: '9:00 PM · Downtown', art: 'art-waves' },
]

function EventCard({ day, mon, title, meta, art }: typeof BOOKINGS[0]) {
  return (
    <div className="ecard">
      <div className={`art ${art}`} style={{ height: 120 }} />
      <span className="corner"><span className="day">{day}</span><span className="mon">{mon}</span></span>
      <div className="overlay">
        <p className="ev-title">{title}</p>
        <p className="ev-meta">{meta}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <main className="wrap dashboard-page">
      <section style={{ padding: '0 0 40px' }}>
        <div className="summary-card">
          <p className="hero-greeting">Welcome back, Ahmed!</p>
          <p className="hero-stat">{BOOKINGS.length}</p>
          <p className="hero-stat-sub">upcoming events</p>
        </div>
      </section>

      <section className="row-section" style={{ paddingTop: 0 }}>
        <div className="row-head">
          <h2 className="row-title">My Upcoming Bookings</h2>
          <a href="/customer/tickets" className="row-seeall">See all &rarr;</a>
        </div>
        <div className="hscroll">
          {BOOKINGS.map((b, i) => <EventCard key={i} {...b} />)}
        </div>
      </section>

      <section className="row-section" style={{ paddingTop: 0 }}>
        <div className="row-head">
          <h2 className="row-title">Recent Activity</h2>
        </div>
        <div className="card-white">
          <div className="activity-list">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="activity-row">
                <div className="activity-info">
                  <span className="activity-name">{a.name}</span>
                  <span className="activity-action">{a.action}</span>
                </div>
                <span className="activity-time">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="row-section" style={{ paddingTop: 0 }}>
        <div className="row-head">
          <h2 className="row-title">Recommended for You</h2>
          <a href="/customer/events" className="row-seeall">See all &rarr;</a>
        </div>
        <div className="hscroll">
          {RECOMMENDED.map((r, i) => <EventCard key={i} {...r} />)}
        </div>
      </section>

      <section className="row-section" style={{ paddingTop: 0 }}>
        <div className="row-head">
          <h2 className="row-title">Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <a href="/customer/events" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Browse Events</a>
          <a href="/customer/tickets" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>View My Tickets</a>
          <a href="#" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>Contact Support</a>
        </div>
      </section>
    </main>
  )
}
