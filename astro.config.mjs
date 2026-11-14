// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Variabili del server: solo l'inoltro per email dei moduli contatti e preventivo (nessun database).
// Tutte facoltative: se mancano, il modulo conferma l'invio in modalità simulata. Documentate in .env.example.
const secret = () => envField.string({ context: 'server', access: 'secret', optional: true });

// TODO: confermare il dominio definitivo prima della messa online
export default defineConfig({
  site: 'https://cartradebolzano.it',
  trailingSlash: 'ignore',
  // Il sito resta prerenderizzato. Solo /api/richiesta è on-demand (export const prerender = false).
  adapter: vercel(),
  // Niente i18n di Astro: le rotte IT/DE/EN sono gestite a mano (src/i18n/routes.ts, slug localizzati).
  env: {
    schema: {
      RESEND_API_KEY: secret(),
      EMAIL_FROM: secret(),
    },
  },
  devToolbar: { enabled: false },
  // CSS inline nell'HTML: niente richiesta bloccante prima del primo rendering (LCP più rapido su mobile)
  build: { inlineStylesheets: 'always' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: {
    plugins: [tailwindcss()],
    // GSAP e Lenis sono importati in modo lazy: pre-ottimizzarli evita ricaricamenti in sviluppo
    optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger', 'lenis'] },
  },
});
