import type { Lang } from '../data/site';

export const carLabels = {
  it: {
    fuel: { diesel: 'Diesel', petrol: 'Benzina', hybrid: 'Ibrida', phev: 'Ibrida plug-in' },
    gearbox: { manual: 'Manuale', automatic: 'Automatico' },
    drive: { fwd: 'Anteriore', awd: 'Integrale', rwd: 'Posteriore' },
    condition: { used: 'Usato', km0: 'Km 0' },
    body: { suv: 'SUV', wagon: 'Station wagon', hatchback: 'Berlina compatta', city: 'Citycar' },
    km: 'km',
    year: 'Anno',
    mileage: 'Chilometri',
    fuelLabel: 'Alimentazione',
    gearboxLabel: 'Cambio',
    driveLabel: 'Trazione',
    power: 'Potenza',
    color: 'Colore',
    doors: 'Porte',
    seats: 'Posti',
    euro: 'Classe emissioni',
    owners: 'Proprietari',
    warranty: 'Garanzia',
    months: 'mesi',
    consumption: 'Consumo medio WLTP',
    registration: 'Prima immatricolazione',
    price: 'Prezzo',
    vatNote: 'IVA inclusa, passaggio di proprietà escluso',
    details: 'Dettagli',
  },
  de: {
    fuel: { diesel: 'Diesel', petrol: 'Benzin', hybrid: 'Hybrid', phev: 'Plug-in-Hybrid' },
    gearbox: { manual: 'Schaltgetriebe', automatic: 'Automatik' },
    drive: { fwd: 'Frontantrieb', awd: 'Allrad', rwd: 'Heckantrieb' },
    condition: { used: 'Gebraucht', km0: 'Tageszulassung' },
    body: { suv: 'SUV', wagon: 'Kombi', hatchback: 'Kompaktklasse', city: 'Kleinwagen' },
    km: 'km',
    year: 'Baujahr',
    mileage: 'Kilometerstand',
    fuelLabel: 'Kraftstoff',
    gearboxLabel: 'Getriebe',
    driveLabel: 'Antrieb',
    power: 'Leistung',
    color: 'Farbe',
    doors: 'Türen',
    seats: 'Sitze',
    euro: 'Abgasnorm',
    owners: 'Vorbesitzer',
    warranty: 'Garantie',
    months: 'Monate',
    consumption: 'Verbrauch kombiniert WLTP',
    registration: 'Erstzulassung',
    price: 'Preis',
    vatNote: 'inkl. MwSt., zzgl. Umschreibung',
    details: 'Details',
  },
} as const;

export const useCarLabels = (lang: Lang) => carLabels[lang];

export const formatKm = (km: number, lang: Lang) =>
  `${new Intl.NumberFormat(lang === 'it' ? 'it-IT' : 'de-DE').format(km)} km`;

export const formatReg = (reg: string, lang: Lang) => {
  const [y, m] = reg.split('-');
  return lang === 'it' ? `${m}/${y}` : `${m}/${y}`;
};

/** Le versioni sono scritte all'italiana ("150 CV"): in tedesco i cavalli sono "PS". */
export const localizeVersion = (v: string, lang: Lang) => (lang === 'de' ? v.replace(/(\d+)\s?CV\b/g, '$1 PS') : v);
