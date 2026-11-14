// GSAP + ScrollTrigger + Lenis, caricati in modo lazy e solo dove aggiungono qualcosa:
// - [data-parallax]     foto che scorre leggermente più lenta della pagina (hero, sezioni foto)
// - [data-scrub-line]   linea di avanzamento legata allo scroll (processo revisione)
// - [data-step]         passo evidenziato quando attraversa il centro dello schermo
// Lenis (scroll morbido) solo su desktop con mouse. Con prefers-reduced-motion non si carica nulla.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopPointer = window.matchMedia('(pointer: fine) and (min-width: 64rem)').matches;
// Su mobile il parallax non vale i KB di GSAP: lo carichiamo solo per le linee di avanzamento
const needsGsap = desktopPointer
  ? document.querySelector('[data-parallax], [data-scrub-line], [data-step]')
  : document.querySelector('[data-scrub-line], [data-step]');

async function init() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);

  if (desktopPointer) {
    const { default: Lenis } = await import('lenis');
    const lenis = new Lenis({ lerp: 0.11, anchors: { offset: -80 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  if (desktopPointer) gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax || 8);
    gsap.fromTo(
      el,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>('[data-scrub-line]').forEach((el) => {
    const root = el.closest('[data-scrub-root]') ?? el.parentElement;
    gsap.fromTo(
      el,
      { scaleY: 0 },
      { scaleY: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top 62%', end: 'bottom 62%', scrub: 0.4 } },
    );
  });

  gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 62%',
      end: 'bottom 62%',
      onToggle: (self) => el.classList.toggle('is-active', self.isActive),
      onLeave: () => el.classList.add('is-done'),
      onEnterBack: () => el.classList.remove('is-done'),
    });
  });
}

if (!reduce && (needsGsap || desktopPointer)) {
  const start = () => init().catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 300);
}

export {};
