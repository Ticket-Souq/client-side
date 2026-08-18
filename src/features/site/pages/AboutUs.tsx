import { LayoutShell } from '../../../shared/components/layout/LayoutShell'
import { BRAND_NAME } from '../../../shared/constants'
import styles from '../styles/site.module.css'

interface TeamMember {
  name: string
  role: string
  photoUrl: string
  linkedIn: string
  github: string
  gmail: string
}

const TEAM: TeamMember[] = [
    { name: 'Ahmed Abdulazeem', role: 'Role / Title', photoUrl: '/TeamMembers/Ahmed.jpg', linkedIn: 'https://www.linkedin.com/in/%D9%90ahmed-abdulazeem-bb0b72203/', github: 'https://github.com/ahmadazeem40', gmail: 'mailto:ahmadazeem40@gmail.com' },
    { name: 'Ahmed Adel', role: 'Role / Title', photoUrl: '/TeamMembers/Adel.jpg', linkedIn: 'https://www.linkedin.com/in/ahmed-adel-165846206/', github: 'https://github.com/A7madAdelll', gmail: 'mailto:ahmadaa145632@gmail.com' },
    { name: 'Ahmed Habib', role: 'Role / Title', photoUrl: '/TeamMembers/Habib.jpg', linkedIn: 'https://www.linkedin.com/in/ahmed-habib153/', github: 'https://github.com/ahmed-habib321', gmail: 'mailto:ahmedhabib0660@gmail.com' },
    { name: 'Omar Kenawi', role: 'Role / Title', photoUrl: '/TeamMembers/Omar.jpg', linkedIn: 'https://www.linkedin.com/in/omar-kenawi/', github: 'https://github.com/omarKenawi', gmail: 'mailto:omar.sseeddeekk@gmail.com' },
    { name: 'Eyad Sameh', role: 'Role / Title', photoUrl: '/TeamMembers/Eyad.jpg', linkedIn: 'https://www.linkedin.com/in/eyad-alasser/', github: 'https://github.com/eddypencil', gmail: 'mailto:eydopencil@gmail.com' },
    { name: 'Samy Nagy', role: 'Role / Title', photoUrl: '/TeamMembers/Samy.jpg', linkedIn: 'https://www.linkedin.com/in/samy-nagy1/', github: 'https://github.com/samynagy', gmail: 'mailto:samynagy95@gmail.com' },
]

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .slice(0, 2)
    .join('')
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.86a10.14 10.14 0 0 0-3.21 19.76c.51.09.69-.22.69-.49v-1.72c-2.82.61-3.42-1.36-3.42-1.36-.46-1.17-1.12-1.48-1.12-1.48-.92-.63.07-.62.07-.62 1.02.07 1.55 1.04 1.55 1.04.9 1.55 2.37 1.1 2.95.84.09-.66.35-1.1.64-1.36-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.59.7.49A10.14 10.14 0 0 0 12 1.86z" />
    </svg>
  )
}

function GmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  )
}

export default function AboutUs() {
  return (
    <LayoutShell>
      <main className={`${styles.wrap} ${styles.page}`}>
        <section className={styles.head}>
          <p className={styles.eyebrow}>About us</p>
          <h1 className={styles.title}>The people behind {BRAND_NAME}</h1>
          <p className={styles.sub}>
            We are a team of six engineers building Egypt&apos;s event ticketing platform.
            Hover over a card to find each member on LinkedIn, GitHub, and Gmail.
          </p>
        </section>

        <section className={styles.grid}>
          {TEAM.map((member) => (
            <article key={member.name} className={styles.card}>
              <div className={styles.photoWrap}>
                {member.photoUrl ? (
                  <img className={styles.photo} src={member.photoUrl} alt={member.name} />
                ) : (
                  <div className={styles.avatarFallback}>{initials(member.name)}</div>
                )}
                <div className={styles.overlay}>
                  <p className={styles.overlayLabel}>Connect</p>
                  <div className={styles.links}>
                    <a
                      className={styles.link}
                      href={member.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      title="LinkedIn"
                    >
                      <LinkedInIcon />
                    </a>
                    <a
                      className={styles.link}
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on GitHub`}
                      title="GitHub"
                    >
                      <GitHubIcon />
                    </a>
                    <a
                      className={styles.link}
                      href={member.gmail}
                      aria-label={`Email ${member.name}`}
                      title="Gmail"
                    >
                      <GmailIcon />
                    </a>
                  </div>
                </div>
              </div>
              <div className={styles.meta}>
                <p className={styles.name}>{member.name}</p>
                {/*<p className={styles.role}>{member.role}</p>*/}
              </div>
            </article>
          ))}
        </section>
      </main>
    </LayoutShell>
  )
}
