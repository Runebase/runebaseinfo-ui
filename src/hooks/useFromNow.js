import { useState, useEffect } from 'react'

function getFromNow(timestamp) {
  const now = Date.now()
  const diff = now - timestamp * 1000
  const seconds = Math.floor(diff / 1000)

  if (seconds < 5) return 'a few seconds ago'
  if (seconds < 60) return seconds + ' seconds ago'
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return 'a minute ago'
  if (minutes < 60) return minutes + ' minutes ago'
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return 'an hour ago'
  if (hours < 24) return hours + ' hours ago'
  const days = Math.floor(hours / 24)
  if (days === 1) return 'a day ago'
  if (days < 30) return days + ' days ago'
  const months = Math.floor(days / 30)
  if (months === 1) return 'a month ago'
  if (months < 12) return months + ' months ago'
  const years = Math.floor(days / 365)
  if (years === 1) return 'a year ago'
  return years + ' years ago'
}

export function useFromNow(timestamp) {
  const [text, setText] = useState(() => getFromNow(timestamp))

  useEffect(() => {
    setText(getFromNow(timestamp))
    const interval = setInterval(() => setText(getFromNow(timestamp)), 1000)
    return () => clearInterval(interval)
  }, [timestamp])

  return text
}
