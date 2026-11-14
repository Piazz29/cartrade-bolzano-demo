// Modulo contatti / preventivo: validazione (lato server, fonte di verità) e testo dell'email al titolare.
// Nessun database: la richiesta arriva solo per email al titolare (site.email), con le foto allegate.
import { site, type Lang } from '../data/site';
import { routes, type RouteKey } from '../i18n/routes';

/** Destinatario fisso di tutte le richieste dei moduli: l'email del titolare pubblicata sul sito */
export const DESTINATARIO = site.email;

/** Contenuto di un'email, separato dall'impaginazione HTML (lib/email/render.ts) */
export interface Contenuto {
  lang: Lang;
  /** etichetta sopra il titolo (es. "Richiesta proveniente dal sito web") */
  etichetta?: string;
  oggetto: string;
  preheader: string;
  titolo: string;
  paragrafi: string[];
  dati?: [string, string][];
  cta?: { label: string; href: string };
  cta2?: { label: string; href: string };
  nota?: string;
  /** perché si riceve il messaggio (piè di pagina) */
  motivo: string;
}

/** Codici d'errore: il browser li traduce nella lingua della pagina */
export type ErroreCampo = 'required' | 'email' | 'phone' | 'privacy' | 'long';

const str = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max + 1) : '');
const bool = (v: unknown) => v === true || v === 'true' || v === 'on' || v === '1';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Numero in formato internazionale senza spazi. I numeri italiani senza prefisso diventano +39… */
function normalizzaTelefono(raw: string): string {
  let n = raw.replace(/[\s./()-]/g, '');
  if (n.startsWith('00')) n = `+${n.slice(2)}`;
  if (!n.startsWith('+') && /^(3\d{8,9}|0\d{5,10})$/.test(n)) n = `+39${n}`;
  return n;
}
const telefonoValido = (n: string) => /^\+\d{8,15}$/.test(n);
const normalizzaTarga = (raw: string) => raw.toUpperCase().replace(/[\s.-]/g, '');
const targaLeggibile = (t: string) => (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(t) ? `${t.slice(0, 2)} ${t.slice(2, 5)} ${t.slice(5)}` : t);

export interface RichiestaValida {
  tipo: string;
  nome: string;
  telefono: string;
  email: string;
  auto: string;
  targa: string;
  messaggio: string;
  preferenza: string;
  lingua: Lang;
  variante: 'quote' | 'contact';
  pagina: string;
}

export function validaRichiesta(f: Record<string, unknown>): { ok: true; data: RichiestaValida } | { ok: false; errors: Record<string, ErroreCampo> } {
  const errors: Record<string, ErroreCampo> = {};
  const nome = str(f.name, 80);
  const telefono = normalizzaTelefono(str(f.phone, 30));
  const email = str(f.email, 160).toLowerCase();
  const messaggio = typeof f.message === 'string' ? f.message.trim().slice(0, 4001) : '';
  const preferenza = ['phone', 'whatsapp', 'email'].includes(String(f.pref)) ? String(f.pref) : 'phone';
  if (!nome) errors.name = 'required';
  if (!telefono) errors.phone = 'required';
  else if (!telefonoValido(telefono)) errors.phone = 'phone';
  if (email && !EMAIL_RE.test(email)) errors.email = 'email';
  else if (!email && preferenza === 'email') errors.email = 'required';
  if (!messaggio) errors.message = 'required';
  else if (messaggio.length > 4000) errors.message = 'long';
  if (!bool(f.privacy)) errors.privacy = 'privacy';
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      tipo: str(f.type, 20) || 'altro',
      nome,
      telefono,
      email,
      auto: str(f.car, 80),
      targa: normalizzaTarga(str(f.plate, 14)),
      messaggio,
      preferenza,
      lingua: f.lang === 'de' || f.lang === 'en' ? f.lang : 'it',
      variante: f.variant === 'contact' ? 'contact' : 'quote',
      pagina: str(f.page, 200),
    },
  };
}

