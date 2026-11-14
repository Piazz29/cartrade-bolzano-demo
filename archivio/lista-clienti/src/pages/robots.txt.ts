import type { APIRoute } from 'astro';

// Area admin e API fuori dai motori di ricerca (sono anche noindex e fuori dalla sitemap).
// Nota: finché è una demo, vercel.json manda comunque "X-Robots-Tag: noindex" su tutto il sito.
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
