import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Match, OfficialData, PlayerStats, Standing } from '../src/types'

const TEAM_URL = 'https://apminifootball.mygol.es/api/teams/9157/details/742'
const cachePath = resolve('src/data/official-cache.json')
const number = (value: unknown): number | null => value === '' || value == null || Number.isNaN(Number(value)) ? null : Number(value)
const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''

function objects(value: unknown): Record<string, unknown>[] {
  if (!value || typeof value !== 'object') return []
  const current = value as Record<string, unknown>
  return [current, ...Object.values(current).flatMap(objects)]
}

export function parsePayload(payload: unknown): Partial<OfficialData> {
  const all = objects(payload)
  const root = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const officialDays = Array.isArray(root.days) ? root.days as Record<string, unknown>[] : []
  const dayMatches: Match[] = officialDays.flatMap((day, dayIndex) => {
    const raw = Array.isArray(day.matches) ? day.matches as Record<string, unknown>[] : []
    return raw.map((match, matchIndex) => {
      const homeTeam = match.homeTeam as Record<string, unknown> | undefined
      const visitorTeam = match.visitorTeam as Record<string, unknown> | undefined
      const scheduled = (number(match.status) ?? 0) <= 1
      const dateValue = text(match.startTime)
      return {
        id: text(match.id) || `mygol-${dayIndex + 1}-${matchIndex + 1}`,
        round: dayIndex + 1,
        date: dateValue ? lisbonDate(dateValue) : null,
        home: text(homeTeam?.name), away: text(visitorTeam?.name),
        homeScore: scheduled ? null : number(match.visibleHomeScore ?? match.homeScore),
        awayScore: scheduled ? null : number(match.visibleVisitorScore ?? match.visitorScore),
        venue: text((match.field as Record<string, unknown> | undefined)?.name) || undefined,
      }
    })
  }).filter(match => match.home && match.away)
  const rawMatches = all.filter(o => ('homeTeam' in o || 'local_team' in o || 'home_team' in o) && ('awayTeam' in o || 'visitor_team' in o || 'away_team' in o))
  const matches: Match[] = rawMatches.map((o, index) => {
    const home = text(o.homeTeam ?? o.local_team ?? o.home_team)
    const away = text(o.awayTeam ?? o.visitor_team ?? o.away_team)
    return {
      id: text(o.id) || `mygol-${index + 1}`,
      round: number(o.round ?? o.journey ?? o.matchday) ?? index + 1,
      date: text(o.date ?? o.start_at ?? o.datetime) || null,
      home,
      away,
      homeScore: number(o.homeScore ?? o.local_score ?? o.home_score),
      awayScore: number(o.awayScore ?? o.visitor_score ?? o.away_score),
      venue: text(o.venue ?? o.field) || undefined,
    }
  }).filter(m => m.home && m.away)

  const rawStandings = all.filter(o => ('points' in o || 'pts' in o) && ('team' in o || 'team_name' in o) && ('position' in o || 'rank' in o))
  const standings: Standing[] = rawStandings.map(o => ({
    position: number(o.position ?? o.rank) ?? 0, team: text(o.team ?? o.team_name),
    played: number(o.played ?? o.matches_played) ?? 0, wins: number(o.wins ?? o.won) ?? 0,
    draws: number(o.draws ?? o.drawn) ?? 0, losses: number(o.losses ?? o.lost) ?? 0,
    goalsFor: number(o.goalsFor ?? o.goals_for) ?? 0, goalsAgainst: number(o.goalsAgainst ?? o.goals_against) ?? 0,
    points: number(o.points ?? o.pts) ?? 0,
  })).filter(s => s.team)

  const rawStats = all.filter(o => ('playerId' in o || 'player_id' in o) && ('goals' in o || 'assists' in o))
  const stats: PlayerStats[] = rawStats.map(o => ({
    playerId: text(o.playerId ?? o.player_id), appearances: number(o.appearances ?? o.played) ?? 0,
    goals: number(o.goals) ?? 0, assists: number(o.assists) ?? 0,
    yellowCards: number(o.yellowCards ?? o.yellow_cards) ?? 0, redCards: number(o.redCards ?? o.red_cards) ?? 0,
  })).filter(s => s.playerId)
  return { ...(dayMatches.length ? { matches: dayMatches } : matches.length ? { matches } : {}), ...(standings.length ? { standings } : {}), ...(stats.length ? { stats } : {}) }
}

