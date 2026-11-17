# Car Trade Bolzano · demo del nuovo sito

Demo di proposta per **CAR TRADE SRL** (Via Werner von Siemens 4/F, Bolzano): centro revisioni affiliato DEKRA, officina e carrozzeria.
Sito in tre lingue (italiano `/it/`, tedesco `/de/`, inglese `/en/`), pensato prima di tutto per il telefono.

**Niente database e niente gestionale.** Il cliente si contatta solo con i canali della pagina Contatti: telefono, WhatsApp, prenotazione della revisione sul portale DEKRA e i moduli contatti/preventivo, che arrivano **per email** al titolare. Sul sito non resta salvato nessun dato.
La versione con lista clienti, iscrizione ai promemoria e area admin è **archiviata** in [`archivio/lista-clienti/`](archivio/lista-clienti/LEGGIMI.md), pronta per essere ripresa.

- Direzione estetica, palette, tipografia, griglia e motion: [DESIGN.md](DESIGN.md)
- Pubblico, tono e principi: [PRODUCT.md](PRODUCT.md)
- Variabili d'ambiente: [.env.example](.env.example)

## Indice

1. [Avvio](#avvio)
2. [Stack e struttura](#stack-e-struttura)
3. [Moduli contatti e preventivo: email al titolare](#moduli-contatti-e-preventivo-email-al-titolare)
4. [Foto reali: cosa scattare](#foto-reali-cosa-scattare)
5. [Funzioni del sito da mostrare](#funzioni-del-sito-da-mostrare)
6. [Qualità verificata](#qualità-verificata)
7. [Cosa serve dal cliente e TODO nel codice](#cosa-serve-dal-cliente)
8. [Lista clienti e admin: archiviati](#lista-clienti-e-admin-archiviati)

## Avvio

Serve Node.js 22 o superiore.

```bash
npm install
cp .env.example .env   # facoltativo: senza chiavi i moduli confermano l'invio in modalità simulata
npm run dev            # http://localhost:4321  (Astro 7 avvia il server in background: `npx astro dev stop` per fermarlo)
npm run build          # build per Vercel in .vercel/output/ (pagine statiche + la funzione /api/richiesta)
npm run check          # controllo dei tipi (0 errori attesi)
```

**Sito online su Vercel: https://www.cartradebz.com** (deploy da GitHub: produzione a ogni push su `main`, anteprima per ogni altro branch). Il dominio è registrato su Aruba (dove resta anche il vecchio sito, in `/_sito-vecchio-2026-11`); i record DNS del sito puntano a Vercel, la posta non cambia. `cartradebz.com` senza www rimanda a `www`. Il vecchio workflow FTP `.github/workflows/deploy-aruba.yml` è disattivato (solo avvio manuale).

### Google Maps e recensioni Google

Il sito è collegato alla scheda Google reale **"Centro Revisioni Dekra - Car Trade Srl"** (Place ID e cid in `src/data/site.ts`).

- **Voto e numero sono statici** (scelta voluta, niente API): 4,6 su 5 e "66 recensioni" (aggiornati al 17/11/2026), in `site.google` dentro `src/data/site.ts`. Quando cambiano sulla scheda si aggiornano lì a mano (`rating`, `reviewCount`, `reviewCountLabel`).
- La sezione recensioni mostra il logo Google, voto, numero e i pulsanti "Leggi tutte le recensioni" e "Lascia una recensione" (portano alla scheda vera).
- La mappa Google è incorporata e mostra la scheda. Con `PUBLIC_GOOGLE_MAPS_API_KEY` (vedi `.env.example`) passa alla Maps Embed API ufficiale; non è necessaria.

## Stack e struttura

- **Astro 7** + **Tailwind CSS 4**, nessun framework JavaScript lato client.
- **@astrojs/vercel**: il sito resta **prerenderizzato** (HTML statico); solo `/api/richiesta` è una funzione on-demand (`export const prerender = false`).
- **Resend** per inoltrare al titolare le richieste dei moduli. Nessun database.
- Variabili d'ambiente tipizzate con `astro:env` (`astro.config.mjs`): tutte facoltative.
- **GSAP + ScrollTrigger** caricati in modo lazy solo dove servono; **Lenis** solo su desktop con mouse; con "riduci movimento" non si carica nulla.
- Font **Archivo** variabile, self-hosted e ridotto ai caratteri latini.

```
src/
  data/site.ts            dati aziendali reali (indirizzo, telefono, orari, tariffa, link DEKRA, Place ID): unica fonte
  data/foto.ts            mappa delle foto del sito: posizione → nome file fisso, segnaposto, inquadratura
  assets/foto/            foto vere (nomi fissi), ottimizzate da astro:assets
  i18n/                   rotte localizzate (IT/DE/EN), testi comuni
  lib/revisione.ts        regola della scadenza revisione (calcolatore)
  lib/contatti.ts         moduli contatti/preventivo: validazione lato server e testo dell'email al titolare
  lib/email/render.ts     impaginazione HTML delle email (tabelle, stili inline)
  lib/server/             solo server: configurazione, invio email con Resend, controlli anti-abuso
  views/                  le pagine del sito, con i testi IT, DE ed EN affiancati
  pages/it, de, en        rotte del sito (file sottili che richiamano le viste)
  pages/api/richiesta.ts  invio dei moduli contatti e preventivo
  pages/llms.txt.ts       presentazione per assistenti e motori di risposta (IT + DE + EN)
archivio/lista-clienti/   versione con database, promemoria e admin (fuori dal sito, non pubblicata)
```

Pagine: Home · Revisione · Officina · Carrozzeria · Gomme · Azienda · Contatti · Privacy · 404, in italiano, tedesco e inglese. Ogni servizio ha la sua pagina (ricerche "officina / carrozzeria / cambio gomme Bolzano"); i vecchi URL `officina-carrozzeria` reindirizzano con 301 (`vercel.json`).

## Moduli contatti e preventivo: email al titolare

I moduli della pagina **Contatti** e del **preventivo** (pagina Officina e carrozzeria, con fino a 6 foto) inviano a `/api/richiesta`, che manda un'email al titolare con le foto allegate. Il server rivalida i dati (`src/lib/contatti.ts`), non salva nulla.

- **Destinatario fisso**: `flavio@cartradebz.it`, cioè `site.email` in `src/data/site.ts` (la stessa email mostrata sul sito). Non dipende da variabili d'ambiente.
- **L'email** ha come mittente "Sito web Car Trade Bolzano", oggetto `Richiesta dal sito web · Preventivo carrozzeria · Nome Cognome`, l'etichetta **"Richiesta proveniente dal sito web"**, la riga *Provenienza* (modulo e pagina), data e ora d'invio, i dati del cliente, le foto allegate e i bottoni per rispondere (WhatsApp o telefono, email). Rispondendo si scrive direttamente al cliente (Reply-To), se ha lasciato l'email.
- **Configurazione** (su Vercel → Settings → Environment Variables, poi Redeploy): `RESEND_API_KEY` e `EMAIL_FROM` (solo l'indirizzo del mittente, su un dominio verificato in Resend: **Domains** → aggiungi il dominio → copia i record DNS → **Verify**).
- **Senza `RESEND_API_KEY`**: in sviluppo il modulo conferma in modalità simulata; **online mostra un errore** e propone di mandare lo stesso testo su WhatsApp, già scritto (mai una finta conferma). Lo stesso succede se Resend rifiuta l'invio.
- **Anti-abuso**: destinatario fisso, campo esca (honeypot) contro i bot, controllo dell'origine, massimo 6 richieste ogni 10 minuti per IP, tetto di 60 email al giorno (contati in memoria, per istanza del server).
- Il calcolatore della scadenza offre **"Aggiungi al calendario"**: un file `.ics` con un avviso un mese prima, che resta sul telefono di chi lo usa.

## Foto reali: cosa scattare

Le foto vanno in **`src/assets/foto/`** con il **nome fisso** della tabella (estensione `.jpg`, `.png`, `.webp` o `.avif`). Al build successivo il sito le usa al posto delle foto Unsplash e le ottimizza da solo (AVIF e WebP, larghezze giuste per ogni schermo). La mappa con tutte le posizioni è in `src/data/foto.ts`.

Perché `src/assets/` e non `public/`: `astro:assets` ottimizza solo le immagini dentro `src/`; quelle in `public/` verrebbero servite così come sono, pesanti.

Consigli generali: luce naturale, officina in ordine, almeno **2400 px** di lato lungo per le foto grandi, niente persone riconoscibili senza consenso, niente loghi DEKRA finché non sono chiare le regole d'uso.

| File | Dove compare | Inquadratura consigliata |
|---|---|---|
| `hero` | Home, foto a tutto schermo | Officina con un'auto sul ponte e un meccanico al lavoro. Orizzontale, soggetto al centro un po' sotto la metà (sopra va il titolo). |
| `revisione-linea` | Revisione (foto larga), indice servizi Home | Linea di revisione con un'auto sopra (banco freni o ponte), di tre quarti, inquadratura larga e bassa. |
| `officina-motore` | Officina, in alto | Mani del meccanico sul vano motore con lampada o strumento di diagnosi, ravvicinata. |
| `officina-ponti` | Officina, indice servizi Home | Panoramica dell'officina con 2–3 auto sui ponti, dall'ingresso, ad altezza occhi. |
| `officina-gomme` | Officina (solo computer) | Cambio gomme: mani con guanti che montano una ruota, o la smontagomme. |
| `carrozzeria` | Officina, indice servizi Home | Già presente (foto del cliente): carrozziere al lavoro su una fiancata, luce radente. |
| `carrozzeria-dettaglio` | Officina (solo computer) | **Verticale**: carteggiatura, mascheratura o forno di verniciatura. |
| `sede` | Azienda, foto in alto | Facciata con l'insegna dal piazzale, con un po' di cielo. Già presente ma a 680 px: serve ≥ 2400 px. |
| `team-1` … `team-4` | Azienda, ritratti | Mezzo busto, stesso taglio per tutti, verticali: titolare, responsabile tecnico, capo officina, carrozziere. Con il nome di ciascuno. |

## Funzioni del sito da mostrare

0. **Schermata di caricamento** con il logo che si compone (a ogni ingresso nel sito, non navigando tra le pagine), **hero a tutto schermo**, transizioni morbide tra le pagine.
   **"Riduci movimento" attivo** (iPhone: Impostazioni › Accessibilità › Movimento): il sito resta completo ma più calmo; i loghi delle marche scorrono più lenti. La fascia dei loghi ha il **pulsante pausa/riprendi** (WCAG 2.2.2).
1. **La revisione DEKRA punto per punto**: disegno tecnico dell'auto che si accende area per area. In Home versione compatta (indice, frecce, punti sull'auto); nella pagina Revisione versione estesa che segue lo scorrimento.
2. **Calcolatore scadenza revisione** (Home e Revisione): scadenza esatta secondo il Codice della Strada, giorni mancanti, misuratore del ciclo, **file `.ics` per il calendario**.
3. **Barra fissa su mobile**: Chiama · WhatsApp · Prenota (portale DEKRA).
4. **Preventivo carrozzeria con foto**: fino a 6 foto dal telefono, ridimensionate nel browser, **inviate davvero** al titolare in allegato.
5. **Aperto ora / Chiuso ora** sul fuso di Roma; **selettore lingua** IT/DE/EN; avviso discreto se il browser preferisce un'altra lingua.
6. **FAQ** con risposte vere su Home, Revisione e Officina.

## Qualità verificata

- `npm run check`: 0 errori, 0 avvisi. `npm run build`: completato.
- Verifiche precedenti (prima della rimozione di lista clienti e admin, novembre 2026): **axe-core 4.10** 0 violazioni WCAG 2.2 AA sulle pagine pubbliche a 390 e 1440 px; **Lighthouse 12 mobile** Accessibilità, Best practice e SEO 100 su Home, Officina e Revisione. Da ripetere dopo le ultime modifiche (sezione revisione DEKRA, inglese).
- **SEO e GEO**: schema.org `AutoRepair` con `hasMap` e `sameAs` (scheda Google per cid e pagina DEKRA), `areaServed`, `makesOffer`, `knowsLanguage`; `FAQPage` su Home, Revisione e Officina; `hreflang` IT/DE/EN con `x-default` inglese; sitemap generata con le alternative linguistiche; `llms.txt` in tre lingue; `robots.txt` che esclude `/api/`. Da fare al lancio: una Content-Security-Policy.

## Cosa serve dal cliente

1. **Foto** secondo la [tabella delle foto](#foto-reali-cosa-scattare), in un servizio fotografico unico.
2. **Nomi e ruoli del team**.
3. **Testi azienda**: storia, anno di fondazione, tappe, numeri reali.
4. **Orari confermati**, in particolare il **sabato mattina**.
5. Conferma che il **324 696 5239 è su WhatsApp**. (Email `flavio@cartradebz.it` e fisso `0471 192 3248` già sul sito.)
6. Conferma di **servizi** (climatizzazione, pneumatici, forno di verniciatura, sinistri) e **tempi di risposta** ai preventivi.
7. Testi **privacy e cookie** dal consulente (oggi pagina segnaposto, già scritta per i soli moduli senza database).
8. Regole d'uso del **marchio DEKRA**: finché non sono chiare, solo la dicitura "Centro revisioni affiliato DEKRA", senza logo.

## Elenco dei TODO nel codice

Cercali con `grep -rn TODO src astro.config.mjs`.

**Dati da confermare**
- `src/data/site.ts` · sabato; WhatsApp; tariffa revisione 79,02 €.
- `src/layouts/Base.astro`, `src/components/HoursTable.astro` · sabato; immagine social per l'inglese (`public/og/og-en.jpg`).
- `astro.config.mjs` · dominio definitivo.
- `src/views/RevisioneView.astro` · durata del controllo, metodi di pagamento, nuova revisione dopo "ripetere".
- `src/views/OfficinaView.astro` · climatizzazione, pneumatici, forno, sinistri; FAQ su preventivi e tempi di risposta.
- `src/views/HomeView.astro` · politica dei preventivi; parcheggio clienti.
- `src/components/RequestForm.astro` · tempi di risposta reali.
- `src/views/AziendaView.astro` · storia, tappe, nomi del team, indicazioni stradali.

**Contenuti da sostituire**
- `src/components/Marquee.astro` · elenco delle marche e uso dei loghi.
- Foto Unsplash segnaposto: si sostituiscono senza toccare il codice, vedi [Foto reali](#foto-reali-cosa-scattare).
- `src/views/PrivacyView.astro` · informativa definitiva IT, DE ed EN.

**Da collegare al lancio**
- `src/components/MapBlock.astro` · mappa collegata al banner cookie.

## Lista clienti e admin: archiviati

Su richiesta del cliente, per ora il sito non ha database né gestionale. In [`archivio/lista-clienti/`](archivio/lista-clienti/LEGGIMI.md) c'è la copia completa della versione precedente: iscrizione ai promemoria (`/it/promemoria/`), lista clienti su Supabase, area admin (`/admin/`: clienti, promemoria, campagne, recensioni, locandina QR), email e WhatsApp ai clienti, con README, schema SQL e variabili d'ambiente. La cartella non viene compilata né pubblicata; il `LEGGIMI.md` spiega come ripristinarla.

## Note

- I dati reali (ragione sociale, P. IVA, indirizzo, telefono, orari lun–ven, coordinate, link DEKRA, voto Google 4,6) vengono dal sito attuale, dalla scheda DEKRA e dal brief. Tutti i testi sono scritti da zero; nessuna recensione è inventata.
- Il tedesco è tedesco standard con la terminologia altoatesina: "Revision" (non "HU/TÜV"), "MwSt.-Nr." per la P. IVA. In tedesco si usa "Sie". L'inglese è britannico ("tyres", "centre"), con "inspection" per la revisione.
