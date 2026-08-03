import { useState, useEffect } from 'react'
import { onLoadingChange } from '../loading'

export default function GlobalLoading() {
  const [loading, setLoading] = useState(false)

  useEffect(() => onLoadingChange(setLoading), [])

  if (!loading) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'color-mix(in srgb, var(--white) 35%, transparent)',
      backdropFilter: 'blur(2px)',
      cursor: 'wait',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--yellow)',
        borderRadius: '50%',
        animation: 'gl-spin .7s linear infinite',
      }} />
      <style>{`@keyframes gl-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
