import { describe, expect, it } from 'vitest'
import { seasonRecord, seasonStats } from './season'
import league from '../data/official-cache.json'

describe('season including the cup', () => {
  it('adds cup goals and cards without changing league data or double counting on rerender', () => {
    const before = JSON.stringify(league.stats)
    const cup = [{ playerId: 'peyroteo', appearances: 1, goals: 1, assists: 0, yellowCards: 0, redCards: 0 },
      { playerId: 'andre', appearances: 1, goals: 0, assists: 0, yellowCards: 1, redCards: 0 }]
    const combined = seasonStats(league.stats, cup)
    expect(combined.find(s => s.playerId === 'peyroteo')?.goals).toBe(league.stats.find(s => s.playerId === 'peyroteo')!.goals + 1)
    expect(combined.find(s => s.playerId === 'andre')?.yellowCards).toBe(league.stats.find(s => s.playerId === 'andre')!.yellowCards + 1)
    expect(seasonStats(league.stats, cup)).toEqual(combined)
    expect(JSON.stringify(league.stats)).toBe(before)
  })
  it('counts the home cup loss and away league win while excluding unplayed fixtures', () => {
    expect(seasonRecord([
      { id: 'a', round: 1, date: null, home: 'Curti Zona FC', away: 'Taberna', homeScore: 2, awayScore: 3 },
      { id: 'b', round: 2, date: null, home: 'Póvoa', away: 'Curti Zona FC', homeScore: 3, awayScore: 4 },
      { id: 'c', round: 3, date: null, home: 'Curti Zona FC', away: 'Rival', homeScore: null, awayScore: null },
    ])).toEqual({ played: 2, wins: 1, draws: 0, losses: 1, goalsFor: 6, goalsAgainst: 6 })
  })
})
