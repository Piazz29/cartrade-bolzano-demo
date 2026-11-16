// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Dominio definitivo (hosting Aruba)
export default defineConfig({
  site: 'https://www.cartradebz.com',
  trailingSlash: 'ignore',
  i18n: {
    locales: ['it', 'de'],
    defaultLocale: 'it',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
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
