export interface Player { id: string; name: string; nickname?: string; number: number | null; position: string; photo?: string; bio?: string; zerozero?: string }
export interface CareerHighlight { id: string; title: string; season: string; summary: string; record?: string; url?: string }
export interface Availability { playerId: string; status: 'available' | 'injured' | 'suspended'; note: string; since?: string }
export interface NewsItem { id: string; date: string; title: string; summary: string; category: string; image?: string }
export interface Match { id: string; round: number; date: string | null; home: string; away: string; homeScore: number | null; awayScore: number | null; venue?: string; videoId?: string }
export interface PlayerStats { playerId: string; appearances: number; goals: number; assists: number; yellowCards: number; redCards: number }
export interface Lineup { matchId: string | null; playerIds: string[] }
export interface VideoLink { id: string; title: string; url: string; matchId?: string; playerId?: string }
export interface ClubMember { id: string; name: string; role: string; group: 'honorary' | 'staff' | 'fans' | 'dogs' }
export interface Standing { position: number; team: string; played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number }
export interface OfficialData { syncedAt: string | null; source: string; matches: Match[]; standings: Standing[]; stats: PlayerStats[]; lineup: Lineup }
