// URL Unsplash ridimensionati e ritagliati lato CDN (AVIF/WebP automatici).
// TODO: con le foto reali della sede passare ad astro:assets (immagini locali ottimizzate in build).
export const unsplash = (id: string, w: number, ratio: [number, number] = [4, 3], crop = '', q?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${Math.round((w * ratio[1]) / ratio[0])}&q=${q ?? (w > 1080 ? 64 : 62)}${crop ? `&crop=${crop}` : ''}`;

export const unsplashSrcset = (id: string, widths: number[], ratio: [number, number] = [4, 3], crop = '', q?: number) =>
  widths.map((w) => `${unsplash(id, w, ratio, crop, q)} ${w}w`).join(', ');
