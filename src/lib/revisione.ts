// Scadenza della revisione (art. 80 Codice della Strada, autovetture uso privato):
// prima revisione entro 4 anni dalla prima immatricolazione, poi ogni 2 anni,
// sempre entro la fine del mese di riferimento.
// Unica fonte della regola: la usa il calcolatore della scadenza.

export type RifTipo = 'rev' | 'reg'; // ultima revisione | prima immatricolazione

export interface Scadenza {
  /** ultimo giorno utile */
  date: Date;
  /** inizio del ciclo in corso (per il misuratore) */
  cycleStart: Date;
  /** dall'immatricolazione, con la prima scadenza già passata: stima ogni 2 anni */
  estimated: boolean;
  /** prima scadenza teorica (solo per il messaggio di stima) */
  first: Date;
}

export const DAY = 86_400_000;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/** m1 = mese 1-12 */
export const lastDayOfMonth = (y: number, m1: number) => new Date(y, m1, 0);

export function calcolaScadenza(tipo: RifTipo, mese: number, anno: number, oggi = new Date()): Scadenza {
  const today = startOfDay(oggi);
  const isReg = tipo === 'reg';
  let d = lastDayOfMonth(anno + (isReg ? 4 : 2), mese);
  const first = d;
  let estimated = false;
  if (isReg && d < today) {
    while (d < today) d = lastDayOfMonth(d.getFullYear() + 2, d.getMonth() + 1);
    estimated = true;
  }
  const cycleStart = new Date(d.getFullYear() - (isReg && !estimated ? 4 : 2), d.getMonth(), 1);
  return { date: d, cycleStart, estimated, first };
}

/** Giorni mancanti (negativi se scaduta) */
export const giorniA = (d: Date, oggi = new Date()) => Math.round((startOfDay(d).getTime() - startOfDay(oggi).getTime()) / DAY);

/** Data in formato AAAA-MM-GG senza passare da UTC (niente slittamenti di fuso) */
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const parseIsoDate = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d: Date, n: number) => {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
  r.setDate(Math.min(d.getDate(), lastDayOfMonth(r.getFullYear(), r.getMonth() + 1).getDate()));
  return r;
};
