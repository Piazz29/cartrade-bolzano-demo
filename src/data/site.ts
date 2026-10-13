// Dati aziendali reali. Unica fonte per header, footer, schema.org e contatti.
// Fonti: sito attuale cartradebolzano.it, scheda DEKRA, brief del cliente.

export const site = {
  name: 'CAR TRADE SRL',
  brand: 'Car Trade Bolzano',
  vat: '02974520211',
  address: {
    street: { it: 'Via Werner von Siemens 4/F', de: 'Werner-von-Siemens-Straße 4/F' },
    postalCode: '39100',
    city: { it: 'Bolzano', de: 'Bozen' },
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
  // Voto e numero sono il valore di ottobre 2026: con la chiave API vengono aggiornati in pagina dai dati live.
  google: {
    name: 'Centro Revisioni Dekra - Car Trade Srl',
    placeId: 'ChIJ_xxnNNadgkcRzUuQfA86rBI',
    cid: '1345514226865687501',
    rating: 4.5,
    reviewCount: 61,
    url: 'https://www.google.com/maps/place/?q=place_id:ChIJ_xxnNNadgkcRzUuQfA86rBI',
    reviewsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJ_xxnNNadgkcRzUuQfA86rBI',
    writeReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ_xxnNNadgkcRzUuQfA86rBI',
    // Chiave browser della Google Maps Platform (vedi .env.example). Senza chiave: mappa pubblica + link alle recensioni.
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

export type Lang = 'it' | 'de';

export const formatPrice = (n: number, lang: Lang, decimals = 0) =>
  new Intl.NumberFormat(lang === 'it' ? 'it-IT' : 'de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

export const formatNumber = (n: number, lang: Lang, decimals = 0) =>
  new Intl.NumberFormat(lang === 'it' ? 'it-IT' : 'de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
