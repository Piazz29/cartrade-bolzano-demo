# Car Trade Bolzano · demo del nuovo sito

Demo di proposta per **CAR TRADE SRL** (Via Werner von Siemens 4/F, Bolzano): centro revisioni affiliato DEKRA, officina, carrozzeria, auto usate e km 0.
Sito statico bilingue (italiano `/it/`, tedesco `/de/`), pensato prima di tutto per il telefono.

- Direzione estetica, palette, tipografia, griglia e motion: [DESIGN.md](DESIGN.md)
- Pubblico, tono e principi: [PRODUCT.md](PRODUCT.md)

## Avvio

Serve Node.js 22 o superiore.

```bash
npm install
npm run dev        # sviluppo: http://localhost:4321  (Astro 7 avvia il server in background: `npx astro dev stop` per fermarlo)
npm run build      # genera il sito statico in dist/
npm run preview    # serve dist/ in locale, come in produzione
npm run check      # controllo dei tipi (0 errori attesi)
```

### Google Maps e recensioni Google

Il sito è collegato alla scheda Google reale **"Centro Revisioni Dekra - Car Trade Srl"** (Place ID `ChIJ_xxnNNadgkcRzUuQfA86rBI`, in `src/data/site.ts`).

- **Senza chiave** (come adesso): la mappa Google è incorporata e mostra la scheda con voto e recensioni; la sezione recensioni mostra voto, numero e i pulsanti "Leggi tutte le recensioni" e "Lascia una recensione".
- **Con la chiave**: compaiono anche le **card con le recensioni vere** (le 5 che Google considera più pertinenti, nella lingua della pagina, con autore, foto, data e link) e voto e numero si aggiornano da soli. La mappa passa alla Maps Embed API ufficiale.

Per attivarla: copia `.env.example` in `.env`, segui le istruzioni nel file (progetto Google Cloud, tre API, chiave limitata al dominio), incolla la chiave in `PUBLIC_GOOGLE_MAPS_API_KEY` e rifai `npm run build`. Sull'hosting la stessa variabile va impostata nelle impostazioni del progetto.

Perché le recensioni si caricano nel browser e non in build: le policy di Google Places vietano di salvare o mettere in cache i contenuti delle recensioni. Si caricano solo quando la sezione sta per entrare in vista, quindi non rallentano la pagina. Google fattura le chiamate Places oltre una quota mensile gratuita: per un sito locale il traffico resta normalmente basso, ma conviene impostare un tetto di spesa nella console.

**Demo online su Vercel** (deploy da GitHub, a ogni push su `main`). `vercel.json` aggiunge l'header `X-Robots-Tag: noindex`: la demo non viene indicizzata dai motori di ricerca. **Al lancio sul dominio vero, togliere quell'header** da `vercel.json`.

`dist/` si pubblica su qualunque hosting statico (Netlify, Vercel, Cloudflare Pages, un server Apache/Nginx).
Prima della messa online: confermare il dominio in `astro.config.mjs` (oggi `https://cartradebolzano.it`).

## Stack

- **Astro 7** + **Tailwind CSS 4**, nessun framework JavaScript lato client.
- **GSAP + ScrollTrigger** caricati in modo lazy solo dove servono (parallax foto su desktop, linea di avanzamento nella pagina Revisione). **Lenis** (scroll morbido) solo su desktop con mouse. Con "riduci movimento" attivo non si carica nulla.
- Animazioni di ingresso in CSS + IntersectionObserver (non bloccano il caricamento).
- Font **Archivo** variabile, self-hosted e ridotto ai caratteri latini (75 KB): largo per i titoli, normale per il testo.
- Logo vettorializzato dal file originale (`public/brand/logo.svg` e `logo-inverse.svg`); i file originali sono in `public/brand/logo-originale*.png`.

## Struttura

