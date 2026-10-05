import { useMemo, useState } from 'react'
import { ArrowUpRight, Bone, CalendarDays, Camera, ChevronDown, CircleAlert, Clock3, ExternalLink, Goal, Heart, Menu, Play, ShieldCheck, Shirt, Trophy, Users, X } from 'lucide-react'
import playersJson from './data/players.json'
import contentJson from './data/content.json'
import officialJson from './data/official-cache.json'
import type { Availability, CareerHighlight, ClubMember, GalleryItem, NewsItem, OfficialData, Player, VideoLink } from './types'
import { Countdown } from './components/Countdown'
import { formatMatchDate, sortMatches } from './lib/time'

const players = playersJson as Player[]
const content = contentJson as { highlights: CareerHighlight[]; gallery: GalleryItem[]; availability: Availability[]; news: NewsItem[]; members: ClubMember[]; videos: VideoLink[] }
const official = officialJson as OfficialData
const links = {
  instagram: 'https://www.instagram.com/curti_zona_fc/',
  mygol: 'https://apminifootball.mygol.es/tournaments/742/teams/9157',
  cup: 'https://apminifootball.mygol.es/',
  sportVideo: 'https://watch.sport.video/associacao-portuguesa-de-minifootball/teams/curti-zona-fc-none',
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <img className={`logo ${compact ? 'logo-small' : ''}`} src={`${import.meta.env.BASE_URL}images/official-logo.webp`} alt="Curti Zona Futebol Clube" />
}

