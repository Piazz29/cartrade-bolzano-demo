// llms.txt (https://llmstxt.org): presentazione sintetica per assistenti e motori di risposta (GEO), in italiano e tedesco.
// Generato dai dati in src/data/site.ts: indirizzo, orari, telefono e link restano sempre allineati al sito.
import type { APIRoute } from 'astro';
import { site, formatPrice } from '../data/site';
import { routes } from '../i18n/routes';

export const GET: APIRoute = ({ site: base }) => {
  const u = (p: string) => new URL(p, base).href;
  const fee = (l: 'it' | 'de' | 'en') => formatPrice(site.revisionFee.total, l, 2);
  const body = `# Car Trade Bolzano (${site.name})

> Centro revisioni auto affiliato DEKRA, officina meccanica e carrozzeria in un'unica sede a Bolzano Sud, Alto Adige. DEKRA-Partner für die Fahrzeugrevision, Kfz-Werkstatt und Karosserie an einem Standort in Bozen Süd, Südtirol. DEKRA-affiliated vehicle inspection centre, mechanical workshop and body shop at one address in Bolzano South, South Tyrol, Italy.

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
- Se la revisione trova un difetto, la riparazione si fa nella stessa sede e l'auto si ripresenta a pochi metri.

### Come si svolge la revisione (scheda DEKRA, circa 20–30 minuti)
1. Identificazione: targhe, numero di telaio e codice motore, confronto con la carta di circolazione.
2. Freni: banco prova a rulli per efficienza ed equilibrio; dischi, pastiglie, tubi, ABS/ESP, freno di stazionamento.
3. Sterzo: giochi di volante e piantone, tiranti e snodi, servosterzo.
4. Visibilità: parabrezza, specchietti, tergicristalli e lavavetri, sbrinamento.
5. Luci e impianto elettrico: prova fari (orientamento), frecce, stop, retromarcia, fendinebbia.
6. Assi, ruote e sospensioni: pneumatici (battistrada minimo 1,6 mm), cerchi, cuscinetti, ammortizzatori, molle.
7. Telaio e carrozzeria: corrosione, porte e cofani, paraurti, serbatoio e scarico.
8. Altri equipaggiamenti: cinture, airbag e spie, clacson, antifurto.
9. Emissioni e rumore: CO e lambda (benzina), opacità dei fumi (diesel), catalizzatore e FAP, codici guasto OBD.
Esito: regolare, ripetere (nuova revisione entro un mese) o sospeso. Esito e chilometri vengono registrati nell'archivio della Motorizzazione.

### Come prenotare
- Revisione: online sul portale DEKRA, ${site.dekra.bookingUrl}
- Officina e carrozzeria: telefono o WhatsApp ${site.phone.display}, oppure il modulo online (anche con foto del danno).
- Promemoria gratuito della scadenza revisione via email o WhatsApp: ${u(routes.promemoria.it)}

### Pagine principali
- [Home](${u(routes.home.it)})
- [Revisione auto a Bolzano](${u(routes.revisione.it)})
- [Officina e carrozzeria](${u(routes.officina.it)})
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

### Ablauf der Revision (DEKRA-Prüfbogen, etwa 20–30 Minuten)
Identifizierung, Bremsen (Rollenbremsprüfstand), Lenkung, Sicht, Beleuchtung (Scheinwerfer-Einstellgerät), Achsen/Räder/Fahrwerk (mindestens 1,6 mm Profil), Rahmen und Karosserie, weitere Ausstattung (Gurte, Airbag, Hupe), Abgase und Geräusch (CO und Lambda, Rauchgastrübung, OBD). Ergebnis: bestanden, wiederholen (innerhalb eines Monats) oder stillgelegt.

### Buchung
- Revision: online im DEKRA-Portal, ${site.dekra.bookingUrl}
- Werkstatt und Karosserie: Telefon oder WhatsApp ${site.phone.display}, oder Online-Formular (auch mit Fotos).
- Kostenlose Erinnerung an die Revision per E-Mail oder WhatsApp: ${u(routes.promemoria.de)}

### Wichtige Seiten
- [Startseite](${u(routes.home.de)})
- [Fahrzeugrevision in Bozen](${u(routes.revisione.de)})
- [Werkstatt & Karosserie](${u(routes.officina.de)})
- [Über uns](${u(routes.azienda.de)})
- [Kontakt und Öffnungszeiten](${u(routes.contatti.de)})
- [Revisions-Erinnerung](${u(routes.promemoria.de)})

## English

- Address: ${site.address.street.en}, ${site.address.postalCode} ${site.address.city.en} (${site.address.region}), Italy, Bolzano South business park
- Phone and WhatsApp: ${site.phone.display} (${site.phone.e164})
- Opening hours: Monday–Friday 8:30–12:30 and 14:00–18:00. Closed Saturday and Sunday.
- Area served: Bolzano, Laives, Appiano, Oltradige, Bassa Atesina
- Languages: Italian, German and English

### Services
- Vehicle inspection (Italian "revisione", DEKRA-affiliated centre, cars): national fee ${fee('en')} all inclusive. First inspection within 4 years of first registration, then every 2 years, by the end of the month.
- Mechanical workshop for all makes: servicing, brakes, timing belt and clutch, electronic diagnostics, air conditioning.
- Body shop: dents and scratches, panel straightening, painting. Quotes from photos sent online.
- Tyres: seasonal change. In South Tyrol winter tyres (or chains on board) are required from 15 November to 15 April.
- If the inspection finds a fault, the repair is done at the same address.

### How the inspection works (DEKRA checklist, about 20–30 minutes)
Identification, brakes (roller brake tester), steering, visibility, lights (headlight tester), axles/wheels/suspension (minimum 1.6 mm tread), chassis and body, other equipment (seat belts, airbags, horn), emissions and noise (CO and lambda, smoke opacity, OBD). Result: passed, repeat (within one month) or suspended.

### Booking
- Inspection: online on the DEKRA portal, ${site.dekra.bookingUrl}
- Workshop and bodywork: phone or WhatsApp ${site.phone.display}, or the online form (photos welcome).
- Free inspection reminder by email or WhatsApp: ${u(routes.promemoria.en)}

### Main pages
- [Home](${u(routes.home.en)})
- [Car inspection in Bolzano](${u(routes.revisione.en)})
- [Workshop & bodywork](${u(routes.officina.en)})
- [About us](${u(routes.azienda.en)})
- [Contact and opening hours](${u(routes.contatti.en)})
- [Inspection reminder](${u(routes.promemoria.en)})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
