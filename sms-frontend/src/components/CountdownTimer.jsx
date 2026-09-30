import { useEffect, useState } from 'react'

export default function CountdownTimer({ expiresAt }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
      setRemaining(diff)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (!expiresAt) return null

  const m = Math.floor(remaining / 60).toString().padStart(2, '0')
  const s = (remaining % 60).toString().padStart(2, '0')

  return (
    <span className={`countdown${remaining < 60 ? ' danger' : ''}`} style={remaining < 60 ? { color: 'var(--danger)' } : {}}>
      {remaining === 0 ? 'Expired' : `${m}:${s}`}
    </span>
  )
}
