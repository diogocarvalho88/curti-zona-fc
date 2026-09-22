import { describe, expect, it } from 'vitest'
import { formatMatchDate, getTimeLeft, sortMatches } from './time'

describe('countdowns', () => {
  it('counts down to the Lisbon kickoff', () => {
    expect(getTimeLeft('2026-09-27T19:00:00+01:00', new Date('2026-09-26T18:00:00Z'))).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 0, complete: false })
  })
  it('switches to complete after the birthday', () => {
    expect(getTimeLeft('2026-11-27T00:00:00Z', new Date('2026-11-27T00:00:01Z')).complete).toBe(true)
  })
  it('uses Lisbon time and sorts rounds', () => {
    expect(formatMatchDate('2026-09-27T19:00:00+01:00')).toMatch(/27.*19:00/)
    expect(sortMatches([{ round: 3 }, { round: 1 }]).map(x => x.round)).toEqual([1, 3])
  })
})
