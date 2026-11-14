// Tracciati delle icone a tratto sottile disegnate per il sito (niente set generici).
// Unica fonte: li usano Icon.astro (pagine) e l'admin (interfaccia disegnata nel browser).
export const ICONS = {
  'phone': `<path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5Z" />`,
  'whatsapp': `<path d="M4.2 19.8l1.1-3.9A8.4 8.4 0 1 1 8.4 19l-4.2.8Z" /><path d="M9.2 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .5a6 6 0 0 0 2.6 2.4c.2.1.3.1.5 0l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .9-.6 1.8-1.6 1.9-1 .1-2.6-.3-4.4-1.9-1.6-1.5-2.3-3-2.3-4 0-.9.5-1.5.7-1.7Z" fill="currentColor" stroke="none" />`,
  'arrow': `<path d="M4 12h15m-5.5-6 6 6-6 6" />`,
  'arrow-up-right': `<path d="M7 17 17 7m-8.5 0H17v8.5" />`,
  'calendar': `<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-11ZM4 10.5h16M8.5 3.5v4M15.5 3.5v4" />`,
  'check': `<path d="m5 12.5 4.5 4.5L19 7.5" />`,
  'x': `<path d="M6 6l12 12M18 6 6 18" />`,
  'menu': `<path d="M3.5 8h17M3.5 16h17" />`,
  'pin': `<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />`,
  'clock': `<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13.5V12l3 2" />`,
  'upload': `<path d="M12 15.5V4m-4.5 4.5L12 4l4.5 4.5M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15" />`,
  'bell': `<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15L6 16.5Zm4 3.5a2 2 0 0 0 4 0" />`,
  'mail': `<path d="M3.5 6.5h17v11h-17v-11Zm0 0 8.5 6.5 8.5-6.5" />`,
  'filter': `<path d="M4 7h10m4 0h2M4 17h2m4 0h10M14 4.5v5M8 14.5v5" />`,
  'chevron': `<path d="m6 9.5 6 6 6-6" />`,
  'globe': `<circle cx="12" cy="12" r="8.75" /><path d="M3.5 12h17M12 3.25c2.25 2.4 3.4 5.3 3.4 8.75s-1.15 6.35-3.4 8.75c-2.25-2.4-3.4-5.3-3.4-8.75S9.75 5.65 12 3.25Z" />`,
  'download': `<path d="M12 4v11.5m-4.5-4.5L12 15.5l4.5-4.5M4.5 20h15" />`,
  'star': `<path d="m12 3.8 2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7L12 3.8Z" fill="currentColor" stroke="none" />`,
  'search': `<path d="M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5.3-2.2L21 21"/>`,
  'users': `<path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c.4-3.4 2.8-5.5 6-5.5s5.6 2.1 6 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.5.8 2.4 2.6 2.6 5.2"/>`,
  'send': `<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4 17-6.5Z"/>`,
  'refresh': `<path d="M19.5 12a7.5 7.5 0 0 1-13.2 4.9M4.5 12A7.5 7.5 0 0 1 17.7 7.1M18 3.5v4h-4M6 20.5v-4h4"/>`,
  'logout': `<path d="M14 4.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h8M10 12h10m-3.5-3.5L20 12l-3.5 3.5"/>`,
  'car': `<path d="M4 16.5V12l2-5.2A1.5 1.5 0 0 1 7.4 6h9.2a1.5 1.5 0 0 1 1.4.8L20 12v4.5M4 16.5h16M4 16.5V19h3v-2.5m10 0V19h3v-2.5M4 12h16M7.5 14h1m7 0h1"/>`,
  'camera': `<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.5-2.5h5.4L16.2 7h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>`,
  'plus': `<path d="M12 5v14M5 12h14"/>`,
  'grid': `<path d="M4.5 4.5h6v6h-6v-6Zm9 0h6v6h-6v-6Zm-9 9h6v6h-6v-6Zm9 0h6v6h-6v-6Z"/>`,
  'megaphone': `<path d="M4 10v4a1 1 0 0 0 1 1h2l8 4.5v-15L7 9H5a1 1 0 0 0-1 1Zm3 5 1.2 5H11l-1-4.2M18 9.5a3 3 0 0 1 0 5"/>`,
  'trash': `<path d="M5 7h14M10 7V4.5h4V7m-7 0 .8 12.5h8.4L17 7"/>`,
  'printer': `<path d="M7 9V4h10v5M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2M7 14h10v6H7v-6Z"/>`,
  'eye': `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>`,
  'more': `<path d="M5.5 12h.01M12 12h.01M18.5 12h.01" stroke-width="2.6"/>`,
  'alert': `<path d="M12 4 2.8 19.5h18.4L12 4Zm0 6v4.5m0 2.5h.01"/>`,
  'qr': `<path d="M4.5 4.5h5v5h-5v-5Zm10 0h5v5h-5v-5Zm-10 10h5v5h-5v-5ZM14.5 14.5h2v2h-2v-2Zm3 3h2v2h-2v-2Zm-3 2h1m4-5h-1"/>`,
  'wrench': `<path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-1 1-2.3-.4-8.9 8.9a2 2 0 0 1-2.8-2.8l8.9-8.9L14.5 8.5l1-1-1-1Z"/>`,
  'sun': `<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6m12 12 1.4 1.4M2.5 12h2m15 0h2M4.6 19.4 6 18M18 6l1.4-1.4"/>`,
  'moon': `<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z"/>`,
} as const;

export type IconName = keyof typeof ICONS;

/** SVG completo come stringa (per l'interfaccia disegnata in JavaScript) */
export const svg = (name: IconName, size = 20, cls = '') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ''}>${ICONS[name]}</svg>`;
