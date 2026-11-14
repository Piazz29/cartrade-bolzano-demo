// Dati aziendali reali. Unica fonte per header, footer, schema.org e contatti.
// Fonti: sito attuale cartradebolzano.it, scheda DEKRA, brief del cliente.

const GOOGLE_PLACE_ID = 'ChIJ_xxnNNadgkcRzUuQfA86rBI';
const GOOGLE_CID = '1345514226865687501';

export const site = {
  name: 'CAR TRADE SRL',
  brand: 'Car Trade Bolzano',
  vat: '02974520211',
  address: {
    street: { it: 'Via Werner von Siemens 4/F', de: 'Werner-von-Siemens-Straße 4/F', en: 'Via Werner von Siemens 4/F' },
    postalCode: '39100',
    city: { it: 'Bolzano', de: 'Bozen', en: 'Bolzano' },
    region: 'BZ',
    country: 'IT',
  },
  // Coordinate dalla scheda DEKRA
  geo: { lat: 46.482868, lng: 11.332216 },
  phone: {
    display: '324 696 5239',
    href: 'tel:+393246965239',
    e164: '+393246965239',
  },
  // TODO: verificare che il numero sia attivo su WhatsApp (sul sito attuale non è indicato)
  whatsapp: {
    number: '393246965239',
    href: (text?: string) =>
      `https://wa.me/393246965239${text ? `?text=${encodeURIComponent(text)}` : ''}`,
  },
  // TODO: email non presente su nessuna fonte. Chiedere al cliente e inserirla qui:
  // comparirà automaticamente in footer, contatti e schema.org.
  email: null as string | null,
  dekra: {
    bookingUrl: 'https://prenotazioni.dekra.it/prenota?id=6765',
    profileUrl: 'https://revisione.dekra.it/centri-revisione/car-trade-srl',
    vehicles: ['auto'],
  },
  // Scheda Google Business "Centro Revisioni Dekra - Car Trade Srl" (Place ID ricavato e verificato dall'embed di Google Maps).
  // Voto e numero sono fissi (niente API): aggiornarli a mano qui quando cambiano sulla scheda.
  // reviewCountLabel ("62+") è quello che si vede sul sito; reviewCount resta il numero puro.
  google: {
    name: 'Centro Revisioni Dekra - Car Trade Srl',
    placeId: GOOGLE_PLACE_ID,
    cid: GOOGLE_CID,
    rating: 4.5,
    reviewCount: 62,
    reviewCountLabel: '62+',
    url: `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`,
    reviewsUrl: `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`,
    // Link "scrivi una recensione" costruito dal Place ID (usato dal sito e dalla richiesta recensione dell'admin)
    writeReviewUrl: `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`,
    // Scheda Google per cid: usata in schema.org (hasMap, sameAs) e in llms.txt
    mapsCidUrl: `https://maps.google.com/?cid=${GOOGLE_CID}`,
    // Chiave browser facoltativa, solo per la mappa ufficiale (vedi .env.example). Senza chiave: mappa Google pubblica.
    apiKey: (import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined) || '',
  },
  mapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Centro+Revisioni+Dekra+-+Car+Trade+Srl%2C+Via+Werner+von+Siemens+4%2FF%2C+Bolzano&destination_place_id=ChIJ_xxnNNadgkcRzUuQfA86rBI',
  // Orari: lun-ven 8:30-12:30 / 14:00-18:00.
  // TODO: verificare il sabato mattina. La scheda DEKRA indica "sabato chiuso",
  // altre fonti parlano di apertura il sabato mattina. Finché non è confermato, mostriamo chiuso.
  hours: [
    { days: [1, 2, 3, 4, 5], open: '08:30', close: '12:30' },
    { days: [1, 2, 3, 4, 5], open: '14:00', close: '18:00' },
  ],
  saturdayVerified: false,
  // Tariffa nazionale revisione presso centri privati autorizzati (MIT).
  // TODO: ricontrollare prima della pubblicazione. Un emendamento prevede l'aumento a 88,20 €,
  // non ancora in vigore a ottobre 2026.
  revisionFee: {
    total: 79.02,
    parts: [
      { key: 'base', value: 54.95 },
      { key: 'vat', value: 12.09 },
      { key: 'dtt', value: 10.2 },
      { key: 'postal', value: 1.78 },
    ],
  },
} as const;

export type Lang = 'it' | 'de' | 'en';

/** Locale per date e numeri. Inglese britannico: giorno prima del mese, come in Europa. */
export const locales: Record<Lang, string> = { it: 'it-IT', de: 'de-DE', en: 'en-GB' };

export const formatPrice = (n: number, lang: Lang, decimals = 0) =>
  new Intl.NumberFormat(locales[lang], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

export const formatNumber = (n: number, lang: Lang, decimals = 0) =>
  new Intl.NumberFormat(locales[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
