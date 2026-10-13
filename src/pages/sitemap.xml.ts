import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { routes, carUrl } from '../i18n/routes';

// Sitemap con alternative linguistiche (hreflang) per ogni pagina: gli slug IT/DE sono diversi,
// quindi la generiamo noi invece di usare @astrojs/sitemap.
export const GET: APIRoute = async ({ site }) => {
  const base = site!.toString().replace(/\/$/, '');
  const cars = await getCollection('cars');
  const pairs = [
    ...Object.values(routes).map((r) => ({ it: r.it, de: r.de })),
    ...cars.map((c) => ({ it: carUrl(c.id, 'it'), de: carUrl(c.id, 'de') })),
  ];
  const today = new Date().toISOString().slice(0, 10);
  const entry = (loc: string, p: { it: string; de: string }) => `  <url>
    <loc>${base}${loc}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="it" href="${base}${p.it}"/>
    <xhtml:link rel="alternate" hreflang="de" href="${base}${p.de}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${p.it}"/>
  </url>`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pairs.flatMap((p) => [entry(p.it, p), entry(p.de, p)]).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
