# Curti Zona FC

Site oficial, estático e responsivo do Curti Zona FC. Feito com React, TypeScript e Vite, sem backend.

## Começar

```bash
npm install
npm run dev
npm test
npm run build
```

O build tenta sincronizar os dados oficiais da [MyGol](https://apminifootball.mygol.es/tournaments/742/teams/9157). Se a origem estiver indisponível ou mudar de formato, mantém integralmente `src/data/official-cache.json`; uma falha externa nunca impede a publicação. Para uma API JSON oficial, definir `MYGOL_API_URL` no ambiente.

## Onde editar

- `src/data/players.json`: plantel curado, alcunhas, números e perfis Zerozero.
- `src/data/content.json`: notícias, indisponibilidades, vídeos e membros da família.
- `src/data/official-cache.json`: jogos, classificação, estatísticas e último 7.
- `public/images/`: imagens WebP; guardar os originais em `public/images/originals/`.

### Jogador ou perfil externo

Adicionar a `players.json`. O `id` é estável e liga estatísticas, disponibilidade e convocatórias. `number` pode ser `null`; `zerozero` é opcional.

```json
{"id":"exemplo","name":"Nome","nickname":"Alcunha","number":7,"position":"Ala","photo":"/images/exemplo.webp","zerozero":"https://www.zerozero.pt/..."}
```

### Notícia e fotografia

Adicionar a `content.json` em `news`. A imagem é opcional e deve apontar para um WebP local.

```json
{"id":"slug-unico","date":"2026-10-01","category":"Balneário","title":"Título","summary":"Resumo.","image":"/images/noticia.webp"}
```

Para otimizar com ImageMagick: `magick original.jpg -resize '1800x1800>' -quality 82 imagem.webp`. Manter também `original.jpg` em `public/images/originals/`.

### Resultado, vídeo e 7 inicial

Resultados sincronizados vivem em `official-cache.json`. Vídeos são manuais porque a plataforma nem sempre fornece a ligação:

```json
{"id":"j1-resumo","title":"Resumo J1","url":"https://sport.video/...","matchId":"j1"}
```

No jogo correspondente, definir `videoId: "j1-resumo"`. Para o sete inicial, preencher `lineup.matchId` e os sete `playerIds`.

### Lesão, castigo, fã ou mascote

Em `content.json`, usar `availability` com `status` igual a `injured` ou `suspended`; não incluir detalhes médicos. Em `members`, escolher `honorary`, `staff`, `fans` ou `dogs`.

## Publicação

O workflow `.github/workflows/deploy.yml` testa, sincroniza, compila e publica no GitHub Pages a cada push para `main`, todos os dias e manualmente. No repositório, selecionar **Settings → Pages → Source: GitHub Actions**. O Vite usa a base `/curti-zona-fc/`.

Antes do lançamento definitivo, adicionar o emblema e as três imagens referidas em `public/images/README.md`; o site não inventa nem apresenta a proposta do Francis como símbolo oficial.
