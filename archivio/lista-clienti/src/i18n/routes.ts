import type { Lang } from '../data/site';

export const langs: Lang[] = ['it', 'de', 'en'];

// Slug localizzati: ogni pagina ha un URL nella lingua del visitatore (meglio per la SEO locale).
export const routes = {
  home: { it: '/it/', de: '/de/', en: '/en/' },
  revisione: { it: '/it/revisione/', de: '/de/revision/', en: '/en/inspection/' },
  officina: { it: '/it/officina-carrozzeria/', de: '/de/werkstatt-karosserie/', en: '/en/workshop-bodywork/' },
  azienda: { it: '/it/azienda/', de: '/de/unternehmen/', en: '/en/about/' },
  contatti: { it: '/it/contatti/', de: '/de/kontakt/', en: '/en/contact/' },
  // Fuori dal menu: linkate da footer, Home, Revisione e calcolatore
  promemoria: { it: '/it/promemoria/', de: '/de/erinnerung/', en: '/en/reminder/' },
  privacy: { it: '/it/privacy/', de: '/de/datenschutz/', en: '/en/privacy/' },
} as const;

export type RouteKey = keyof typeof routes;

/** Tutte le versioni linguistiche di una pagina, per hreflang e selettore lingua. */
export type Alternates = Record<Lang, string>;

export const alternatesFor = (key: RouteKey): Alternates => ({ ...routes[key] });

export const navOrder: RouteKey[] = ['revisione', 'officina', 'azienda', 'contatti'];
