import { useMemo, useState } from 'react'
import { ArrowUpRight, Bone, CalendarDays, Camera, ChevronDown, CircleAlert, Clock3, ExternalLink, Goal, Heart, Menu, ShieldCheck, Shirt, Trophy, Users, X } from 'lucide-react'
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
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <img className={`logo ${compact ? 'logo-small' : ''}`} src="/curti-zona-fc/images/official-logo.webp" alt="Curti Zona Futebol Clube" />
}

function SectionHead({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{copy && <p>{copy}</p>}</div>
}

function ExternalButton({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return <a className={`button ${dark ? 'button-dark' : ''}`} href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>
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
  const playerById = (id: string) => players.find(p => p.id === id)

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
        <div className="match-count-card">
          <div className="versus"><span>CURTI ZONA FC</span><b>VS</b><span>JAMESON FC</span></div>
          <div className="match-meta"><CalendarDays size={16}/> 27 SET · 19:00 · LISBOA</div>
          <Countdown target="2026-09-27T19:00:00+01:00" completeLabel="A bola já rolou. Vê o resultado no centro de jogos!" />
        </div>
      </section>

      <div className="ticker" aria-hidden="true"><span>SEM RECEITA MÉDICA</span><i>✦</i><span>TOMAR 1X POR SEMANA</span><i>✦</i><span>PODE CAUSAR GOLOS</span><i>✦</i><span>MANTER LONGE DO VAR</span></div>

      <section className="section history" id="história">
        <SectionHead eyebrow="A NOSSA BULA" title="Resultados secundários incluem títulos." copy="Nascemos da bola entre amigos. Depois alguém começou a contar os pontos — e a coisa ficou séria." />
        <div className="origin-card"><p className="big-quote">“Da zona para a Liga.<br/>Sem perder o sotaque.”</p><div><p>A maioria do grupo tem raízes em <strong>CNX/LAV</strong> — embora nem todos venham de lá. É a geografia afetiva desta equipa: uma bola, um grupo e um plano que sobreviveu à noite anterior.</p><p>Entretanto, alguns concretizaram uma verdadeira <strong>subida na vida</strong> e moram agora na Linha de Sintra. Continuamos a deixá-los jogar.</p></div></div>
        <div className="team-photos"><figure><img src="/curti-zona-fc/images/team-01.webp" alt="Fotografia oficial da equipa Curti Zona FC"/><figcaption>A família completa · 2026</figcaption></figure><figure><img src="/curti-zona-fc/images/team-02.webp" alt="Sete inicial do Curti Zona FC"/><figcaption>Sete pronto para jogo</figcaption></figure></div>
        <div className="instagram-archive"><div className="archive-heading"><div><p className="eyebrow">Arquivo visual</p><h3>Da época para o feed.</h3></div><a href={links.instagram} target="_blank" rel="noreferrer">Ver Instagram <ArrowUpRight size={14}/></a></div><div className="instagram-grid">{content.gallery.map(item => <a href={item.url} target="_blank" rel="noreferrer" key={item.id} aria-label={`${item.title} — abrir publicação no Instagram`}><img src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt={item.alt} width="900" height="1125" loading="lazy"/><span><b>{item.title}</b><small>{item.caption}</small></span></a>)}</div></div>
        <div className="highlight-grid">{content.highlights.map((h, i) => <article className="highlight-card" key={h.id}><span className="index">0{i + 1}</span><Trophy size={25}/><p>{h.season}</p><h3>{h.title}</h3><strong>{h.record}</strong>{h.mvp && <b className="season-mvp">MVP · {h.mvp}</b>}<span>{h.summary}</span>{h.url && <a href={h.url} target="_blank" rel="noreferrer" aria-label={`Abrir a página oficial de ${h.title}`}>Página oficial <ArrowUpRight size={13}/></a>}</article>)}</div>
      </section>

      <section className="section dark-section" id="plantel">
        <SectionHead eyebrow="POSOLOGIA RECOMENDADA" title="Nove jogadores. Uma zona." copy="O núcleo público para 2026/27. Retratos individuais entram quando houver fotografias confirmadas — aqui ninguém perde a cabeça num recorte mal feito." />
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
          <div className="match-list">{matches.length ? matches.map(match => <article className="match-row" key={match.id}><span className="round">J{match.round}</span><span className="date">{formatMatchDate(match.date)}</span><div><b>{match.home}</b><small>{match.away}</small></div><strong className="score">{match.homeScore === null ? '—' : `${match.homeScore}–${match.awayScore}`}</strong>{match.videoId && <a href={content.videos.find(v => v.id === match.videoId)?.url} target="_blank" rel="noreferrer">Vídeo</a>}</article>) : <div className="empty-state"><CircleAlert/>Ainda não há jogos nesta categoria.</div>}</div>
          {!content.videos.length && <p className="video-empty">Vídeos Sport.Video entram aqui assim que houver endereço confirmado.</p>}
        </div><aside className="standings"><h3>Classificação · 1.ª época 2026/27</h3>{official.standings.length ? official.standings.map(s => <div key={s.team}><b>{s.position}</b><span>{s.team}</span><strong>{s.points}</strong></div>) : <div className="empty-state compact"><Clock3/><p>A tabela aquece depois do apito inicial.</p></div>}<a href={links.mygol} target="_blank" rel="noreferrer">Ver classificação oficial <ArrowUpRight size={14}/></a></aside></div>
        <p className="sync-note">Fonte: MyGol · {official.syncedAt ? `sincronizado ${new Date(official.syncedAt).toLocaleDateString('pt-PT')}` : 'calendário editorial em cache'}</p>
      </section>

      <section className="section performance">
        <SectionHead eyebrow="ÁREA DESPORTIVA" title="A folha do mister." />
        <div className="performance-grid"><article className="lineup"><h3>Último 7 inicial</h3>{official.lineup.playerIds.length ? <div>{official.lineup.playerIds.map(id => <span key={id}>{playerById(id)?.nickname || playerById(id)?.name}</span>)}</div> : <div className="empty-state"><Shirt/><p><strong>O mister ainda não entregou a folha.</strong><br/>Estamos a respeitar o segredo tático.</p></div>}</article>
          <article className="stats"><h3>Números da época</h3>{official.stats.length ? official.stats.map(s => <div key={s.playerId}><span>{playerById(s.playerId)?.nickname || playerById(s.playerId)?.name}</span><b>{s.goals} G</b><b>{s.assists} A</b><b>{s.yellowCards} 🟨</b></div>) : <div className="empty-state"><Goal/><p><strong>Zeros muito bem alinhados.</strong><br/>Golos, assistências e cartões aparecem depois da estreia.</p></div>}</article>
          <article className="medical"><h3>Boletim clínico & disciplinar</h3>{content.availability.map(a => <div key={a.playerId}><span className={`status ${a.status}`}></span><div><b>{playerById(a.playerId)?.name}</b><p>{a.note}</p></div></div>)}<small>Sem detalhes médicos. O balneário agradece.</small></article>
        </div>
      </section>

      <section className="birthday"><div><p className="eyebrow light">MARCO HISTÓRICO INEVITÁVEL</p><h2>Dias até ao primeiro<br/><em>trintão do Curti Zona</em></h2><p>Diogo Carvalho · 27 de novembro de 2026</p></div><Countdown target="2026-11-27T00:00:00Z" completeLabel="Chegou o primeiro trintão 🎂" /></section>

      <section className="section news" id="notícias"><SectionHead eyebrow="ÚLTIMAS DA ZONA" title="Notícias sem contraindicações." />
        <div className="news-grid">{content.news.map((item, i) => <article className={`news-card ${i === 0 ? 'featured' : ''} ${item.id === 'logo-vote' ? 'rejected-logo' : ''}`} key={item.id}>{item.image ? <div className="news-image"><img src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt={item.id === 'logo-vote' ? 'Proposta de logótipo do Francis, rejeitada em votação' : 'Prévia bordeaux do novo equipamento'}/>{item.id === 'logo-vote' && <span>PROPOSTA REJEITADA</span>}</div> : <div className="news-art"><span>{item.category}</span></div>}<div className="news-copy"><div><span>{item.category}</span><time>{new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-PT', {day:'2-digit', month:'short'})}</time></div><h3>{item.title}</h3><p>{item.summary}</p>{item.id === 'shirts' && <a href={links.instagram} target="_blank" rel="noreferrer">Dar informações <Camera size={14}/></a>}</div></article>)}</div>
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
