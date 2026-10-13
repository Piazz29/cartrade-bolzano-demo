// Ingressi leggeri con IntersectionObserver + transizioni CSS (nessuna dipendenza, non blocca l'LCP).
// [data-reveal]       sale e compare
// [data-reveal-line]  riga sottile che si allunga
// [data-draw]         linea del tetto che si disegna da sinistra
// [data-count]        numero che conta fino al valore (es. 4,5)
// [data-stagger]      sui figli diretti con [data-reveal] applica un ritardo progressivo

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function formatCount(el: HTMLElement, value: number) {
  const decimals = Number(el.dataset.decimals ?? 0);
  const locale = document.documentElement.lang === 'de' ? 'de-DE' : 'it-IT';
  el.textContent = value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function runCount(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (reduce) return formatCount(el, target);
  const dur = 1400;
  const t0 = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 4);
    formatCount(el, target * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
  const step = Number(group.dataset.stagger || 80);
  group.querySelectorAll<HTMLElement>(':scope > [data-reveal]').forEach((el, i) => {
    el.style.transitionDelay = `${i * step}ms`;
  });
});

const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-line], [data-line], [data-draw], [data-count]');

if (reduce || !('IntersectionObserver' in window)) {
  targets.forEach((el) => {
    el.classList.add('is-in');
    if (el.dataset.count) formatCount(el, Number(el.dataset.count));
  });
} else {
  // Gli elementi [data-draw] sono interamente ritagliati (clip-path) finché non entrano:
  // Chrome li considera invisibili, quindi osserviamo il loro contenitore.
  const proxy = new Map<Element, HTMLElement>();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = proxy.get(entry.target) ?? (entry.target as HTMLElement);
        el.classList.add('is-in');
        if (el.dataset.count) runCount(el);
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  targets.forEach((el) => {
    const watch = el.hasAttribute('data-draw') && el.parentElement ? el.parentElement : el;
    if (watch !== el) proxy.set(watch, el);
    io.observe(watch);
  });
}

export {};
