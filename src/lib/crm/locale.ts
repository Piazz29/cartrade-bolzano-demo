// Archivio nel browser per la MODALITÀ SIMULATA (Supabase non configurato o rete assente).
// La pagina di iscrizione ci salva l'iscrizione; l'admin, sullo stesso browser, la mostra come "Nuovo".
// Ogni accesso è protetto da try/catch: in navigazione privata o con lo storage bloccato si lavora in memoria.
import type { Auto, Cliente, Evento } from './types';

export interface Archivio {
  clienti: Cliente[];
  eventi: Evento[];
  auto: Auto[];
}

const memoria = new Map<string, string>();

export function leggi<T>(chiave: string, vuoto: T): T {
  try {
    const raw = localStorage.getItem(chiave) ?? memoria.get(chiave);
    return raw ? (JSON.parse(raw) as T) : vuoto;
  } catch {
    const raw = memoria.get(chiave);
    return raw ? (JSON.parse(raw) as T) : vuoto;
  }
}

export function scrivi(chiave: string, valore: unknown) {
  const raw = JSON.stringify(valore);
  memoria.set(chiave, raw);
  try {
    localStorage.setItem(chiave, raw);
  } catch {
    /* storage pieno o bloccato: resta in memoria */
  }
}

export const cancella = (chiave: string) => {
  memoria.delete(chiave);
  try {
    localStorage.removeItem(chiave);
  } catch {
    /* niente */
  }
};

/** Iscrizioni e azioni "vere" salvate in locale (stesso browser) */
export const CHIAVE_LOCALI = 'ct-demo-locali-v1';
export const archivioLocale = (): Archivio => ({ clienti: [], eventi: [], auto: [], ...leggi<Partial<Archivio>>(CHIAVE_LOCALI, {}) });
export const salvaLocale = (a: Archivio) => scrivi(CHIAVE_LOCALI, a);
