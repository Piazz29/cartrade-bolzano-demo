// Genera public/brands/sprite.svg con i loghi auto monocromatici di Simple Icons (licenza CC0).
// I loghi restano marchi dei rispettivi proprietari: qui sono usati per indicare le marche trattate.
// Uso: node scripts/build-brand-sprite.mjs
import * as icons from 'simple-icons';
import { writeFileSync } from 'node:fs';

export const BRANDS = [
  'volkswagen', 'audi', 'bmw', 'skoda', 'fiat', 'jeep', 'toyota', 'suzuki', 'volvo',
  'ford', 'renault', 'peugeot', 'opel', 'hyundai', 'kia', 'dacia', 'mini',
];

const key = (slug) => 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
const symbols = BRANDS.map((slug) => {
  const icon = icons[key(slug)];
  if (!icon) throw new Error(`Logo non trovato: ${slug}`);
  return `<symbol id="${slug}" viewBox="0 0 24 24"><title>${icon.title}</title><path d="${icon.path}"/></symbol>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`;
writeFileSync(new URL('../public/brands/sprite.svg', import.meta.url), svg);
writeFileSync(
  new URL('../src/data/brands.json', import.meta.url),
  JSON.stringify(BRANDS.map((slug) => ({ slug, title: icons[key(slug)].title })), null, 2) + '\n',
);
console.log(`sprite.svg: ${BRANDS.length} loghi, ${svg.length} byte`);
