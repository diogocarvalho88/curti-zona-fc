import sharp from 'sharp'
import { resolve } from 'node:path'

const imageDir = resolve('public/images')
const jobs = [
  ['official-logo.jpg', 'official-logo.webp', 800],
  ['team-01.jpg', 'team-01.webp', 1800],
  ['team-02.jpg', 'team-02.webp', 1800],
]

await Promise.all(jobs.map(([input, output, width]) => sharp(resolve(imageDir, 'originals', input))
  .rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 })
  .toFile(resolve(imageDir, output))))

console.log('Imagens oficiais otimizadas em WebP.')
