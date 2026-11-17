// llms.txt (https://llmstxt.org): presentazione sintetica per assistenti e motori di risposta (GEO), in italiano, tedesco e inglese.
// Generato dai dati in src/data/site.ts: indirizzo, orari, telefono e link restano sempre allineati al sito.
// Struttura: fatti in elenco + domande e risposte brevi, così un assistente può citare la risposta così com'è.
import type { APIRoute } from 'astro';
import { site, formatPrice, areaName } from '../data/site';
import { routes } from '../i18n/routes';

export const GET: APIRoute = ({ site: base }) => {
  const u = (p: string) => new URL(p, base).href;
  const fee = (l: 'it' | 'de' | 'en') => formatPrice(site.revisionFee.total, l, 2);
  const area = (l: 'it' | 'de' | 'en') => site.area.map((a) => areaName(a, l)).join(', ');
  const updated = new Date().toISOString().slice(0, 10);
  const body = `# Car Trade Bolzano (${site.name})

> Centro revisioni auto affiliato DEKRA, officina meccanica, carrozzeria e cambio gomme in un'unica sede a Bolzano Sud, Alto Adige. DEKRA-Partner für die Fahrzeugrevision, Kfz-Werkstatt, Karosserie und Reifenwechsel an einem Standort in Bozen Süd, Südtirol. DEKRA-affiliated car inspection centre, mechanical workshop, body shop and tyre change at one address in Bolzano South, South Tyrol, Italy.

Ultimo aggiornamento / Stand / Last updated: ${updated}

## Italiano

- Nome: ${site.name}, conosciuta come "Car Trade Bolzano" e, su Google, "${site.google.name}"
- Indirizzo: ${site.address.street.it}, ${site.address.postalCode} ${site.address.city.it} (${site.address.region}), zona produttiva Bolzano Sud
- Cellulare e WhatsApp: ${site.phone.display} (${site.phone.e164})
- Telefono fisso: ${site.landline.display} (${site.landline.e164})
- Email: ${site.email}
- Orari: lunedì–venerdì 8:30–12:30 e 14:00–18:00, sabato 9:00–12:00. Domenica chiuso.
- Zona servita: ${area('it')}
- Lingue: italiano e tedesco
- Valutazione Google: ${site.google.rating} su 5 (${site.google.reviewCountLabel} recensioni)
- P. IVA: ${site.vat}

### Servizi
- Revisione auto (centro affiliato DEKRA, autovetture): tariffa nazionale ${fee('it')} tutto compreso. Prima revisione entro 4 anni dall'immatricolazione, poi ogni 2 anni, entro la fine del mese. Pagina: ${u(routes.revisione.it)}
- Officina meccanica per tutte le marche: tagliandi (senza perdere la garanzia, reg. UE 461/2010), freni, distribuzione e frizione, diagnosi elettronica, climatizzazione, controllo pre-revisione. Pagina: ${u(routes.officina.it)}
- Carrozzeria: ammaccature e graffi, raddrizzatura, verniciatura sul codice colore originale, paraurti, aiuto con la documentazione per l'assicurazione. Preventivo anche da foto inviate online. Pagina: ${u(routes.carrozzeria.it)}
- Cambio gomme: cambio stagionale estive/invernali, controllo battistrada e pressione. Pagina: ${u(routes.gomme.it)}
- Se la revisione trova un difetto, la riparazione si fa nella stessa sede e l'auto si ripresenta a pochi metri.

### Domande frequenti
- Dove fare la revisione auto a Bolzano? Da Car Trade, ${site.address.street.it}, Bolzano Sud: centro affiliato DEKRA, prenotazione online su ${site.dekra.bookingUrl}
- Quanto costa la revisione? ${fee('it')} tutto compreso, tariffa nazionale uguale in tutti i centri autorizzati.
- Quando servono le gomme invernali a Bolzano? In provincia di Bolzano dal 15 novembre al 15 aprile: gomme invernali (marcatura M+S, anche quattro stagioni) o catene a bordo.
- Entro quando togliere le invernali? Se il codice di velocità è inferiore a quello del libretto (minimo Q), sono ammesse solo dal 16 ottobre al 15 maggio.
- Battistrada minimo? 1,6 mm per legge; per le invernali consigliati almeno 4 mm.
- Preventivo carrozzeria senza andare in sede? Sì, dal modulo online con fino a 6 foto del danno.
- Dopo un incidente: compilare il CAI (constatazione amichevole), fotografare i danni, denunciare il sinistro alla propria assicurazione entro 3 giorni.

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
- Officina, carrozzeria e gomme: telefono o WhatsApp ${site.phone.display}, oppure il modulo online (anche con foto del danno).

### Pagine principali
- [Home](${u(routes.home.it)})
- [Revisione auto a Bolzano](${u(routes.revisione.it)})
- [Officina meccanica a Bolzano](${u(routes.officina.it)})
- [Carrozzeria a Bolzano](${u(routes.carrozzeria.it)})
- [Cambio gomme a Bolzano](${u(routes.gomme.it)})
- [Chi siamo](${u(routes.azienda.it)})
- [Contatti e orari](${u(routes.contatti.it)})
- [Scheda Google](${site.google.mapsCidUrl})
- [Pagina del centro su DEKRA](${site.dekra.profileUrl})

## Deutsch

- Name: ${site.name}, bekannt als „Car Trade Bozen“ und auf Google als „${site.google.name}“
- Adresse: ${site.address.street.de}, ${site.address.postalCode} ${site.address.city.de} (${site.address.region}), Gewerbegebiet Bozen Süd
- Handy und WhatsApp: ${site.phone.display} (${site.phone.e164})
- Festnetz: ${site.landline.display} (${site.landline.e164})
- E-Mail: ${site.email}
- Öffnungszeiten: Montag–Freitag 8:30–12:30 und 14:00–18:00 Uhr, Samstag 9:00–12:00 Uhr. Sonntag geschlossen.
- Einzugsgebiet: ${area('de')}
- Sprachen: Deutsch und Italienisch

### Leistungen
- Fahrzeugrevision (DEKRA-Partner, Pkw): staatlicher Tarif ${fee('de')} inklusive allem. Erste Revision innerhalb von 4 Jahren ab Erstzulassung, danach alle 2 Jahre, jeweils bis Monatsende. Die Revision ist die italienische Pflichtprüfung, vergleichbar mit HU/TÜV (Deutschland) und Pickerl (Österreich). Seite: ${u(routes.revisione.de)}
- Kfz-Werkstatt für alle Marken: Inspektion (Garantie bleibt erhalten, EU-VO 461/2010), Bremsen, Zahnriemen und Kupplung, elektronische Diagnose, Klimaanlage. Seite: ${u(routes.officina.de)}
- Karosserie: Dellen und Kratzer, Richtarbeiten, Lackierung nach Original-Farbcode, Stoßfänger, Hilfe bei Versicherungsunterlagen. Angebot auch per Foto. Seite: ${u(routes.carrozzeria.de)}
- Reifenwechsel: Sommer-/Winterreifen, Profil- und Druckkontrolle. Seite: ${u(routes.gomme.de)}

### Häufige Fragen
- Winterreifenpflicht in Südtirol? Vom 15. November bis 15. April Winterreifen (M+S, auch Ganzjahresreifen) oder Schneeketten an Bord.
- Winterreifen mit niedrigerem Geschwindigkeitsindex? Nur vom 16. Oktober bis 15. Mai erlaubt (mindestens Q).
- Mindestprofil? 1,6 mm gesetzlich; bei Winterreifen mindestens 4 mm empfohlen.
- Was kostet die Revision? ${fee('de')} inklusive allem, in allen zugelassenen Prüfstellen gleich.

### Ablauf der Revision (DEKRA-Prüfbogen, etwa 20–30 Minuten)
Identifizierung, Bremsen (Rollenbremsprüfstand), Lenkung, Sicht, Beleuchtung (Scheinwerfer-Einstellgerät), Achsen/Räder/Fahrwerk (mindestens 1,6 mm Profil), Rahmen und Karosserie, weitere Ausstattung (Gurte, Airbag, Hupe), Abgase und Geräusch (CO und Lambda, Rauchgastrübung, OBD). Ergebnis: bestanden, wiederholen (innerhalb eines Monats) oder stillgelegt.

### Buchung
- Revision: online im DEKRA-Portal, ${site.dekra.bookingUrl}
- Werkstatt, Karosserie und Reifen: Telefon oder WhatsApp ${site.phone.display}, oder Online-Formular (auch mit Fotos).

### Wichtige Seiten
- [Startseite](${u(routes.home.de)})
- [Fahrzeugrevision in Bozen](${u(routes.revisione.de)})
- [Kfz-Werkstatt in Bozen](${u(routes.officina.de)})
- [Karosserie in Bozen](${u(routes.carrozzeria.de)})
- [Reifenwechsel in Bozen](${u(routes.gomme.de)})
- [Über uns](${u(routes.azienda.de)})
- [Kontakt und Öffnungszeiten](${u(routes.contatti.de)})

## English

- Name: ${site.name}, known as "Car Trade Bolzano" and on Google as "${site.google.name}"
- Address: ${site.address.street.en}, ${site.address.postalCode} ${site.address.city.en} (${site.address.region}), Italy, Bolzano South business park
- Mobile and WhatsApp: ${site.phone.display} (${site.phone.e164})
- Landline: ${site.landline.display} (${site.landline.e164})
- Email: ${site.email}
- Opening hours: Monday–Friday 8:30–12:30 and 14:00–18:00, Saturday 9:00–12:00. Closed Sunday.
- Area served: ${area('en')}
- Languages: Italian, German and English

### Services
- Car inspection (Italian "revisione", the equivalent of the UK MOT; DEKRA-affiliated centre, cars): national fee ${fee('en')} all inclusive. First inspection within 4 years of first registration, then every 2 years, by the end of the month. Only Italian-registered cars. Page: ${u(routes.revisione.en)}
- Mechanic / car repair garage for all makes: servicing (warranty kept, EU Regulation 461/2010), brakes, timing belt and clutch, electronic diagnostics, air conditioning. Page: ${u(routes.officina.en)}
- Body shop: dents and scratches, panel straightening, painting to the original colour code, bumpers, help with insurance paperwork. Quotes from photos sent online. Page: ${u(routes.carrozzeria.en)}
- Tyre change: summer/winter tyres, tread and pressure check. Page: ${u(routes.gomme.en)}
- If the inspection finds a fault, the repair is done at the same address.

### Frequently asked questions
- Winter tyres in South Tyrol? Required from 15 November to 15 April: winter tyres (M+S marking, all-season included) or snow chains on board.
- Winter tyres with a lower speed rating? Allowed only from 16 October to 15 May (at least Q).
- Minimum tread depth in Italy? 1.6 mm by law; at least 4 mm advised for winter tyres.
- After an accident in Italy: fill in the European Accident Statement (CAI), photograph the damage, report to your insurer within 3 days.

### How the inspection works (DEKRA checklist, about 20–30 minutes)
Identification, brakes (roller brake tester), steering, visibility, lights (headlight tester), axles/wheels/suspension (minimum 1.6 mm tread), chassis and body, other equipment (seat belts, airbags, horn), emissions and noise (CO and lambda, smoke opacity, OBD). Result: passed, repeat (within one month) or suspended.

### Booking
- Inspection: online on the DEKRA portal, ${site.dekra.bookingUrl}
- Workshop, body shop and tyres: phone or WhatsApp ${site.phone.display}, or the online form (photos welcome).

### Main pages
- [Home](${u(routes.home.en)})
- [Car inspection in Bolzano](${u(routes.revisione.en)})
- [Mechanic in Bolzano](${u(routes.officina.en)})
- [Body shop in Bolzano](${u(routes.carrozzeria.en)})
- [Tyre change in Bolzano](${u(routes.gomme.en)})
- [About us](${u(routes.azienda.en)})
- [Contact and opening hours](${u(routes.contatti.en)})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
