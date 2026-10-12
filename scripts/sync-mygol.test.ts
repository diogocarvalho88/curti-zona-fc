import { describe, expect, it } from 'vitest'
import { parseCupPayload, parsePayload, standingsFromMatches } from './sync-mygol'

describe('MyGol parser', () => {
  it('normalizes matches, standings and stats', () => {
    const result = parsePayload({ matches: [{ id: 7, round: 2, home_team: 'Curti Zona FC', away_team: 'Rival', home_score: '3', away_score: '1' }], table: [{ rank: 1, team_name: 'Curti Zona FC', played: 1, won: 1, drawn: 0, lost: 0, goals_for: 3, goals_against: 1, pts: 3 }], stats: [{ player_id: 'peyroteo', goals: 2, assists: 1 }] })
    expect(result.matches?.[0]).toMatchObject({ round: 2, homeScore: 3, awayScore: 1 })
    expect(result.standings?.[0].points).toBe(3)
    expect(result.stats?.[0].goals).toBe(2)
  })
  it('does not replace data when shapes are unknown', () => expect(parsePayload({ hello: 'world' })).toEqual({}))
  it('builds a provisional table from the latest scores', () => {
    const table = standingsFromMatches([
      { id: '1', round: 1, date: null, home: 'Curti Zona FC', away: 'Jameson FC', homeScore: 2, awayScore: 2 },
      { id: '2', round: 1, date: null, home: 'Estrelas FC', away: 'Eleven K', homeScore: 7, awayScore: 1 },
    ])
    expect(table[0]).toMatchObject({ team: 'Estrelas FC', points: 3, goalsFor: 7, goalsAgainst: 1 })
    expect(table.find(row => row.team === 'Curti Zona FC')).toMatchObject({ played: 1, draws: 1, points: 1 })
  })
})


describe('cup cache', () => {
  it('reads cup results, planned fixtures, Lisbon winter time and trimmed player names', () => {
    const result = parseCupPayload({ days: [
      { matches: [{ startTime: '2026-10-11T18:00:00', status: 5, homeTeam: { name: 'Curti Zona FC' }, visitorTeam: { name: 'Taberna FC' }, visibleHomeScore: 2, visibleVisitorScore: 3 }] },
      { matches: [{ startTime: '2026-11-01T17:00:00', status: 1, homeTeam: { name: 'Curti Zona FC' }, visitorTeam: { name: 'Póvoa' }, visibleHomeScore: 0, visibleVisitorScore: 0 }] },
    ], players: [{ id: 19287, name: 'Pedro', surname: 'Correia ', dayResultSummary: { gamesPlayed: 1, cardsType1: 1 } }] })
    expect(result.cupMatches[0]).toMatchObject({ id: 'cup-1', homeScore: 2, awayScore: 3, competition: 'Taça Lisboa', date: '2026-10-11T18:00:00+01:00' })
    expect(result.cupMatches[1]).toMatchObject({ homeScore: null, awayScore: null, date: '2026-11-01T17:00:00+00:00' })
    expect(result.cupStats[0]).toMatchObject({ playerId: 'pedrinho', yellowCards: 1 })
  })
})
