import { UserProfileProvider } from '../../../shared/hooks/useUserProfile'
import { LayoutShell } from '../../../shared/components/layout/LayoutShell'
import styles from '../styles/Landing.module.css'

const artClasses = [styles.artBeams, styles.artWaves, styles.artGrid, styles.artConfetti]

export default function Landing() {
  return (
    <UserProfileProvider>
      <LayoutShell>
        <main className={styles.wrap}>
        <section className={styles.heroSection}>
          <p className={styles.heroEyebrow}>Featured — Cairo, this weekend</p>
          <div className={styles.ticketCard}>
            <div className={styles.ticketArt}>
              <div className={styles.beam} />
              <div className={styles.beam} />
              <div className={styles.beam} />
              <div className={styles.ticketMainContent}>
                <span className={styles.ticketTag}>Live music</span>
                <h1 className={styles.ticketTitle}>
                  NILE NIGHTS<br />FESTIVAL
                </h1>
                <div className={styles.ticketMeta}>
                  <span>Fri, 25 Jul · 7:00 PM</span>
                  <span>Cairo Festival Grounds</span>
                </div>
              </div>
            </div>
            <div className={styles.ticketStub}>
              <span className={`${styles.stubNotch} ${styles.stubNotchTop}`} />
              <div className={styles.stubRow}>
                <span className={styles.stubLabel}>Admission</span>
                <span className={styles.stubValue}>General entry</span>
              </div>
              <div className={styles.stubRow}>
                <span className={styles.stubLabel}>Gate opens</span>
                <span className={styles.stubValue}>6:00 PM</span>
              </div>
              <div>
                <span className={styles.stubLabel}>From</span>
                <p className={styles.stubPrice}>EGP 450</p>
              </div>
              <button className={`${styles.btn} ${styles.btnPrimary} ${styles.stubCta}`} style={{ pointerEvents: 'none', opacity: 0.5 }} disabled>
                Book now
              </button>
              <span className={`${styles.stubNotch} ${styles.stubNotchBottom}`} />
            </div>
          </div>
        </section>

        <section className={styles.rowSection}>
          <div className={styles.rowHead}>
            <h2 className={styles.rowTitle}>This week in Cairo</h2>
            <a href="#" className={styles.rowSeeall}>
              See all <span className={styles.rowSeeallArrow}>&rarr;</span>
            </a>
          </div>
          <div className={styles.hscroll}>
            <EventCard art={artClasses[0]} corner="JUL" title="Rooftop Jazz Sessions" meta="Wed 22 Jul · Zamalek" />
            <EventCard art={artClasses[1]} corner="JUL" title="Aqua Splash Weekend" meta="Sat 25 Jul · 6th of October" />
            <EventCard art={artClasses[2]} corner="JUL" title="Stand-up Comedy Night" meta="Thu 23 Jul · Downtown" />
            <EventCard art={artClasses[1]} corner="JUL" title="Design & Coffee Meetup" meta="Fri 24 Jul · Maadi" />
            <EventCard art={artClasses[3]} corner="JUL" title="Family Fun Carnival" meta="Sat 25 Jul · New Cairo" />
            <EventCard art={artClasses[1]} corner="JUL" title="Sunset DJ Set" meta="Sun 26 Jul · North Coast" />
          </div>
        </section>

        <section className={styles.rowSection}>
          <div className={styles.rowHead}>
            <h2 className={styles.rowTitle}>Aqua parks</h2>
            <a href="#" className={styles.rowSeeall}>
              See all <span className={styles.rowSeeallArrow}>&rarr;</span>
            </a>
          </div>
          <div className={styles.hscroll}>
            <EventCard art={artClasses[1]} corner="AUG" title="Wave Pool Day Pass" meta="Daily · 6th of October" />
            <EventCard art={artClasses[1]} corner="AUG" title="Slides & Splash Zone" meta="Daily · Alexandria" />
            <EventCard art={artClasses[3]} corner="AUG" title="Kids Water Carnival" meta="Weekends · Giza" />
            <EventCard art={artClasses[1]} corner="AUG" title="Lazy River Pass" meta="Daily · New Capital" />
            <EventCard art={artClasses[0]} corner="AUG" title="Night Splash Party" meta="Fri & Sat · Sheikh Zayed" />
          </div>
        </section>

        <section className={styles.rowSection}>
          <div className={styles.rowHead}>
            <h2 className={styles.rowTitle}>Concerts & festivals</h2>
            <a href="#" className={styles.rowSeeall}>
              See all <span className={styles.rowSeeallArrow}>&rarr;</span>
            </a>
          </div>
          <div className={styles.hscroll}>
            <EventCard art={artClasses[2]} corner="SEP" title="Electric Nights Tour" meta="Fri 12 Sep · Cairo Arena" />
            <EventCard art={artClasses[0]} corner="SEP" title="Oud & Strings Evening" meta="Sat 13 Sep · Opera House" />
            <EventCard art={artClasses[1]} corner="SEP" title="Desert Beats Festival" meta="Fri 19 Sep · North Coast" />
            <EventCard art={artClasses[1]} corner="SEP" title="Acoustic Sunset Series" meta="Sun 21 Sep · Zamalek" />
            <EventCard art={artClasses[3]} corner="SEP" title="Youth Music Showcase" meta="Sat 27 Sep · Maadi" />
            <EventCard art={artClasses[1]} corner="SEP" title="Indie Rock Night" meta="Fri 3 Oct · Downtown" />
          </div>
        </section>

        <section className={styles.portalSection}>
          <h2 className={styles.portalSectionTitle}>Choose your portal</h2>
          <p className={styles.portalSectionDesc}>3 independent platforms, one ticket ecosystem</p>
          <div className={styles.portalGrid}>
            <a href="/customer/events" className={styles.portalCard}>
              <div className={styles.portalIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#15150f" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className={styles.portalName}>Customer</span>
              <span className={styles.portalDesc}>Browse events, book tickets, manage your reservations</span>
              <span className={styles.portalBtn}>Enter</span>
            </a>
            <a href="/org/events" className={styles.portalCard}>
              <div className={styles.portalIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#15150f" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <span className={styles.portalName}>Organizer</span>
              <span className={styles.portalDesc}>Manage venues, events, tickets & your organization</span>
              <span className={styles.portalBtn}>Enter</span>
            </a>
            <a href="/admin/organizations" className={styles.portalCard}>
              <div className={styles.portalIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#15150f" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className={styles.portalName}>Admin</span>
              <span className={styles.portalDesc}>Platform oversight, approvals, system monitoring</span>
              <span className={styles.portalBtn}>Enter</span>
            </a>
          </div>
        </section>
      </main>
      </LayoutShell>
    </UserProfileProvider>
  )
}

interface EventCardProps {
  art: string
  corner: string
  title: string
  meta: string
}

function EventCard({ art, corner, title, meta }: EventCardProps) {
  return (
    <div className={styles.ecard}>
      <div className={`${styles.art} ${art}`} />
      <span className={styles.corner}>{corner}</span>
      <div className={styles.overlay}>
        <p className={styles.evTitle}>{title}</p>
        <p className={styles.evMeta}>{meta}</p>
      </div>
    </div>
  )
}
