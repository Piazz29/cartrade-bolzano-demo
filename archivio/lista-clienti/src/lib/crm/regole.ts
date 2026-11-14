// Regole dei promemoria automatici e filtri del pubblico (clienti e campagne).
import { addDays, addMonths, giorniA, isoDate, parseIsoDate, startOfDay } from '../revisione';
import type { Canale, Cliente, Evento, Interesse, Lingua } from './types';

export interface Regole {
  revisione: { attiva: boolean; giorniPrima: number[] };
  tagliando: { attiva: boolean; mesiDopo: number };
}

export const REGOLE_PREDEFINITE: Regole = {
  revisione: { attiva: true, giorniPrima: [30, 7] },
  tagliando: { attiva: true, mesiDopo: 12 },
};

export type TipoPromemoria = 'revisione' | 'tagliando';

export interface Invio {
  /** chiave stabile: lo stesso promemoria non parte due volte */
  chiave: string;
  cliente: Cliente;
  tipo: TipoPromemoria;
  data: Date; // giorno dell'invio
  scadenza: Date; // scadenza revisione o data del tagliando
  giorniPrima?: number;
}

/** Data da cui contare il tagliando: ultimo tagliando registrato, altrimenti l'iscrizione se interessa il tagliando */
export const baseTagliando = (c: Cliente): Date | null =>
  c.ultimo_tagliando ? parseIsoDate(c.ultimo_tagliando) : c.interessi.includes('tagliando') ? startOfDay(new Date(c.creato_il)) : null;

const giaInviati = (eventi: Evento[]) =>
  new Set(eventi.filter((e) => e.tipo === 'promemoria' && e.esito !== 'errore').map((e) => String(e.dettagli.chiave ?? '')));

/**
 * Tutti i promemoria previsti per un cliente, dal primo non ancora inviato.
 * Un promemoria di revisione la cui data è già passata ma la scadenza no (es. iscritto a 10 giorni dalla scadenza)
 * parte subito: meglio un avviso in ritardo che nessun avviso.
 */
export function promemoriaCliente(c: Cliente, regole: Regole, eventi: Evento[], oggi = new Date()): Invio[] {
  if (!c.consenso_promemoria) return [];
  const sent = giaInviati(eventi.filter((e) => e.cliente_id === c.id));
  const today = startOfDay(oggi);
  const out: Invio[] = [];
  if (regole.revisione.attiva) {
    const scad = parseIsoDate(c.scadenza);
    const offsets = [...regole.revisione.giorniPrima].sort((a, b) => b - a);
    offsets.forEach((g, i) => {
      const chiave = `revisione:${c.scadenza}:${g}`;
      if (sent.has(chiave)) return;
      let data = addDays(scad, -g);
      const next = offsets[i + 1];
      // Se siamo già oltre la data di questo avviso ma prima del successivo, parte oggi
      if (data < today) {
        if (scad < today) return;
        if (next !== undefined && addDays(scad, -next) <= today) return;
        data = today;
      }
      out.push({ chiave, cliente: c, tipo: 'revisione', data, scadenza: scad, giorniPrima: g });
    });
  }
  if (regole.tagliando.attiva) {
    const base = baseTagliando(c);
    if (base) {
      const quando = addMonths(base, regole.tagliando.mesiDopo);
      const chiave = `tagliando:${isoDate(quando)}`;
      if (!sent.has(chiave) && giorniA(quando, oggi) > -30) {
        out.push({ chiave, cliente: c, tipo: 'tagliando', data: quando < today ? today : quando, scadenza: quando });
      }
    }
  }
  return out;
}

/** Prossimi invii di tutta la lista entro N giorni, in ordine di data */
export function prossimiInvii(clienti: Cliente[], regole: Regole, eventi: Evento[], giorni = 30, oggi = new Date()): Invio[] {
  const limite = addDays(startOfDay(oggi), giorni);
  return clienti
    .flatMap((c) => promemoriaCliente(c, regole, eventi, oggi))
    .filter((i) => i.data <= limite)
    .sort((a, b) => a.data.getTime() - b.data.getTime() || a.cliente.cognome.localeCompare(b.cliente.cognome));
}

/* ------------------------------------------------------------------ */
/* Filtri                                                              */
/* ------------------------------------------------------------------ */
export interface Filtri {
  q?: string;
  scadenzaEntro?: 0 | 30 | 60 | 90; // 0 = tutte
  interesse?: Interesse | '';
  lingua?: Lingua | '';
  canale?: Canale | '';
  offerte?: '' | 'si' | 'no';
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function filtra(clienti: Cliente[], f: Filtri, oggi = new Date()): Cliente[] {
  const q = norm(f.q?.trim() ?? '');
  return clienti.filter((c) => {
    if (q) {
      const hay = norm(`${c.nome} ${c.cognome} ${c.email} ${c.targa} ${c.telefono}`);
      if (!q.split(/\s+/).every((w) => hay.includes(w.replace(/\s/g, '')))) return false;
    }
    if (f.scadenzaEntro) {
      const g = giorniA(parseIsoDate(c.scadenza), oggi);
      if (g < 0 || g > f.scadenzaEntro) return false;
    }
    if (f.interesse && !c.interessi.includes(f.interesse)) return false;
    if (f.lingua && c.lingua !== f.lingua) return false;
    if (f.canale && c.canale !== f.canale) return false;
    if (f.offerte === 'si' && !c.consenso_offerte) return false;
    if (f.offerte === 'no' && c.consenso_offerte) return false;
    return true;
  });
}

/** Pubblico di una campagna: chi corrisponde ai filtri, separando chi non ha il consenso alle offerte */
export function pubblicoCampagna(clienti: Cliente[], f: Filtri, oggi = new Date()) {
  const { offerte: _ignored, ...rest } = f;
  const corrispondenti = filtra(clienti, rest, oggi);
  const destinatari = corrispondenti.filter((c) => c.consenso_offerte);
  return { destinatari, esclusi: corrispondenti.length - destinatari.length, totale: corrispondenti.length };
}
