export function formatShortTimestamp(isoString: string) {
  const date = new Date(isoString)

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatLongDate(isoString: string) {
  const date = new Date(isoString)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatMonthDay(isoString: string) {
  const date = new Date(isoString)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}
