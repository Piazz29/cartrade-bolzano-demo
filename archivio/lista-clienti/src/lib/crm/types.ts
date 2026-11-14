// Modello dati della lista clienti. Stessi nomi delle colonne in supabase/schema.sql.
// Usato dal server (API) e dal browser (admin, modalità simulata).
import type { RifTipo } from '../revisione';

export type Lingua = 'it' | 'de' | 'en';
export type Canale = 'email' | 'whatsapp';
export const INTERESSI = ['revisione', 'tagliando', 'carrozzeria', 'gomme'] as const;
export type Interesse = (typeof INTERESSI)[number];
export type Origine = 'qr' | 'sito' | 'admin';

export interface Cliente {
  id: string;
  creato_il: string; // ISO
  nome: string;
  cognome: string;
  email: string;
  telefono: string; // E.164 senza spazi, es. +393331234567
  targa: string; // maiuscolo, senza spazi
  rif_tipo: RifTipo;
  rif_mese: number; // 1-12
  rif_anno: number;
  scadenza: string; // AAAA-MM-GG, calcolata con lib/revisione
  ultimo_tagliando: string | null; // AAAA-MM-GG
  interessi: Interesse[];
  canale: Canale;
  lingua: Lingua;
  consenso_privacy_il: string; // ISO: quando ha preso visione dell'informativa
  consenso_promemoria: boolean;
  consenso_offerte: boolean;
  origine: Origine;
  /** solo nel browser: cliente di esempio (mai salvato su Supabase) */
  esempio?: boolean;
  /** solo nel browser: iscrizione salvata in locale perché il server non era raggiungibile */
  locale?: boolean;
}

export type TipoEvento =
  | 'iscrizione'
  | 'benvenuto'
  | 'promemoria'
  | 'campagna'
  | 'campagna_invio' // riepilogo di una campagna (cliente_id nullo)
  | 'recensione_richiesta'
  | 'recensione_ottenuta'
  | 'visita'
  | 'richiesta'; // modulo contatti o preventivo dal sito (cliente_id nullo)

export type CanaleEvento = Canale | 'sistema';
/** inviato = partito davvero · simulato = demo · aperto = link WhatsApp aperto · registrato = solo annotato · errore */
export type Esito = 'inviato' | 'simulato' | 'aperto' | 'registrato' | 'errore';

export interface Evento {
  id: string;
  cliente_id: string | null;
  tipo: TipoEvento;
  canale: CanaleEvento;
  esito: Esito;
  dettagli: Record<string, unknown>;
  creato_il: string; // ISO
}

/** Stato dei servizi esterni, letto dall'admin */
export interface StatoServizi {
  db: boolean;
  email: boolean;
  whatsappApi: boolean;
  demoKey: boolean;
}

export const nomeCompleto = (c: Pick<Cliente, 'nome' | 'cognome'>) => `${c.nome} ${c.cognome}`.trim();

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