function SectionHead({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{copy && <p>{copy}</p>}</div>
}

function ExternalButton({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return <a className={`button ${dark ? 'button-dark' : ''}`} href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>
}

function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  return <article id={`noticia-${item.id}`} className={`news-card ${featured ? 'featured' : ''} ${item.squad ? 'callup-news' : ''} ${item.id === 'logo-vote' ? 'rejected-logo' : ''}`}>
    {item.image ? <div className="news-image"><img src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt={item.id === 'logo-vote' ? 'Proposta de logótipo do Francis, rejeitada em votação' : item.squad ? 'Novos equipamentos bordeaux do Curti Zona FC preparados para o primeiro jogo da época' : 'Imagem da notícia'}/>{item.id === 'logo-vote' && <span>PROPOSTA REJEITADA</span>}{item.squad && <span>NOVO EQUIPAMENTO</span>}</div> : <div className={`news-art ${item.squad ? 'callup-art' : ''}`}><span>{item.category}</span>{item.squad && <strong>10</strong>}</div>}
    <div className="news-copy"><div className="news-meta"><span>{item.category}</span><time>{new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-PT', {day:'2-digit', month:'short'})}</time></div><h3>{item.title}</h3><p>{item.summary}</p>{item.match && <div className="news-match"><strong>Curti Zona FC <b>vs</b> {item.match.opponent}</strong><span>{item.match.kickoff} · {item.match.venue}</span></div>}{item.squad && <ol className="callup-list">{item.squad.map(name => <li key={name}>{name}</li>)}</ol>}{item.notice && <p className="news-notice">{item.notice}</p>}{item.videoId && content.videos.find(video => video.id === item.videoId) && <a href={content.videos.find(video => video.id === item.videoId)!.url} target="_blank" rel="noreferrer">Ver highlights do jogo <Play size={14}/></a>}{(item.id === 'shirts' || item.id === 'recrutamento-j2') && <a href={links.instagram} target="_blank" rel="noreferrer">{item.id === 'recrutamento-j2' ? 'Quero jogar · enviar mensagem' : 'Dar informações'} <Camera size={14}/></a>}</div>
  </article>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [matchFilter, setMatchFilter] = useState<'all' | 'played' | 'next'>('all')
  const matches = useMemo(() => {
    const sorted = sortMatches(official.matches)
    if (matchFilter === 'played') return sorted.filter(m => m.homeScore !== null)
    if (matchFilter === 'next') return sorted.filter(m => m.homeScore === null)
    return sorted
  }, [matchFilter])
  const nextMatch = sortMatches(official.matches).find(m => m.homeScore === null)
  const leagueMatches = official.leagueMatches || []
  const latestRound = Math.max(1, ...leagueMatches.filter(match => match.homeScore !== null).map(match => match.round))
  const roundMatches = leagueMatches.filter(match => match.round === latestRound)
  const curtiStanding = official.standings.find(standing => standing.team === 'Curti Zona FC')
  const playerById = (id: string) => players.find(p => p.id === id)
  const selectedNews = content.news.find(item => item.id === new URLSearchParams(window.location.search).get('noticia'))

  if (selectedNews) return <>
    <header className="site-header">
      <a href={import.meta.env.BASE_URL} className="brand"><Logo compact /><span>CURTI ZONA FC</span></a>
      <a className="detail-back" href={import.meta.env.BASE_URL}>← Voltar ao site</a>
      <a className="header-social" href={links.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={19} /></a>
    </header>
    <main><section className="section news news-detail"><SectionHead eyebrow="ÚLTIMAS DA ZONA" title="Notícia da Zona." /><div className="news-grid standalone-news-grid"><NewsCard item={selectedNews} featured /></div></section></main>
    <footer><div className="footer-brand"><Logo compact/><div><b>CURTI ZONA FC</b><span>Futebol de amigos. Ambição de profissionais.</span></div></div><div className="footer-links"><a href={links.instagram}>Instagram</a><a href={links.mygol}>MyGol</a></div><p>© 2026 Curti Zona FC · Tomar com moderação.</p></footer>
  </>

  return <>
    <header className="site-header">
      <a href="#top" className="brand"><Logo compact /><span>CURTI ZONA FC</span></a>
      <nav className={menuOpen ? 'nav-open' : ''} aria-label="Navegação principal">
        {['história', 'plantel', 'jogos', 'notícias', 'família'].map(item => <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)}>{item}</a>)}
      </nav>
      <a className="header-social" href={links.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={19} /></a>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}>{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow light">1.ª ÉPOCA 2026/27 · LISBOA</p>
          <h1>Futebol<br/><em>com bula.</em></h1>
          <p className="hero-lead">Pré-época feita. Táticas alinhadíssimas.<br/>Sede crónica de vitória.</p>
          <div className="hero-actions"><ExternalButton href={links.mygol}>Próximo jogo</ExternalButton><a href="#história" className="text-link">Conhece a equipa <ChevronDown size={16}/></a></div>
        </div>
        <div className="hero-badge-wrap">
          <div className="dose-stamp">USO<br/>DESPORTIVO</div>
          <Logo />
          <p className="est">DESDE QUE NOS LEMBRAMOS</p>
        </div>
        {nextMatch && <div className="match-count-card">
          <div className="versus"><span>{nextMatch.home}</span><b>VS</b><span>{nextMatch.away}</span></div>
          <div className="match-meta"><CalendarDays size={16}/> {formatMatchDate(nextMatch.date)} · {nextMatch.venue || 'Local a confirmar'}</div>
          {nextMatch.date ? <Countdown target={nextMatch.date} completeLabel="A bola já rolou. Vê o resultado no centro de jogos!" /> : <p className="countdown-complete">Data a confirmar</p>}
        </div>}
      </section>

      <div className="ticker" aria-hidden="true"><span>SEM RECEITA MÉDICA</span><i>✦</i><span>TOMAR 1X POR SEMANA</span><i>✦</i><span>PODE CAUSAR GOLOS</span><i>✦</i><span>MANTER LONGE DO VAR</span></div>

      <section className="section history" id="história">
        <SectionHead eyebrow="A NOSSA BULA" title="Resultados secundários incluem títulos." copy="Nascemos da bola entre amigos. Depois alguém começou a contar os pontos — e a coisa ficou séria." />
        <div className="origin-card"><p className="big-quote">“Da zona para a Liga.<br/>Sem perder o sotaque.”</p><div><p>A maioria do grupo tem raízes em <strong>CNX/LAV</strong> — embora nem todos venham de lá. É a geografia afetiva desta equipa: uma bola, um grupo e um plano que sobreviveu à noite anterior.</p><p>Entretanto, alguns concretizaram uma verdadeira <strong>subida na vida</strong> e moram agora na Linha de Sintra. Continuamos a deixá-los jogar.</p></div></div>
        <div className="team-photos"><figure><img src={`${import.meta.env.BASE_URL}images/team-01.webp`} alt="Fotografia oficial da equipa Curti Zona FC"/><figcaption>A família completa · 2026</figcaption></figure><figure><img src={`${import.meta.env.BASE_URL}images/team-02.webp`} alt="Sete inicial do Curti Zona FC"/><figcaption>Sete pronto para jogo</figcaption></figure></div>
        <div className="instagram-archive"><div className="archive-heading"><div><p className="eyebrow">Arquivo visual</p><h3>Da época para o feed.</h3></div><a href={links.instagram} target="_blank" rel="noreferrer">Ver Instagram <ArrowUpRight size={14}/></a></div><div className="instagram-grid">{content.gallery.map(item => <a href={item.url} target="_blank" rel="noreferrer" key={item.id} aria-label={`${item.title} — abrir publicação no Instagram`}><img src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt={item.alt} width="900" height="1125" loading="lazy"/><span><b>{item.title}</b><small>{item.caption}</small></span></a>)}</div></div>
        <div className="highlight-grid">{content.highlights.map((h, i) => <article className="highlight-card" key={h.id}><span className="index">0{i + 1}</span><Trophy size={25}/><p>{h.season}</p><h3>{h.title}</h3><strong>{h.record}</strong>{h.mvp && <b className="season-mvp">MVP · {h.mvp}</b>}<span>{h.summary}</span>{h.url && <a href={h.url} target="_blank" rel="noreferrer" aria-label={`Abrir a página oficial de ${h.title}`}>Página oficial <ArrowUpRight size={13}/></a>}</article>)}</div>
      </section>

      <section className="section dark-section" id="plantel">
        <SectionHead eyebrow="POSOLOGIA RECOMENDADA" title={`${players.length} jogadores. Uma zona.`} copy="O núcleo público para 2026/27. Retratos individuais entram quando houver fotografias confirmadas — aqui ninguém perde a cabeça num recorte mal feito." />
        <div className="squad-grid">{players.map((player, i) => <article className="player-card" key={player.id}>
          <div className="player-photo-placeholder"><span>{String(i + 1).padStart(2, '0')}</span><Shirt size={42}/></div>
          <div className="player-number">{player.number === null ? '—' : player.number}</div>
          <div className="player-info"><p>{player.position}</p><h3>{player.nickname || player.name}</h3>{player.nickname && <span>{player.name}</span>}
            {player.zerozero && <a href={player.zerozero} target="_blank" rel="noreferrer">Zerozero <ExternalLink size={13}/></a>}
          </div>
        </article>)}</div>
        <div className="certified-grid">
          <article className="certified"><ShieldCheck/><div><p>ZEROZERO CERTIFIED</p><h3><a href="https://www.zerozero.pt/jogador/bruno-correia/923107" target="_blank" rel="noreferrer">Bruno Peyroteo Correia <ExternalLink size={14}/></a></h3><span>Cambridge City · 2017/18–2019/20<br/>Estoril Praia B · 2021/22 · 6 jogos, 1 golo</span></div><b>não é brincadeira</b></article>
          <article className="certified"><ShieldCheck/><div><p>ZEROZERO CERTIFIED</p><h3><a href="https://www.zerozero.pt/jogador/bruno-codinha/504456" target="_blank" rel="noreferrer">Bruno Codinha <ExternalLink size={14}/></a></h3><span>Formação no Santa Clara<br/>Equipa sénior · 2015/16 · 1 jogo</span></div><b>não é brincadeira</b></article>
        </div>
      </section>

      <section className="section fixtures" id="jogos">
        <SectionHead eyebrow="CENTRO DE JOGOS" title="A época, jornada a jornada." copy="Resultados e calendário oficial com cache local. Se a internet falhar, a memória do clube não falha." />
        {nextMatch && <article className="next-match"><div><p>PRÓXIMA DOSE · J{nextMatch.round}</p><h3>{nextMatch.home} <span>vs</span> {nextMatch.away}</h3><span>{formatMatchDate(nextMatch.date)} · {nextMatch.venue || 'Local a confirmar'}</span></div><ExternalButton href={links.mygol} dark>Ficha no MyGol</ExternalButton></article>}
        <div className="game-layout"><div>
          <div className="filters" role="group" aria-label="Filtrar jogos">{([['all','Todos'],['played','Resultados'],['next','Por jogar']] as const).map(([key,label]) => <button className={matchFilter === key ? 'active' : ''} onClick={() => setMatchFilter(key)} key={key}>{label}</button>)}</div>
          <div className="match-list">{matches.length ? matches.map(match => <article className="match-row" key={match.id}><span className="round">J{match.round}</span><span className="date">{formatMatchDate(match.date)}</span><div><b>{match.home}</b><small>{match.away}</small></div><strong className="score">{match.homeScore === null ? '—' : `${match.homeScore}–${match.awayScore}`}</strong>{content.videos.find(video => video.id === match.videoId || video.matchId === match.id) && <a href={content.videos.find(video => video.id === match.videoId || video.matchId === match.id)!.url} target="_blank" rel="noreferrer">Vídeo</a>}</article>) : <div className="empty-state"><CircleAlert/>Ainda não há jogos nesta categoria.</div>}</div>
          {roundMatches.length > 0 && <section className="round-results"><div className="subsection-title"><div><p className="eyebrow">SUPERLIGA LISBOA 2</p><h3>Resultados · Jornada {latestRound}</h3></div><span>Todos os jogos</span></div><div>{roundMatches.map(match => <article className={match.home === 'Curti Zona FC' || match.away === 'Curti Zona FC' ? 'curti-match' : ''} key={match.id}><time>{formatMatchDate(match.date)}</time><span>{match.home}</span><strong>{match.homeScore === null ? '—' : `${match.homeScore}–${match.awayScore}`}</strong><span>{match.away}</span></article>)}</div></section>}
        </div><aside className="standings"><h3>Classificação · 1.ª época 2026/27</h3>{official.standings.length ? <div className="standings-table"><div className="standings-head"><b>#</b><span>Equipa</span><i>J</i><i>V</i><i>E</i><i>D</i><i>DG</i><strong>Pts</strong></div>{official.standings.map(s => <div className={s.team === 'Curti Zona FC' ? 'curti-row' : ''} key={s.team}><b>{s.position}</b><span>{s.team}</span><i>{s.played}</i><i>{s.wins}</i><i>{s.draws}</i><i>{s.losses}</i><i>{s.goalsFor - s.goalsAgainst > 0 ? '+' : ''}{s.goalsFor - s.goalsAgainst}</i><strong>{s.points}</strong></div>)}</div> : <div className="empty-state compact"><Clock3/><p>A tabela aquece depois do apito inicial.</p></div>}<small>Classificação provisória enquanto o MyGol valida a jornada.</small><a href={links.mygol} target="_blank" rel="noreferrer">Ver classificação oficial <ArrowUpRight size={14}/></a></aside></div>
        <section className="match-media" id="videos" aria-labelledby="videos-heading">
          <div className="subsection-title"><div><p className="eyebrow">ZONA TV</p><h3 id="videos-heading">Lances &amp; microfones</h3></div><a href={links.sportVideo} target="_blank" rel="noreferrer">Todos os jogos na Sport.Video <ArrowUpRight size={14}/></a></div>
          <div className="media-grid">{content.videos.map(video => <article className="media-card" key={video.id}>
            {video.kind === 'interview' ? <video controls preload="none" poster={`${import.meta.env.BASE_URL}${video.poster?.replace(/^\//, '')}`} aria-label={video.title}><source src={`${import.meta.env.BASE_URL}${video.url.replace(/^\//, '')}`} type="video/mp4" />O teu navegador não suporta este vídeo.</video> : <a className="media-link" href={video.url} target="_blank" rel="noreferrer" aria-label={`Ver ${video.title} na Sport.Video`}><Play size={40} fill="currentColor" aria-hidden="true"/><span>Ver highlight <ArrowUpRight size={16}/></span></a>}
            <div className="media-caption"><span>{video.kind === 'interview' ? 'FLASH INTERVIEW' : 'HIGHLIGHT'} · {video.season}</span><h4>{video.title}</h4></div>
          </article>)}</div>
        </section>
        <p className="sync-note">Fonte: MyGol · {official.syncedAt ? `sincronizado ${new Date(official.syncedAt).toLocaleDateString('pt-PT')}` : 'calendário editorial em cache'}</p>
      </section>

      <section className="section performance">
        <SectionHead eyebrow="ÁREA DESPORTIVA" title="A folha do mister." />
        <div className="performance-grid"><article className="season-summary"><h3>Balanço da época</h3>{curtiStanding ? <div className="summary-numbers"><span><b>{curtiStanding.played}</b>Jogos</span><span><b>{curtiStanding.wins}</b>Vitórias</span><span><b>{curtiStanding.draws}</b>Empates</span><span><b>{curtiStanding.losses}</b>Derrotas</span><span><b>{curtiStanding.goalsFor}</b>Golos</span><span><b>{curtiStanding.goalsAgainst}</b>Sofridos</span><span><b>{content.videos.filter(v => v.kind === 'interview' && v.season === '2026/27').length}</b>Flash interviews</span></div> : <div className="empty-state"><Goal/><p>A época ainda está a aquecer.</p></div>}</article>
          <article className="stats"><h3>Números da época</h3>{official.stats.length ? official.stats.map(s => <div key={s.playerId}><span>{playerById(s.playerId)?.nickname || playerById(s.playerId)?.name || s.playerName || s.playerId}</span><b>{s.goals} G</b><b>{s.assists} A</b><b>{s.yellowCards} 🟨</b><b>{s.redCards} 🟥</b></div>) : <div className="empty-state"><Goal/><p><strong>Zeros muito bem alinhados.</strong><br/>Golos, assistências e cartões aparecem depois da estreia.</p></div>}</article>
          <article className="medical"><h3>Boletim clínico & disciplinar</h3>{content.availability.map(a => <div key={a.playerId}><span className={`status ${a.status}`}></span><div><b>{playerById(a.playerId)?.name}</b><p>{a.note}</p></div></div>)}<small>Sem detalhes médicos. O balneário agradece.</small></article>
        </div>
      </section>

      <section className="birthday"><div><p className="eyebrow light">MARCO HISTÓRICO INEVITÁVEL</p><h2>Dias até ao primeiro<br/><em>trintão do Curti Zona</em></h2><p>Diogo Carvalho · 27 de novembro de 2026</p></div><Countdown target="2026-11-27T00:00:00Z" completeLabel="Chegou o primeiro trintão 🎂" /></section>

      <section className="section news" id="notícias"><SectionHead eyebrow="ÚLTIMAS DA ZONA" title="Notícias sem contraindicações." />
        <div className="news-grid">{content.news.map((item, i) => <NewsCard item={item} featured={i === 0} key={item.id} />)}</div>
      </section>

      <section className="section family" id="família"><SectionHead eyebrow="FAMÍLIA CURTI ZONA" title="O plantel acaba. A equipa não." copy="Quem jogou, quem ajuda, quem puxa por nós e quem ladra quando o árbitro erra." />
        <div className="family-groups">
          {[['honorary','Antigos & honorários',Trophy],['staff','Estrutura',Users],['fans','Fãs oficiais',Heart],['dogs','Cãobancada',Bone]] .map(([group,title,Icon]) => <article key={group as string}><Icon size={23}/><h3>{title as string}</h3>{content.members.filter(m => m.group === group).map(m => <div key={m.id}><b>{m.name}</b><span>{m.role}</span></div>)}</article>)}
        </div>
      </section>

      <section className="cta"><p className="eyebrow">SEGUE O TRATAMENTO</p><h2>90 minutos não chegam<br/>para tanta zona.</h2><p>Resultados, convocatórias e conteúdos que o departamento médico não recomenda.</p><ExternalButton href={links.instagram}>Seguir no Instagram <Camera size={16}/></ExternalButton></section>
    </main>
    <footer><div className="footer-brand"><Logo compact/><div><b>CURTI ZONA FC</b><span>Futebol de amigos. Ambição de profissionais.</span></div></div><div className="footer-links"><a href={links.instagram}>Instagram</a><a href={links.mygol}>MyGol</a><a href={links.cup}>MiniFootball Cup</a></div><p>© 2026 Curti Zona FC · Tomar com moderação.</p></footer>
  </>
}

export default App
