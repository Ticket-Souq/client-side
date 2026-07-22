import React, { useEffect, useState } from 'react'
import type { CountdownProps } from '../../types'

export const Countdown: React.FC<CountdownProps> = ({ seconds, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.()
      return
    }
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(timer)
  }, [remaining, onExpire])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 13,
      color: '#e65100',
      marginBottom: 8,
      display: 'block',
    }}>
      Lock expires in {display}
    </span>
  )
}