function lisbonDate(value: string) {
  if (/[zZ]|[+-]\d\d:\d\d$/.test(value)) return value
  const guess = new Date(`${value}Z`)
  const zone = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Lisbon', timeZoneName: 'longOffset' }).formatToParts(guess).find(part => part.type === 'timeZoneName')?.value
  const offset = zone?.replace('GMT', '') || '+00:00'
  return `${value}${offset === '+01:00' ? '+01:00' : '+00:00'}`
}

function payloadsFromHtml(html: string): unknown[] {
  const results: unknown[] = []
  for (const match of html.matchAll(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { results.push(JSON.parse(match[1])) } catch { /* unrelated script */ }
  }
  return results
}

async function sync() {
  const cached = JSON.parse(await readFile(cachePath, 'utf8')) as OfficialData
  try {
    const endpoint = process.env.MYGOL_API_URL || TEAM_URL
    const response = await fetch(endpoint, { headers: { 'user-agent': 'CurtiZonaFC-site/1.0' }, signal: AbortSignal.timeout(8_000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const body = await response.text()
    const candidates = body.trim().startsWith('{') || body.trim().startsWith('[') ? [JSON.parse(body)] : payloadsFromHtml(body)
    const details = candidates[0] as Record<string, unknown> | undefined
    if (!process.env.MYGOL_API_URL && details && Array.isArray(details.days)) {
      const days = details.days as Record<string, unknown>[]
      const firstMatch = ((days[0]?.matches as Record<string, unknown>[] | undefined)?.[0])
      const stageId = number(firstMatch?.idStage)
      const teamNames = new Map<number, string>()
      for (const day of days) for (const match of (day.matches as Record<string, unknown>[] || [])) {
        for (const side of ['homeTeam', 'visitorTeam']) {
          const team = match[side] as Record<string, unknown> | undefined
          const id = number(team?.id)
          if (id) teamNames.set(id, text(team?.name))
        }
      }
      if (stageId) {
        const tableResponse = await fetch(`https://apminifootball.mygol.es/api/tournaments/stageclassification/${stageId}`, { signal: AbortSignal.timeout(8_000) })
        if (tableResponse.ok) {
          const table = await tableResponse.json() as { leagueClassification?: Record<string, unknown>[] }
          details.standings = (table.leagueClassification || []).map((row, index) => ({
            position: index + 1, team: teamNames.get(number(row.idTeam) || 0) || `Equipa ${row.idTeam}`,
            played: row.gamesPlayed, wins: row.gamesWon, draws: row.gamesDraw, losses: row.gamesLost,
            goalsFor: row.points, goalsAgainst: row.pointsAgainst, points: row.tournamentPoints,
          }))
        }
      }
      const playerIds: Record<string, string> = {
        'Diogo Carvalho': 'diogo', 'André Lopes': 'andre', 'Pedro Correia': 'pedrinho',
        'Bruno Correia': 'peyroteo', 'Bruno Codinha': 'codinha', 'Francisco Gonçalves': 'francis',
        'Jorge Ambrósio': 'jorge', 'Filipe Campos': 'filipe', 'João Figueira': 'jonicas',
      }
      details.stats = ((details.players as Record<string, unknown>[] | undefined) || []).flatMap(player => {
        const id = playerIds[`${text(player.name)} ${text(player.surname)}`]
        if (!id) return []
        const summary = player.dayResultSummary as Record<string, unknown> | undefined
        if ((number(summary?.gamesPlayed) ?? 0) === 0) return []
        return [{ playerId: id, appearances: summary?.gamesPlayed, goals: summary?.points, assists: summary?.assistances, yellowCards: summary?.cardsType1, redCards: summary?.cardsType2 }]
      })
    }
    const parsed = candidates.map(parsePayload).reduce((acc, item) => ({ ...acc, ...item }), {})
    if (!parsed.matches && !parsed.standings && !parsed.stats) throw new Error('formato MyGol não reconhecido')
    const next: OfficialData = { ...cached, ...parsed, syncedAt: new Date().toISOString(), source: endpoint }
    await writeFile(cachePath, `${JSON.stringify(next, null, 2)}\n`)
    console.log(`MyGol: cache atualizado (${next.matches.length} jogos).`)
  } catch (error) {
    console.warn(`MyGol indisponível; build continua com cache local. ${error instanceof Error ? error.message : error}`)
  }
}

if (process.env.VITEST !== 'true') await sync()
