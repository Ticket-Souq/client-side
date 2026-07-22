import { useLocation } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import styles from '../notifications.module.css'

interface Props {
  role?: 'customer' | 'admin' | 'organizer'
}

function detectRole(pathname: string): 'customer' | 'admin' | 'organizer' {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/org')) return 'organizer'
  return 'customer'
}

export default function Notifications({ role: roleProp }: Props) {
  const location = useLocation()
  const role = roleProp ?? detectRole(location.pathname)
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications(role)

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <h1 className="section-title" style={{ margin: 0 }}>Notifications</h1>
          </div>
        </div>
        <div className={styles.card}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Failed to load notifications</p>
          <p style={{ fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <h1 className="section-title" style={{ margin: 0 }}>Notifications</h1>
          </div>
        </div>
        <div className={styles.empty}>
          <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>All caught up</p>
          <p style={{ fontSize: 14, margin: 0 }}>No new notifications.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <h1 className="section-title" style={{ margin: 0 }}>Notifications</h1>
          {unreadCount > 0 && <span className={styles.count}>{unreadCount} unread</span>}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.stack}>
          {notifications.map((n) => (
            <div key={n.id} className={styles.row}>
              <span className={`${styles.dot} ${n.read ? styles.dotRead : styles.dotUnread}`} />
              <div className={styles.content}>
                <p className={styles.title}>{n.title}</p>
                <p className={styles.preview}>{n.preview}</p>
                <span className={styles.time}>{n.timeAgo}</span>
              </div>
              <div className={styles.actions}>
                {!n.read && (
                  <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
