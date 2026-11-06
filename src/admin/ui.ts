// Piccoli aiuti per disegnare l'interfaccia dell'admin nel browser (niente framework).
// Tutto il testo che arriva dai dati passa da esc(): nessun HTML iniettato da un modulo pubblico.
import { giorniA, parseIsoDate } from '../lib/revisione';
import { ETICHETTE_INTERESSI } from '../lib/crm/campagne';
import { nomeCompleto, type Cliente, type Evento } from '../lib/crm/types';
import { svg } from '../lib/icons';
import type { Risultato } from './store';

export const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const dFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
const dShort = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });
const dtFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const data = (d: Date | string) => dFmt.format(typeof d === 'string' ? (d.length === 10 ? parseIsoDate(d) : new Date(d)) : d);
/** "oggi", "domani" o la data breve */
export const dataBreve = (d: Date) => {
  const g = giorniA(d);
  return g === 0 ? 'oggi' : g === 1 ? 'domani' : dShort.format(d);
};
export const dataOra = (iso: string) => dtFmt.format(new Date(iso));

export const targa = (t: string) => (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(t) ? `${t.slice(0, 2)} ${t.slice(2, 5)} ${t.slice(5)}` : t);
export const telefono = (t: string) => (t.startsWith('+39') ? `+39 ${t.slice(3, 6)} ${t.slice(6, 9)} ${t.slice(9)}`.trim() : t);

export function giorni(scadenza: string) {
  const g = giorniA(parseIsoDate(scadenza));
  if (g < 0) return { g, testo: `scaduta da ${-g} gg`, tono: 'err' as const };
  if (g === 0) return { g, testo: 'scade oggi', tono: 'err' as const };
  if (g <= 30) return { g, testo: `tra ${g} gg`, tono: 'warn' as const };
  return { g, testo: `tra ${g} gg`, tono: 'line' as const };
}

/** Etichetta "Nuovo" per i clienti veri, "Esempio" per quelli finti */
export const origineTag = (c: Cliente) =>
  c.esempio ? '<span class="tag tag-ex">Esempio</span>' : `<span class="tag tag-new">Nuovo</span>${c.locale ? ' <span class="tag tag-line" title="Salvato in questo browser">Locale</span>' : ''}`;

export const canaleIcon = (c: Cliente) =>
  c.canale === 'whatsapp' ? `${svg('whatsapp', 15)}<span class="sr-only">WhatsApp</span>` : `${svg('mail', 15)}<span class="sr-only">Email</span>`;

export const interessi = (c: Cliente) => c.interessi.map((i) => ETICHETTE_INTERESSI[i].it).join(', ');

export function rigaCliente(c: Cliente, opts: { flash?: boolean; side?: string } = {}) {
  const s = giorni(c.scadenza);
  return `<li><a class="row${!c.esempio ? ' is-new' : ''}${opts.flash ? ' flash' : ''}" href="/admin/cliente/?id=${encodeURIComponent(c.id)}">
    <span>
      <span class="row-name">${esc(nomeCompleto(c))}</span>
      <span class="row-meta">${origineTag(c)} <span class="plate-tag">${esc(targa(c.targa))}</span> <span class="inline-flex items-center gap-1">${canaleIcon(c)} ${c.lingua.toUpperCase()}</span>${c.consenso_offerte ? '' : ' <span title="Senza consenso alle offerte">no offerte</span>'}</span>
    </span>
    <span class="row-side">${opts.side ?? `<strong>${esc(data(c.scadenza))}</strong><span class="tag tag-${s.tono}">${esc(s.testo)}</span>`}</span>
  </a></li>`;
}

export function toast(r: Pick<Risultato, 'messaggio' | 'tono'>, ms = 5200) {
  const box = document.querySelector<HTMLElement>('[data-toasts]');
  if (!box) return;
  const el = document.createElement('div');
  el.className = `toast${r.tono === 'warn' ? ' is-warn' : r.tono === 'err' ? ' is-err' : ''}`;
  el.innerHTML = `${svg(r.tono === 'ok' ? 'check' : 'alert', 18, 'shrink-0 mt-0.5')}<span>${esc(r.messaggio)}</span>`;
  box.append(el);
  // Uscita in dissolvenza; un tocco lo chiude subito
  let via = false;
  const chiudi = () => {
    if (via) return;
    via = true;
    el.classList.add('is-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  };
  el.addEventListener('click', chiudi);
  setTimeout(chiudi, ms);
}

/** Bottone in attesa: disattivo, con aria-busy, testo che cambia */
export async function occupato<T>(btn: HTMLButtonElement, testo: string, fn: () => Promise<T>): Promise<T> {
  const html = btn.innerHTML;
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  btn.textContent = testo;
  try {
    return await fn();
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    btn.innerHTML = html;
  }
}

const NOMI_EVENTO: Record<Evento['tipo'], string> = {
  iscrizione: 'Iscrizione ai promemoria',
  benvenuto: 'Email di benvenuto',
  promemoria: 'Promemoria',
  campagna: 'Campagna',
  campagna_invio: 'Campagna inviata',
  recensione_richiesta: 'Recensione richiesta',
  recensione_ottenuta: 'Recensione ottenuta',
  visita: 'Visita in officina',
  richiesta: 'Richiesta dal sito',
};
const ESITI: Record<Evento['esito'], [string, string]> = {
  inviato: ['inviato', 'ok'],
  simulato: ['simulato', 'ex'],
  aperto: ['link aperto', 'line'],
  registrato: ['', ''],
  errore: ['non partito', 'err'],
};
const MOTIVI_VISITA: Record<string, string> = { revisione: 'revisione', tagliando: 'tagliando', carrozzeria: 'carrozzeria', gomme: 'cambio gomme', lavoro: 'lavoro completato', visita: 'visita' };

export function descriviEvento(e: Evento) {
  let titolo = NOMI_EVENTO[e.tipo];
  const d = e.dettagli as Record<string, string | number | boolean | null>;
  if (e.tipo === 'promemoria') titolo = d.regola === 'tagliando' ? 'Promemoria tagliando' : `Promemoria revisione${d.giorni ? ` · ${d.giorni} gg prima` : d.manuale ? ' · inviato a mano' : ''}`;
  if (e.tipo === 'visita' && d.motivo) titolo = `Visita · ${MOTIVI_VISITA[String(d.motivo)] ?? d.motivo}`;
  if (e.tipo === 'campagna' && d.modello) titolo = `Campagna · ${String(d.modello).replace(/-/g, ' ')}`;
  if (e.tipo === 'iscrizione' && d.origine) titolo += d.origine === 'qr' ? ' · dal QR in sede' : ' · dal sito';
  const canale = e.canale === 'email' ? 'Email' : e.canale === 'whatsapp' ? 'WhatsApp' : '';
  const [esito, tono] = ESITI[e.esito];
  return { titolo, canale, esito, tono, motivo: e.esito === 'errore' && d.motivo ? String(d.motivo).replace(/_/g, ' ') : '' };
}

export const vuoto = (titolo: string, testo: string) => `<div class="empty"><strong>${esc(titolo)}</strong>${esc(testo)}</div>`;
export const scheletro = (n = 4) => Array.from({ length: n }, () => '<div class="skeleton" aria-hidden="true"></div>').join('');
