import type { Lang } from '../data/site';

export const langs: Lang[] = ['it', 'de'];

// Slug localizzati: ogni pagina ha un URL nella lingua del visitatore (meglio per la SEO locale).
export const routes = {
  home: { it: '/it/', de: '/de/' },
  revisione: { it: '/it/revisione/', de: '/de/revision/' },
  officina: { it: '/it/officina-carrozzeria/', de: '/de/werkstatt-karosserie/' },
  showroom: { it: '/it/auto/', de: '/de/fahrzeuge/' },
  azienda: { it: '/it/azienda/', de: '/de/unternehmen/' },
  contatti: { it: '/it/contatti/', de: '/de/kontakt/' },
  // Fuori dal menu: linkate da footer, Home, Revisione e calcolatore
  promemoria: { it: '/it/promemoria/', de: '/de/erinnerung/' },
  privacy: { it: '/it/privacy/', de: '/de/datenschutz/' },
} as const;

export type RouteKey = keyof typeof routes;

export const carUrl = (slug: string, lang: Lang) => `${routes.showroom[lang]}${slug}/`;

/** Tutte le versioni linguistiche di una pagina, per hreflang e selettore lingua. */
export type Alternates = Record<Lang, string>;

export const alternatesFor = (key: RouteKey): Alternates => ({ ...routes[key] });

export const navOrder: RouteKey[] = ['revisione', 'officina', 'showroom', 'azienda', 'contatti'];