const TIPI_RICHIESTA: Record<string, string> = {
  officina: 'Officina',
  carrozzeria: 'Carrozzeria',
  gomme: 'Gomme',
  nonso: 'Da capire',
  revisione: 'Revisione',
  altro: 'Altro',
};
const PREF: Record<string, string> = { phone: 'Telefono', whatsapp: 'WhatsApp', email: 'Email' };
const NOMI_PAGINA: Partial<Record<RouteKey, string>> = {
  home: 'Home',
  revisione: 'Revisione',
  officina: 'Officina',
  carrozzeria: 'Carrozzeria',
  gomme: 'Cambio gomme',
  azienda: 'Azienda',
  contatti: 'Contatti',
};
/** Nome leggibile della pagina da cui è partita la richiesta (in qualunque lingua) */
function nomePagina(path: string) {
  const p = path.replace(/[?#].*$/, '').replace(/\/?$/, '/');
  const key = (Object.keys(routes) as RouteKey[]).find((k) => Object.values(routes[k]).includes(p as never));
  return (key && NOMI_PAGINA[key]) || path || 'sito';
}
const quando = (d: Date) =>
  new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);

/** Email per il titolare: nuova richiesta dal sito. Sempre in italiano. */
export function nuovaRichiesta(r: RichiestaValida, foto: number, ora = new Date()): Contenuto {
  const tipo = TIPI_RICHIESTA[r.tipo] ?? r.tipo;
  const cosa = r.variante === 'quote' ? 'preventivo' : 'contatto';
  const modulo = r.variante === 'quote' ? 'modulo preventivo' : 'modulo contatti';
  const tel = r.telefono.replace(/^\+39/, '');
  return {
    lang: 'it',
    etichetta: 'Richiesta proveniente dal sito web',
    oggetto: `Richiesta dal sito web · ${r.variante === 'quote' ? 'Preventivo' : 'Contatto'} ${tipo.toLowerCase()} · ${r.nome}`,
    preheader: `Richiesta proveniente dal sito web: ${r.messaggio.slice(0, 80)}`,
    titolo: `${r.nome} chiede un ${cosa}.`,
    paragrafi: [r.messaggio],
    dati: [
      ['Provenienza', `Sito web, ${modulo} (pagina ${nomePagina(r.pagina)})`],
      ['Tipo', tipo],
      ['Telefono', r.telefono],
      ...(r.email ? ([['Email', r.email]] as [string, string][]) : []),
      ...(r.auto ? ([['Auto', r.auto]] as [string, string][]) : []),
      ...(r.targa ? ([['Targa', targaLeggibile(r.targa)]] as [string, string][]) : []),
      ['Preferisce', PREF[r.preferenza] ?? r.preferenza],
      ['Lingua', { it: 'Italiano', de: 'Tedesco', en: 'Inglese' }[r.lingua]],
      ...(foto ? ([['Foto', `${foto} allegat${foto === 1 ? 'a' : 'e'}`]] as [string, string][]) : []),
    ],
    cta: r.preferenza === 'whatsapp'
      ? { label: 'Rispondi su WhatsApp', href: `https://wa.me/${r.telefono.replace(/\D/g, '')}` }
      : { label: `Chiama ${r.nome.split(' ')[0]}`, href: `tel:${r.telefono}` },
    cta2: r.email ? { label: 'Rispondi via email', href: `mailto:${r.email}` } : undefined,
    nota: `Richiesta inviata dal sito web il ${quando(ora)}. Telefono del cliente: ${tel}.${
      r.email ? ' Rispondendo a questa email scrivi direttamente al cliente.' : ' Il cliente non ha lasciato l’email: rispondi per telefono o WhatsApp.'
    }`,
    motivo: 'Email automatica del sito web Car Trade Bolzano: richiesta compilata da un cliente nel modulo online.',
  };
}