```
src/
  data/site.ts            dati aziendali reali (indirizzo, telefono, orari, tariffa, link DEKRA): unica fonte
  i18n/                   rotte localizzate (IT/DE), testi comuni, etichette auto
  content/cars/*.json     auto in vendita (content collection, 8 schede DEMO)
  components/             header, barra CTA mobile, calcolatore, moduli, mappa, scheda auto…
  views/                  le pagine, con i testi IT e DE affiancati
  pages/it, pages/de      rotte (file sottili che richiamano le viste)
  pages/sitemap.xml.ts    sitemap con alternative hreflang
```

Pagine: Home · Revisione · Officina e carrozzeria · Auto (griglia con filtri) · Scheda auto · Azienda · Contatti · 404.
URL tedeschi localizzati: `/de/revision/`, `/de/werkstatt-karosserie/`, `/de/fahrzeuge/`, `/de/unternehmen/`, `/de/kontakt/`.

## Funzioni da mostrare al cliente

0. **Schermata di caricamento** con il logo che si compone: compare ogni volta che si entra nel sito o si ricarica la pagina, non quando si naviga tra le pagine. **Hero a tutto schermo** con la composizione del logo, header trasparente, transizioni morbide tra le pagine.

**Telefoni con "Riduci movimento" attivo** (iPhone: Impostazioni › Accessibilità › Movimento; Android: "Rimuovi animazioni", spesso attivo col risparmio energetico): il sito resta completo ma più calmo. La schermata di caricamento compare con dissolvenze invece del sipario, i loghi delle marche scorrono più lentamente, le altre animazioni d'ingresso sono disattivate. La fascia dei loghi ha un pulsante pausa/riprendi (requisito WCAG 2.2.2).

1. **Calcolatore scadenza revisione** (Home e pagina Revisione): mese e anno di immatricolazione o ultima revisione → scadenza esatta secondo il Codice della Strada (4 anni, poi ogni 2, a fine mese), giorni mancanti, misuratore del ciclo, file calendario `.ics` con promemoria a 30 giorni, "Avvisami prima della scadenza" via email o WhatsApp (solo interfaccia).
2. **Barra fissa su mobile**: Chiama · WhatsApp · Prenota (portale DEKRA).
3. **Showroom** con filtri per marca, prezzo, km, anno, alimentazione, cambio, condizione e ordinamento. I filtri finiscono nell'URL, quindi una ricerca si può condividere. Se non ci sono risultati, un link WhatsApp precompilato con la ricerca.
4. **Scheda auto**: galleria (swipe su mobile), scheda tecnica, WhatsApp con messaggio già scritto (auto, prezzo, link).
5. **Preventivo carrozzeria con foto**: caricamento fino a 6 foto dal telefono, anteprime, validazione (solo interfaccia).
6. **Aperto ora / Chiuso ora** calcolato sul fuso di Roma, in header mobile, Home e Contatti.
7. **Selettore lingua** sempre visibile, porta alla stessa pagina nell'altra lingua. La radice `/` manda in tedesco chi ha il browser in tedesco.

## Qualità verificata

