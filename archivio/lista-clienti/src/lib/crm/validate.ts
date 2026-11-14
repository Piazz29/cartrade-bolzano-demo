// Validazione dell'iscrizione ai promemoria. Stessa funzione nel browser (feedback immediato)
// e sul server (fonte di verità): il server non si fida mai di quello che arriva dal modulo.
import { INTERESSI, type Canale, type Interesse, type Lingua } from './types';
import { calcolaScadenza, isoDate, type RifTipo } from '../revisione';

export interface IscrizioneInput {
  nome?: unknown;
  cognome?: unknown;
  email?: unknown;
  telefono?: unknown;
  targa?: unknown;
  rif_tipo?: unknown;
  rif_mese?: unknown;
  rif_anno?: unknown;
  interessi?: unknown;
  canale?: unknown;
  lingua?: unknown;
  consenso_privacy?: unknown;
  consenso_promemoria?: unknown;
  consenso_offerte?: unknown;
}

export interface IscrizioneValida {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  targa: string;
  rif_tipo: RifTipo;
  rif_mese: number;
  rif_anno: number;
  scadenza: string;
  interessi: Interesse[];
  canale: Canale;
  lingua: Lingua;
  consenso_promemoria: boolean;
  consenso_offerte: boolean;
}

/** Codici d'errore: il browser li traduce nella lingua della pagina */
export type ErroreCampo = 'required' | 'email' | 'phone' | 'plate' | 'date' | 'future' | 'privacy' | 'nothing' | 'long';
export type Errori = Partial<Record<keyof IscrizioneInput, ErroreCampo>>;

const str = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max + 1) : '');
const bool = (v: unknown) => v === true || v === 'true' || v === 'on' || v === '1';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Numero in formato internazionale senza spazi. I cellulari italiani senza prefisso diventano +39… */
export function normalizzaTelefono(raw: string): string {
  let n = raw.replace(/[\s./()-]/g, '');
  if (n.startsWith('00')) n = `+${n.slice(2)}`;
  // Cellulari (3…) e fissi (0…) italiani scritti senza prefisso
  if (!n.startsWith('+') && /^(3\d{8,9}|0\d{5,10})$/.test(n)) n = `+39${n}`;
  return n;
}
export const telefonoValido = (n: string) => /^\+\d{8,15}$/.test(n);

export const normalizzaTarga = (raw: string) => raw.toUpperCase().replace(/[\s.-]/g, '');
/** Targhe italiane (AA000AA) e, per chi arriva da fuori, formati alfanumerici da 5 a 10 caratteri */
export const targaValida = (t: string) => /^[A-Z0-9]{5,10}$/.test(t) && /\d/.test(t) && /[A-Z]/.test(t);

export function validaIscrizione(input: IscrizioneInput, oggi = new Date()): { ok: true; data: IscrizioneValida } | { ok: false; errors: Errori } {
  const errors: Errori = {};
  const nome = str(input.nome, 60);
  const cognome = str(input.cognome, 60);
  const email = str(input.email, 160).toLowerCase();
  const telefono = normalizzaTelefono(str(input.telefono, 30));
  const targa = normalizzaTarga(str(input.targa, 14));
  const canale: Canale = input.canale === 'whatsapp' ? 'whatsapp' : 'email';
  const lingua: Lingua = input.lingua === 'de' || input.lingua === 'en' ? input.lingua : 'it';
  const rif_tipo: RifTipo = input.rif_tipo === 'reg' ? 'reg' : 'rev';
  const rif_mese = Number(input.rif_mese);
  const rif_anno = Number(input.rif_anno);
  const interessiRaw = Array.isArray(input.interessi) ? input.interessi : typeof input.interessi === 'string' ? [input.interessi] : [];
  const interessi = [...new Set(interessiRaw.filter((i): i is Interesse => (INTERESSI as readonly string[]).includes(String(i))))];
  const consenso_promemoria = bool(input.consenso_promemoria);
  const consenso_offerte = bool(input.consenso_offerte);

  if (!nome) errors.nome = 'required';
  else if (nome.length > 60) errors.nome = 'long';
  if (!cognome) errors.cognome = 'required';
  else if (cognome.length > 60) errors.cognome = 'long';
  if (!email) errors.email = 'required';
  else if (!EMAIL_RE.test(email) || email.length > 160) errors.email = 'email';
  // Il telefono serve solo se il canale scelto è WhatsApp
  if (telefono && !telefonoValido(telefono)) errors.telefono = 'phone';
  else if (!telefono && canale === 'whatsapp') errors.telefono = 'required';
  if (!targa) errors.targa = 'required';
  else if (!targaValida(targa)) errors.targa = 'plate';

  const annoMin = oggi.getFullYear() - 40;
  if (!Number.isInteger(rif_mese) || rif_mese < 1 || rif_mese > 12 || !Number.isInteger(rif_anno) || rif_anno < annoMin) {
    errors.rif_mese = 'date';
  } else if (rif_anno > oggi.getFullYear() || (rif_anno === oggi.getFullYear() && rif_mese > oggi.getMonth() + 1)) {
    errors.rif_mese = 'future';
  }
  if (!bool(input.consenso_privacy)) errors.consenso_privacy = 'privacy';
  if (!consenso_promemoria && !consenso_offerte) errors.consenso_promemoria = 'nothing';

  if (Object.keys(errors).length) return { ok: false, errors };
  const scadenza = isoDate(calcolaScadenza(rif_tipo, rif_mese, rif_anno, oggi).date);
  return {
    ok: true,
    data: { nome, cognome, email, telefono, targa, rif_tipo, rif_mese, rif_anno, scadenza, interessi, canale, lingua, consenso_promemoria, consenso_offerte },
  };
}

/** Modulo contatti / preventivo (destinatario fisso: il titolare) */
export interface RichiestaValida {
  tipo: string;
  nome: string;
  telefono: string;
  email: string;
  auto: string;
  targa: string;
  messaggio: string;
  preferenza: string;
  lingua: Lingua;
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
