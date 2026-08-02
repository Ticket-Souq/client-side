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

export function formatPrice(price: number, currency: string = 'EGP'): string {
  return `${currency} ${price.toLocaleString()}`
}
