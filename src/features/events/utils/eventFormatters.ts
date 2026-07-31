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

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
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

export function formatTickets(available: number, total: number): string {
  return `${available} / ${total}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function getArtVariant(index: number): 'waves' | 'beams' | 'grid' | 'confetti' | 'dots' | 'arc' {
  const variants = ['waves', 'beams', 'grid', 'confetti', 'dots', 'arc'] as const
  return variants[index % variants.length]
}