- **Browser mobili** (test automatici Playwright su tutte le pagine IT/DE, con tocco): Safari su iPhone 15 Pro, iPhone 15 Pro Max e iPhone SE (WebKit 27.2), Chrome su Pixel 7 e Samsung Internet su Galaxy S9+ (Chromium 156), più iPhone e Android con "Riduci movimento" attivo. Controllati: errori JavaScript, scroll orizzontale, immagini, font, schermata di caricamento, barra fissa, menu, calcolatore, filtri, galleria, modulo con foto, cambio lingua, mappa. Firefox non è stato eseguito (bloccato dall'ambiente di test): il codice usa solo funzioni supportate da Firefox 113+. Supporto minimo: iOS/Safari 16.4+, Chrome/Samsung Internet degli ultimi due anni.

- **Lighthouse mobile** (build di produzione, rete 4G lenta simulata): Accessibilità 100, Best practice 100, SEO 100, Performance 96–99 su tutte le pagine misurate; CLS ≈ 0; LCP 1,8–2,5 s. L'LCP oscilla di qualche decimo perché le foto arrivano dalla CDN di Unsplash: con le foto reali servite dal sito stesso migliorerà.
- **axe-core** (WCAG 2.2 AA): 0 violazioni su tutte le pagine, a 390 e 1440 px.
- **Test funzionali Playwright**: calcolatore (tutti i casi), .ics, promemoria, menu, lingua, filtri e URL, galleria, modulo con foto, mappa, recensioni (senza chiave e con una Places API simulata: caricamento solo in vista, 5 card, voto aggiornato, traduzione segnalata), reindirizzamento lingua: tutti superati.
- **SEO locale**: title e description per pagina, canonical, hreflang it/de/x-default, Open Graph con immagine dedicata per lingua, sitemap con alternative, robots.txt, schema.org `AutoRepair` + `AutoDealer` (indirizzo, coordinate, orari, P. IVA), `FAQPage` e `Service` sulla Revisione, `Car` con prezzo su ogni scheda auto, `ItemList` sullo showroom, `BreadcrumbList` sulle pagine interne.
- Nessun `aggregateRating` nello schema: Google non lo ammette per le recensioni della propria attività. Voto e numero di recensioni sono mostrati in pagina.
- La mappa Google è un iframe caricato in lazy: non pesa sul caricamento (Lighthouse invariato). Imposta però cookie di terze parti: in produzione va collegata al banner cookie (TODO in `src/components/MapBlock.astro`).

## Foto reali già inserite

In `src/assets/sede/` (ottimizzate da Astro in AVIF/WebP durante la build):
- `sede-revisioni-dekra.webp`: hero della pagina Azienda.
- `carrozzeria.webp`: sezione Carrozzeria e indice servizi della Home.
- `showroom-1/2/3.webp`: mosaico "Lo showroom" nella pagina Azienda (prese dalle recensioni Google: verificare i diritti, vedi TODO).

Per sostituire una foto basta rimpiazzare il file mantenendo lo stesso nome.

## Loghi delle marche

La fascia "Tutte le marche" sotto la hero usa loghi monocromatici di [Simple Icons](https://simpleicons.org) (licenza CC0), raccolti in `public/brands/sprite.svg`. Per cambiare l'elenco: modificare `BRANDS` in `scripts/build-brand-sprite.mjs` e lanciare `npm run brands`. Mercedes-Benz, Alfa Romeo, Land Rover e Abarth non sono disponibili nella libreria (rimossi su richiesta delle case): se servono, vanno forniti dal cliente in SVG.

## Cosa serve dal cliente

1. **Foto della sede in alta risoluzione** (almeno 2400 px di lato lungo): la foto dell'insegna DEKRA è 680 px e a tutto schermo su desktop risulta morbida. Servono anche officina, linea di revisione, piazzale e la hero della Home. Meglio un servizio fotografico unico, luce naturale, orizzontali e verticali.
2. **Foto del team** (ritratti) con **nome e ruolo** di ciascuno.
3. **Testi azienda**: storia, anno di fondazione, tappe (officina, affiliazione DEKRA, vendita auto), eventuali numeri reali (metri quadri, ponti, anni di esperienza).
4. **Elenco auto in vendita** con foto reali, oppure accesso al gestionale/portale (es. AutoScout24) per collegarlo.
5. **Orari confermati**, in particolare il **sabato mattina** (DEKRA indica chiuso, altre fonti no).
6. **Email** di contatto e conferma che il **324 696 5239 è su WhatsApp**.
7. **Chiave Google Maps Platform** (o accesso al loro account Google Cloud) per mostrare le recensioni vere sul sito. La scheda Google è già individuata.
8. Conferma dei **servizi** (climatizzazione, pneumatici, forno di verniciatura, gestione sinistri), di **permute e finanziamenti**, della **garanzia** sulle auto e dei **tempi di risposta** ai preventivi.
9. Testi **privacy e cookie** dal consulente.
10. Regole d'uso del **marchio DEKRA**: finché non sono chiare, il sito usa solo la dicitura "Centro revisioni affiliato DEKRA", senza logo.

## Elenco completo dei TODO nel codice

Cercali con `grep -rn TODO src astro.config.mjs`.

**Dati da confermare**
- `src/data/site.ts` · orari del sabato (oggi mostrato "Chiuso"); numero WhatsApp; email (oggi assente, compare da sola quando la inserisci); tariffa revisione 79,02 € da ricontrollare (un emendamento prevede 88,20 €, non in vigore a ottobre 2026).
- `src/layouts/Base.astro` · aggiungere il sabato allo schema.org se confermato.
- `src/components/HoursTable.astro` · sabato.
- `astro.config.mjs` · dominio definitivo.
- `src/views/RevisioneView.astro` · durata media del controllo (indicata "30–40 min"); metodi di pagamento; condizioni della nuova revisione dopo esito "ripetere".
- `src/views/OfficinaView.astro` · servizi climatizzazione e pneumatici; forno di verniciatura; gestione sinistri.
- `src/views/HomeView.astro` · politica dei preventivi ("prezzo chiaro prima di iniziare"); parcheggio clienti.
- `src/views/ShowroomView.astro` · permute e finanziamenti.
- `src/views/CarDetailView.astro` · cosa include la consegna (controlli, passaggio di proprietà, garanzia).
- `src/components/RequestForm.astro` · tempi di risposta reali.
- `src/views/AziendaView.astro` · storia, anni delle tappe, team, indicazioni stradali (A22 uscita Bolzano Sud).

**Contenuti da sostituire**
- `src/components/Marquee.astro` · confermare l'elenco delle marche e che vada bene mostrarne i loghi (indicano le marche trattate, non una concessione ufficiale).
- `src/views/AziendaView.astro` · foto showroom dalle recensioni Google: se caricate da clienti, chiedere il permesso o sostituirle; confermare che lo showroom sia nella stessa sede.
- Tutte le foto sono Unsplash segnaposto, marcate `TODO: sostituire con foto della sede` (Home, Revisione, Officina, Azienda, schede auto). Con le foto reali: metterle in `src/assets/` e usare `<Image />` di `astro:assets` (vedi `src/lib/img.ts` e `src/components/Photo.astro`).
- `src/content/cars/*.json` · 8 auto **DEMO** (`"demo": true`), vedi `src/content/cars/LEGGIMI.md`.
- `src/views/AziendaView.astro` · ritratti e nomi del team (oggi riquadri "Foto in arrivo").

**Funzioni da collegare**
- `src/components/RequestForm.astro` · invio dei moduli (preventivo, contatti, richiesta info auto) e caricamento foto: oggi solo frontend.
- `src/components/RevisionCalculator.astro` · "Avvisami prima della scadenza": oggi solo interfaccia (servirà un servizio email o WhatsApp Business API).
- `.env` · `PUBLIC_GOOGLE_MAPS_API_KEY` per le recensioni Google live (`src/components/GoogleReviews.astro`). Nessuna recensione è inventata o scritta a mano.
- `src/components/MapBlock.astro` · collegare la mappa al banner cookie.
- `src/components/Footer.astro` · pagine Privacy e Cookie.

## Note

- I dati reali (ragione sociale, P. IVA, indirizzo, telefono, orari lun–ven, coordinate, link di prenotazione DEKRA, voto Google 4,5 su 61 recensioni) vengono dal sito attuale, dalla scheda DEKRA e dal brief. Tutti i testi sono scritti da zero.
- Il tedesco è tedesco standard con la terminologia altoatesina: "Revision" (non "HU/TÜV"), "Tageszulassung" per km 0, "MwSt.-Nr." per la P. IVA, "PS" per i cavalli.
