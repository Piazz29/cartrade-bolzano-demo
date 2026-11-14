import type { Lang } from '../data/site';

export const langs: Lang[] = ['it', 'de', 'en'];

// Slug localizzati: ogni pagina ha un URL nella lingua del visitatore (meglio per la SEO locale).
export const routes = {
  home: { it: '/it/', de: '/de/', en: '/en/' },
  revisione: { it: '/it/revisione/', de: '/de/revision/', en: '/en/inspection/' },
  // Una pagina per servizio: ogni ricerca ("officina Bolzano", "carrozzeria Bolzano", "cambio gomme Bolzano")
  // ha la sua pagina dedicata. I vecchi URL (officina-carrozzeria…) reindirizzano con 301 in vercel.json.
  officina: { it: '/it/officina/', de: '/de/werkstatt/', en: '/en/car-repair/' },
  carrozzeria: { it: '/it/carrozzeria/', de: '/de/karosserie/', en: '/en/body-shop/' },
  gomme: { it: '/it/cambio-gomme/', de: '/de/reifenwechsel/', en: '/en/tyres/' },
  azienda: { it: '/it/azienda/', de: '/de/unternehmen/', en: '/en/about/' },
  contatti: { it: '/it/contatti/', de: '/de/kontakt/', en: '/en/contact/' },
  // Fuori dal menu: linkata dal footer e dai moduli
  privacy: { it: '/it/privacy/', de: '/de/datenschutz/', en: '/en/privacy/' },
} as const;

export type RouteKey = keyof typeof routes;

/** Tutte le versioni linguistiche di una pagina, per hreflang e selettore lingua. */
export type Alternates = Record<Lang, string>;

export const alternatesFor = (key: RouteKey): Alternates => ({ ...routes[key] });

export const navOrder: RouteKey[] = ['revisione', 'officina', 'carrozzeria', 'gomme', 'azienda', 'contatti'];

/** Pagine dei servizi, per i collegamenti incrociati tra una pagina e l'altra */
export const serviceKeys = ['revisione', 'officina', 'carrozzeria', 'gomme'] as const;
