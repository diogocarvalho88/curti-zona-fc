import type { Match, PlayerStats } from '../types'

export function seasonStats(league: PlayerStats[], cup: PlayerStats[]): PlayerStats[] {
  const combined = new Map<string, PlayerStats>()
  for (const row of [...league, ...cup]) {
    const current = combined.get(row.playerId)
    combined.set(row.playerId, current ? {
      ...current, appearances: current.appearances + row.appearances,
      goals: current.goals + row.goals, assists: current.assists + row.assists,
      yellowCards: current.yellowCards + row.yellowCards, redCards: current.redCards + row.redCards,
    } : { ...row })
  }
  return [...combined.values()].sort((a, b) => b.goals - a.goals || b.assists - a.assists)
}

export function seasonRecord(matches: Match[]) {
  const played = matches.filter(match => match.homeScore !== null && match.awayScore !== null)
  return played.reduce((record, match) => {
    const home = match.home === 'Curti Zona FC'
    const goals = (home ? match.homeScore : match.awayScore)!
    const against = (home ? match.awayScore : match.homeScore)!
    record.played += 1
    record.wins += Number(goals > against)
    record.draws += Number(goals === against)
    record.losses += Number(goals < against)
    record.goalsFor += goals
    record.goalsAgainst += against
    return record
  }, { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 })
}
