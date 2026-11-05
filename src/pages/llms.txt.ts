// llms.txt (https://llmstxt.org): presentazione sintetica per assistenti e motori di risposta (GEO), in italiano e tedesco.
// Generato dai dati in src/data/site.ts: indirizzo, orari, telefono e link restano sempre allineati al sito.
import type { APIRoute } from 'astro';
import { site, formatPrice } from '../data/site';
import { routes } from '../i18n/routes';

export const GET: APIRoute = ({ site: base }) => {
  const u = (p: string) => new URL(p, base).href;
  const fee = (l: 'it' | 'de') => formatPrice(site.revisionFee.total, l, 2);
  const body = `# Car Trade Bolzano (${site.name})

> Centro revisioni auto affiliato DEKRA, officina meccanica, carrozzeria e vendita di auto usate e km 0 in un'unica sede a Bolzano Sud, Alto Adige. DEKRA-Partner für die Fahrzeugrevision, Kfz-Werkstatt, Karosserie und Gebrauchtwagen an einem Standort in Bozen Süd, Südtirol.

## Italiano

- Indirizzo: ${site.address.street.it}, ${site.address.postalCode} ${site.address.city.it} (${site.address.region}), zona produttiva Bolzano Sud
- Telefono e WhatsApp: ${site.phone.display} (${site.phone.e164})
- Orari: lunedì–venerdì 8:30–12:30 e 14:00–18:00. Sabato e domenica chiuso.
- Zona servita: Bolzano, Laives, Appiano sulla Strada del Vino, Oltradige, Bassa Atesina
- Lingue: italiano e tedesco
- P. IVA: ${site.vat}

### Servizi
- Revisione auto (centro affiliato DEKRA, autovetture): tariffa nazionale ${fee('it')} tutto compreso. Prima revisione entro 4 anni dall'immatricolazione, poi ogni 2 anni, entro la fine del mese.
- Officina meccanica per tutte le marche: tagliandi, freni, distribuzione e frizione, diagnosi elettronica, climatizzazione.
- Carrozzeria: ammaccature e graffi, raddrizzatura, verniciatura. Preventivo anche da foto inviate online.
- Gomme: cambio stagionale. In provincia di Bolzano le gomme invernali (o catene a bordo) servono dal 15 novembre al 15 aprile.
- Vendita di auto usate selezionate e km 0, con garanzia, controllate in officina prima della vendita.
- Se la revisione trova un difetto, la riparazione si fa nella stessa sede e l'auto si ripresenta a pochi metri.

### Come prenotare
- Revisione: online sul portale DEKRA, ${site.dekra.bookingUrl}
- Officina, carrozzeria, auto: telefono o WhatsApp ${site.phone.display}, oppure il modulo online (anche con foto del danno).
- Promemoria gratuito della scadenza revisione via email o WhatsApp: ${u(routes.promemoria.it)}

### Pagine principali
- [Home](${u(routes.home.it)})
- [Revisione auto a Bolzano](${u(routes.revisione.it)})
- [Officina e carrozzeria](${u(routes.officina.it)})
- [Auto usate e km 0](${u(routes.showroom.it)})
- [Chi siamo](${u(routes.azienda.it)})
- [Contatti e orari](${u(routes.contatti.it)})
- [Promemoria revisione](${u(routes.promemoria.it)})
- [Scheda Google](${site.google.mapsCidUrl})
- [Pagina del centro su DEKRA](${site.dekra.profileUrl})

## Deutsch

- Adresse: ${site.address.street.de}, ${site.address.postalCode} ${site.address.city.de} (${site.address.region}), Gewerbegebiet Bozen Süd
- Telefon und WhatsApp: ${site.phone.display} (${site.phone.e164})
- Öffnungszeiten: Montag–Freitag 8:30–12:30 und 14:00–18:00 Uhr. Samstag und Sonntag geschlossen.
- Einzugsgebiet: Bozen, Leifers, Eppan an der Weinstraße, Überetsch, Unterland
- Sprachen: Deutsch und Italienisch

### Leistungen
- Fahrzeugrevision (DEKRA-Partner, Pkw): staatlicher Tarif ${fee('de')} inklusive allem. Erste Revision innerhalb von 4 Jahren ab Erstzulassung, danach alle 2 Jahre, jeweils bis Monatsende.
- Kfz-Werkstatt für alle Marken: Inspektion, Bremsen, Zahnriemen und Kupplung, elektronische Diagnose, Klimaanlage.
- Karosserie: Dellen und Kratzer, Richtarbeiten, Lackierung. Angebot auch per Foto.
- Reifen: saisonaler Wechsel. In Südtirol gilt die Winterausrüstungspflicht vom 15. November bis 15. April.
- Ausgewählte Gebrauchtwagen und Tageszulassungen mit Garantie, vor dem Verkauf in der Werkstatt geprüft.

### Buchung
- Revision: online im DEKRA-Portal, ${site.dekra.bookingUrl}
- Werkstatt, Karosserie, Fahrzeuge: Telefon oder WhatsApp ${site.phone.display}, oder Online-Formular (auch mit Fotos).
- Kostenlose Erinnerung an die Revision per E-Mail oder WhatsApp: ${u(routes.promemoria.de)}

### Wichtige Seiten
- [Startseite](${u(routes.home.de)})
- [Fahrzeugrevision in Bozen](${u(routes.revisione.de)})
- [Werkstatt & Karosserie](${u(routes.officina.de)})
- [Gebrauchtwagen und Tageszulassungen](${u(routes.showroom.de)})
- [Über uns](${u(routes.azienda.de)})
- [Kontakt und Öffnungszeiten](${u(routes.contatti.de)})
- [Revisions-Erinnerung](${u(routes.promemoria.de)})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
