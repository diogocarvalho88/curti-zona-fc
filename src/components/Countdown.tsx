import { useEffect, useState } from 'react'
import { getTimeLeft } from '../lib/time'

export function Countdown({ target, completeLabel }: { target: string; completeLabel: string }) {
  const [left, setLeft] = useState(() => getTimeLeft(target))
  useEffect(() => {
    const tick = () => setLeft(getTimeLeft(target))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [target])
  if (left.complete) return <p className="countdown-complete">{completeLabel}</p>
  return <div className="countdown" aria-label={`${left.days} dias, ${left.hours} horas, ${left.minutes} minutos e ${left.seconds} segundos`}>
    {([['Dias', left.days], ['Horas', left.hours], ['Min', left.minutes], ['Seg', left.seconds]] as const).map(([label, value]) => (
      <div className="count-unit" key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>
    ))}
  </div>
}
