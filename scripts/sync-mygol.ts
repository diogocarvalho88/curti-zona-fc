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
    playerId: text(o.playerId ?? o.player_id), playerName: text(o.playerName ?? o.player_name) || undefined, appearances: number(o.appearances ?? o.played) ?? 0,
    goals: number(o.goals) ?? 0, assists: number(o.assists) ?? 0,
    yellowCards: number(o.yellowCards ?? o.yellow_cards) ?? 0, redCards: number(o.redCards ?? o.red_cards) ?? 0,
  })).filter(s => s.playerId)
  return { ...(dayMatches.length ? { matches: dayMatches } : matches.length ? { matches } : {}), ...(standings.length ? { standings } : {}), ...(stats.length ? { stats } : {}) }
}

export function standingsFromMatches(matches: Match[]): Standing[] {
  const teams = new Map<string, Omit<Standing, 'position'>>()
  const row = (team: string) => {
    const current = teams.get(team) || { team, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
    teams.set(team, current)
    return current
  }
  for (const match of matches) {
    if (match.homeScore === null || match.awayScore === null) continue
    const home = row(match.home)
    const away = row(match.away)
    home.played += 1
    away.played += 1
    home.goalsFor += match.homeScore
    home.goalsAgainst += match.awayScore
    away.goalsFor += match.awayScore
    away.goalsAgainst += match.homeScore
    if (match.homeScore > match.awayScore) {
      home.wins += 1
      away.losses += 1
      home.points += 3
    } else if (match.homeScore < match.awayScore) {
      away.wins += 1
      home.losses += 1
      away.points += 3
    } else {
      home.draws += 1
      away.draws += 1
      home.points += 1
      away.points += 1
    }
  }
  return [...teams.values()]
    .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor || a.team.localeCompare(b.team, 'pt'))
    .map((standing, index) => ({ ...standing, position: index + 1 }))
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
    const response = await fetch(endpoint, { headers: { 'user-agent': 'CurtiZonaFC-site/1.0' }, signal: AbortSignal.timeout(20_000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const body = await response.text()
    const candidates = body.trim().startsWith('{') || body.trim().startsWith('[') ? [JSON.parse(body)] : payloadsFromHtml(body)
    const details = candidates[0] as Record<string, unknown> | undefined
    let leagueMatches: Match[] | undefined
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
        const tableResponse = await fetch(`https://apminifootball.mygol.es/api/tournaments/stageclassification/${stageId}`, { signal: AbortSignal.timeout(20_000) })
        if (tableResponse.ok) {
          const table = await tableResponse.json() as { leagueClassification?: Record<string, unknown>[] }
          details.standings = (table.leagueClassification || []).map((row, index) => ({
            position: index + 1, team: teamNames.get(number(row.idTeam) || 0) || `Equipa ${row.idTeam}`,
            played: row.gamesPlayed, wins: row.gamesWon, draws: row.gamesDraw, losses: row.gamesLost,
            goalsFor: row.points, goalsAgainst: row.pointsAgainst, points: row.tournamentPoints,
          }))
        }
      }
      const tournamentId = number(firstMatch?.idTournament)
      if (tournamentId) {
        const calendarResponse = await fetch(`https://apminifootball.mygol.es/api/matches/fortournament/${tournamentId}`, { signal: AbortSignal.timeout(20_000) })
        if (calendarResponse.ok) {
          const calendar = await calendarResponse.json() as Record<string, unknown>[]
          leagueMatches = calendar.flatMap((day, dayIndex) => {
            const round = number(day.sequenceOrder) ?? dayIndex + 1
            return ((day.matches as Record<string, unknown>[] | undefined) || []).flatMap((match, matchIndex) => {
              const home = teamNames.get(number(match.idHomeTeam) || 0)
              const away = teamNames.get(number(match.idVisitorTeam) || 0)
              if (!home || !away) return []
              const status = number(match.status) ?? 0
              const dateValue = text(match.startTime)
              return [{
                id: text(match.id) || `league-${round}-${matchIndex + 1}`,
                round,
                date: dateValue ? lisbonDate(dateValue) : null,
                home,
                away,
                homeScore: status <= 1 ? null : number(match.visibleHomeScore ?? match.homeScore),
                awayScore: status <= 1 ? null : number(match.visibleVisitorScore ?? match.visitorScore),
                venue: text((match.field as Record<string, unknown> | undefined)?.name) || undefined,
                status,
              }]
            })
          })
          const provisional = standingsFromMatches(leagueMatches)
          const officialPlayed = ((details.standings as Standing[] | undefined) || []).reduce((sum, standing) => sum + standing.played, 0)
          const provisionalPlayed = provisional.reduce((sum, standing) => sum + standing.played, 0)
          if (provisionalPlayed > officialPlayed) details.standings = provisional
        }
      }
      const playerIds: Record<string, string> = {
        'Diogo Carvalho': 'diogo', 'André Lopes': 'andre', 'Pedro Correia': 'pedrinho',
        'Bruno Correia': 'peyroteo', 'Bruno Codinha': 'codinha', 'Francisco Gonçalves': 'francis',
        'Jorge Ambrósio': 'jorge', 'Filipe Campos': 'filipe', 'João Figueira': 'jonicas',
      }
      details.stats = ((details.players as Record<string, unknown>[] | undefined) || []).flatMap(player => {
        const playerName = `${text(player.name)} ${text(player.surname)}`
        const id = playerIds[playerName] || `mygol-${number(player.id) ?? playerName.toLowerCase().replace(/\s+/g, '-')}`
        const summary = player.dayResultSummary as Record<string, unknown> | undefined
        const appearances = number(summary?.gamesPlayed) ?? 0
        const goals = number(summary?.points) ?? 0
        const assists = number(summary?.assistances) ?? 0
        const manualYellowCards: Record<string, number> = { 'André Lopes': 1 }
        const yellowCards = Math.max(number(summary?.cardsType1) ?? 0, manualYellowCards[playerName] ?? 0)
        const redCards = number(summary?.cardsType2) ?? 0
        if (appearances + goals + assists + yellowCards + redCards === 0) return []
        return [{ playerId: id, playerName, appearances, goals, assists, yellowCards, redCards }]
      })
    }
    const parsed = candidates.map(parsePayload).reduce((acc, item) => ({ ...acc, ...item }), {})
    if (!parsed.matches && !parsed.standings && !parsed.stats) throw new Error('formato MyGol não reconhecido')
    const next: OfficialData = { ...cached, ...parsed, ...(leagueMatches ? { leagueMatches } : {}), syncedAt: new Date().toISOString(), source: endpoint }
    await writeFile(cachePath, `${JSON.stringify(next, null, 2)}\n`)
    console.log(`MyGol: cache atualizado (${next.matches.length} jogos).`)
  } catch (error) {
    console.warn(`MyGol indisponível; build continua com cache local. ${error instanceof Error ? error.message : error}`)
  }
}

if (process.env.VITEST !== 'true') await sync()
