export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; complete: boolean }

export function getTimeLeft(target: string, now = new Date()): TimeLeft {
  const difference = Math.max(0, new Date(target).getTime() - now.getTime())
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
    complete: difference === 0,
  }
}

export const formatMatchDate = (date: string | null) => date
  ? new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
  : 'Data a confirmar'

export const sortMatches = <T extends { round: number }>(matches: T[]) => [...matches].sort((a, b) => a.round - b.round)
