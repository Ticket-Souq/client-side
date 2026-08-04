import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { LayoutShell } from '../../../shared/components/layout/LayoutShell'
import { Button } from '../../../shared/components'
import { BRAND_NAME } from '../../../shared/constants'
import styles from '../styles/site.module.css'

const CONTACTS = [
  {
    icon: <Mail size={20} />,
    title: 'Email',
    value: 'support@ticketsouq.com',
    href: 'mailto:support@ticketsouq.com',
  },
  {
    icon: <Phone size={20} />,
    title: 'Phone',
    value: '+20 100 000 0000',
    href: 'tel:+201000000000',
  },
  {
    icon: <MapPin size={20} />,
    title: 'Address',
    value: 'Cairo, Egypt',
  },
  {
    icon: <Clock size={20} />,
    title: 'Support hours',
    value: 'Every day · 9:00 AM – 11:00 PM (GMT+2)',
  },
]

export default function ContactUs() {
  return (
    <LayoutShell>
      <main className={`${styles.wrap} ${styles.page}`}>
        <section className={styles.head}>
          <p className={styles.eyebrow}>Contact us</p>
          <h1 className={styles.title}>We&apos;d love to hear from you</h1>
          <p className={styles.sub}>
            Questions about an event, your tickets, or a refund? Reach out and our team will get
            back to you as soon as possible.
          </p>
        </section>

        <section className={styles.cards}>
          {CONTACTS.map((c) => (
            <div key={c.title} className={styles.infoCard}>
              <div className={styles.icon}>{c.icon}</div>
              <div>
                <p className={styles.infoTitle}>{c.title}</p>
                <p className={styles.infoValue}>
                  {c.href ? (
                    <a href={c.href}>{c.value}</a>
                  ) : (
                    c.value
                  )}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div className={styles.ctaRow}>
          <Button variant="primary" href="mailto:support@ticketsouq.com">
            Email {BRAND_NAME} Support
          </Button>
        </div>
      </main>
    </LayoutShell>
  )
}
