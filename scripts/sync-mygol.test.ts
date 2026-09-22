import { describe, expect, it } from 'vitest'
import { parsePayload } from './sync-mygol'

describe('MyGol parser', () => {
  it('normalizes matches, standings and stats', () => {
    const result = parsePayload({ matches: [{ id: 7, round: 2, home_team: 'Curti Zona FC', away_team: 'Rival', home_score: '3', away_score: '1' }], table: [{ rank: 1, team_name: 'Curti Zona FC', played: 1, won: 1, drawn: 0, lost: 0, goals_for: 3, goals_against: 1, pts: 3 }], stats: [{ player_id: 'peyroteo', goals: 2, assists: 1 }] })
    expect(result.matches?.[0]).toMatchObject({ round: 2, homeScore: 3, awayScore: 1 })
    expect(result.standings?.[0].points).toBe(3)
    expect(result.stats?.[0].goals).toBe(2)
  })
  it('does not replace data when shapes are unknown', () => expect(parsePayload({ hello: 'world' })).toEqual({}))
})
