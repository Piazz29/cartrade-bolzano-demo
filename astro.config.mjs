// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Variabili del server (lista clienti, email, admin). Tutte facoltative: se mancano,
// la demo passa da sola alla modalità simulata. Documentate in .env.example.
const secret = () => envField.string({ context: 'server', access: 'secret', optional: true });

// TODO: confermare il dominio definitivo prima della messa online
export default defineConfig({
  site: 'https://cartradebolzano.it',
  trailingSlash: 'ignore',
  // Il sito pubblico resta prerenderizzato. Solo /api/* e /admin/* sono on-demand (export const prerender = false).
  adapter: vercel(),
  i18n: {
    locales: ['it', 'de'],
    defaultLocale: 'it',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  env: {
    schema: {
      SUPABASE_URL: secret(),
      SUPABASE_SERVICE_ROLE_KEY: secret(),
      RESEND_API_KEY: secret(),
      EMAIL_FROM: secret(),
      DEMO_OWNER_EMAIL: secret(),
      DEMO_KEY: secret(),
      ADMIN_DEMO_PASSWORD: secret(),
      WHATSAPP_TOKEN: secret(),
      WHATSAPP_PHONE_ID: secret(),
      WHATSAPP_TEMPLATE: secret(),
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
