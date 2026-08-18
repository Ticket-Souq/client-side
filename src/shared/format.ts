export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value))
}

export function formatEGP(value: number): string {
  return `${formatNumber(value)} EGP`
}

export function formatPrice(price: number, currency = 'EGP'): string {
  return `${currency} ${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatEventDate(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }

  const dateStr = start.toLocaleDateString('en-US', dateOpts)

  if (!end || start.toDateString() === end.toDateString()) {
    const startTime = start.toLocaleTimeString('en-US', timeOpts)
    const endTime = end?.toLocaleTimeString('en-US', timeOpts)
    if (endTime && startTime !== endTime) {
      return `${dateStr} · ${startTime} – ${endTime}`
    }
    return `${dateStr} · ${startTime}`
  }

  const endStr = end.toLocaleDateString('en-US', dateOpts)
  return `${dateStr} – ${endStr}`
}

export function shortDateLabel(iso: string): string {
  const m = Number(iso.slice(5, 7))
  const d = Number(iso.slice(8, 10))
  return `${MONTHS[m - 1]} ${d}`
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export function fillPct(sold: number, capacity: number): number {
  if (!capacity) return 0
  return Math.min((sold / capacity) * 100, 100)
}
