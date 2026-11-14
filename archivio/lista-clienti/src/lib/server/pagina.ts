// Protezione delle pagine /admin/*: senza sessione valida si va al login, poi si torna alla pagina richiesta.
import type { AstroGlobal } from 'astro';
import { sessioneValida } from './security';

export function richiediLogin(Astro: AstroGlobal): Response | null {
  if (sessioneValida(Astro.cookies)) return null;
  const next = Astro.url.pathname + Astro.url.search;
  return Astro.redirect(`/admin/login/?next=${encodeURIComponent(next)}`, 302);
}
