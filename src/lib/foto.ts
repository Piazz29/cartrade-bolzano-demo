// Risolve una posizione della mappa FOTO: file locale in src/assets/foto/ se c'è, altrimenti Unsplash.
import type { ImageMetadata } from 'astro';
import { FOTO, type FotoKey } from '../data/foto';

const locali = import.meta.glob<{ default: ImageMetadata }>('../assets/foto/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', { eager: true });
const perNome = new Map(Object.entries(locali).map(([path, mod]) => [path.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase(), mod.default]));

export function fotoLocale(key: FotoKey): ImageMetadata | null {
  return perNome.get(FOTO[key].file) ?? null;
}

export function fotoUnsplash(key: FotoKey): { id: string; crop: string } | null {
  const f = FOTO[key] as { unsplash: string | null; crop?: string };
  return f.unsplash ? { id: f.unsplash, crop: f.crop ?? '' } : null;
}
