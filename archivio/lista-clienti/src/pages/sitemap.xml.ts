import type { APIRoute } from 'astro';
import { routes, langs } from '../i18n/routes';

// Sitemap con alternative linguistiche (hreflang) per ogni pagina: gli slug IT/DE/EN sono diversi,
// quindi la generiamo noi invece di usare @astrojs/sitemap.
export const GET: APIRoute = ({ site }) => {
  const base = site!.toString().replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);
  const entry = (loc: string, p: Record<string, string>) => `  <url>
    <loc>${base}${loc}</loc>
    <lastmod>${today}</lastmod>
${langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${base}${p[l]}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${p.en}"/>
  </url>`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${Object.values(routes).flatMap((p) => langs.map((l) => entry(p[l], p))).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
