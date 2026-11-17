import type { APIRoute } from 'astro';

// Tutto il sito è aperto ai motori di ricerca e ai motori di risposta AI (GEO): vogliamo che citino
// orari, indirizzo, tariffa della revisione e regole sulle gomme. Restano fuori solo le API (non sono pagine).
// Gli assistenti AI sono elencati per nome: alcuni leggono solo le regole scritte per loro.
const AI_BOTS = [
  'Googlebot',
  'Bingbot',
  'Google-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Applebot-Extended',
  'DuckAssistBot',
  'MistralAI-User',
  'CCBot',
];

export const GET: APIRoute = ({ site }) => {
  const rules = (ua: string) => `User-agent: ${ua}\nAllow: /\nDisallow: /api/\n`;
  const body = [rules('*'), ...AI_BOTS.map(rules), `Sitemap: ${new URL('/sitemap.xml', site).href}\n`].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
