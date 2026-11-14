# DESIGN.md · Car Trade Bolzano

## Direzione estetica: "scheda tecnica"
Scena d'uso: un automobilista di Bolzano controlla dal telefono, in pausa pranzo o nel parcheggio sotto il sole, quando scade la revisione e se può passare lunedì mattina. Luce piena, fretta, una mano sola. Quindi **base chiara**, contrasto alto, azioni grandi in basso.

Il sito parla come il foglio di collaudo di un'officina tedesca: righe sottili da 1px, etichette piccole in maiuscolo, numeri grandi e tabulari, sezioni numerate (01, 02...). La firma visiva è la **linea del tetto** del logo: una linea navy che finisce in arancio, ridisegnata in SVG e animata (si "disegna" nell'hero e torna come divisore). Le foto sono protagoniste, sempre a tutta larghezza o in tagli netti, mai dentro card arrotondate.

Cosa evitiamo: card identiche con icone, gradienti, glassmorphism, emoji, stock photo con pollici alzati, raggi di bordo morbidi (si usa 2px, quasi spigolo).

## Palette (estratta dai pixel del logo)
| Token | Hex | Uso |
|---|---|---|
| `paper` | `#F7F6F3` | Fondo principale (è il fondo del logo originale) |
| `paper-2` | `#EEECE7` | Fondo alternato, campi form |
| `ink` / navy | `#0E2340` | Testo, blu di "TRADE" e della silhouette |
| `night` | `#0A1A30` | Sezioni di contrasto (navy del logo scurito) |
| `orange` | `#E8710A` | Arancio di "CAR" e della coda della silhouette. **Solo CTA e dettagli chiave** |
| `orange-ink` | `#A64F08` | Arancio per testo piccolo su fondo chiaro (5,2:1) |
| `steel` | `#C9D2DF` | Grigio-azzurro di "BOLZANO", testo secondario su scuro |
| `muted` | `#4A5A70` | Testo secondario su chiaro (6,5:1) |

Nota: il brief parlava di un azzurro nella silhouette; nel logo fornito la silhouette è navy + arancio, quindi non c'è azzurro. Lo `steel` di "BOLZANO" fa da terzo colore freddo.

Regole di contrasto: il bottone primario è **arancio con testo navy** (5,1:1). Il bianco su arancio si ferma a 2,9:1 e non passa AA, quindi non si usa. Su `night` l'arancio pieno va bene anche per il testo (5,7:1).

Strategia: Restrained con blocchi Committed. Carta chiara per l'80% della pagina, 1-2 blocchi `night` per pagina (fiducia, calcolatore), arancio sotto il 5% della superficie.

## Tipografia
**Archivo** (Omnibus-Type, variabile, asse di peso 100-900 e di larghezza 62-125%), un solo file da 90 KB, self-hosted e precaricato.
- Titoli: Archivo a **larghezza 125%** (Expanded), peso 600-700, interlinea stretta e tracking leggermente negativo. Il taglio largo richiama il lettering espanso del logo e la grafica automotive (targhe, cruscotti) senza scivolare nel fantascientifico di Michroma/Orbitron.
- Testi: la stessa Archivo a **larghezza 100%**, peso 400-500. È un grotesk nato per la leggibilità a schermo, con buone cifre tabulari per prezzi, km e date.
- Etichette tecniche: Archivo 112%, 11-12px, maiuscolo, tracking +0,08em, cifre tabulari.

Perché una famiglia sola: la variazione di larghezza dà il contrasto "largo per i titoli, pulito per i testi" chiesto dal brief con un solo file da scaricare (meglio per LCP), e tiene tutto coerente. Scartate: Space Grotesk, Inter, DM Sans (default da template AI); Clash Display e Syne (troppo "agenzia"); Michroma (troppo sci-fi per un'officina).

Scala fluida (rapporto ~1,3): `display` clamp(2.6rem, 8vw, 6.5rem) · `h1` clamp(2.2rem, 5.5vw, 4.5rem) · `h2` clamp(1.75rem, 3.6vw, 3rem) · `h3` 1.375rem · `body` 1.0625rem · `small` 0.875rem · `label` 0.75rem.

## Griglia e spazi
- 4 colonne su mobile, 12 da 1024px in su; contenitore massimo 1440px; gutter laterale 16px / 24px / 40px.
- Ritmo verticale variabile: sezioni da `clamp(4rem, 10vw, 9rem)`, gruppi interni stretti (0,5-1,5rem). Niente padding identici ovunque.
- Righe da 1px `ink/14%` come struttura visibile (liste servizi, tabelle specifiche, intestazioni sezione con numero).
- Raggi: 2px per campi e bottoni, 0 per foto.

## Motion
Ease-out esponenziali (`cubic-bezier(.16,1,.3,1)`), niente rimbalzi. GSAP + ScrollTrigger solo dove serve:
1. Hero: la linea del tetto si disegna (navy, poi la coda arancio), le righe del titolo salgono da una maschera.
2. Indice servizi: righe che entrano in sequenza; su desktop una foto segue il cursore sulla riga attiva.
3. Fiducia: il 4,5 conta da 0 quando entra in vista.
4. Divisori: le righe sottili si allungano (scaleX) all'ingresso.
Lenis solo su desktop con puntatore fine. Con `prefers-reduced-motion` niente spostamenti né parallax: restano la schermata di caricamento (dissolvenze) e la fascia dei loghi (più lenta, con pulsante pausa/riprendi per WCAG 2.2.2). Senza JavaScript il contenuto è comunque leggibile.

## Ingresso, hero e navigazione
- **Schermata di caricamento** (`Preloader.astro`): a ogni ingresso nel sito e a ogni ricarica, mai navigando tra le pagine; con "riduci movimento" in versione calma (dissolvenze). Il logo si compone in tre fasce (linea del tetto che si disegna, CARTRADE che sale da una maschera, filetto arancio e BOLZANO), con contatore 000→100 e barra legati al caricamento reale di font e foto. Uscita a sipario con bordo arancio, durata 1,6–3,8 s. Mai con "riduci movimento" o senza JavaScript. Le animazioni della pagina restano in pausa sotto il sipario e partono quando si alza.
- **Hero Home**: foto a tutto schermo virata sul blu del marchio (filtro + navy in moltiplica + velo dal basso). La composizione ricalca il logo: linea del tetto sopra il titolo, filetto arancio con "BOLZANO · BOZEN" sotto. Header trasparente sulla foto che diventa carta allo scorrimento. Fascia dati scura subito sotto.
- **Hero fotografica delle pagine interne** (`PhotoHero.astro`, oggi su Azienda): stesso linguaggio della Home. Su mobile la foto sta in alto e sfuma nel blu, per non ingrandire troppo foto a bassa risoluzione.
- **Fascia scorrevole** con i servizi in tipografia larga (piena/contorno alternate), separati dalla linea del tetto.
- **Transizioni tra pagine**: View Transitions native tra documenti (CSS, zero JavaScript); header e barra mobile restano fermi.
- **Bottoni secondari**: riempimento che scorre da sinistra al passaggio del mouse.

## Componenti chiave
- **Barra CTA mobile** fissa in basso: Chiama · WhatsApp · Prenota (arancio). Sotto i 1024px.
- **Header**: logo · menu (4 voci) · azioni. Da desktop griglia `1fr auto 1fr`: il menu sta al centro esatto della pagina.
- **Selettore lingua** IT/DE/EN: nell'header un bottone discreto (globo + codice + freccia) che apre l'elenco con i nomi per esteso e la spunta sulla lingua attiva (`<details>` nativo, funziona anche senza JS; si chiude cliccando fuori o con Esc). Nel menu mobile le tre lingue per esteso in riga. La scelta viene ricordata (`localStorage ct-lang`).
- **Lingua del browser**: la radice `/` porta alla lingua scelta in passato, altrimenti alla prima lingua del browser tra IT/DE/EN, per le altre lingue all'inglese (x-default). Sulle pagine nessun reindirizzamento forzato: se il browser preferisce un'altra lingua disponibile compare un avviso discreto in basso ("Questa pagina è disponibile in italiano"), scritto nella lingua proposta e chiudibile.
- **Calcolatore scadenza revisione**: mese/anno, risultato grande in stile cruscotto, conto alla rovescia, file .ics, "Avvisami" (email/WhatsApp, demo).
- **Banco di collaudo** (`InspectionTour.astro`, Home sezione 02 e pagina Revisione sezione 02): come si svolge la revisione nelle 9 aree della scheda DEKRA + esito (fonte: revisione.dekra.it/prove-e-risultati). Disegno tecnico SVG dell'auto in vista laterale (muso a sinistra come la linea del tetto), griglia da foglio tecnico, linee nascoste tratteggiate. Scorrendo, il passaggio che attraversa il 55% dello schermo accende in arancio la sua zona sull'auto, sposta la linea di scansione e aggiorna il display (controllo 01/09, strumento, barra a 10 segmenti); i punti già fatti mostrano la spunta. Su desktop il banco è fisso a sinistra e i passaggi non attivi si attenuano; su mobile il banco resta fermo sotto l'header a tutta larghezza. I punti sul disegno sono bottoni che portano al passaggio. Senza JavaScript resta l'elenco completo.
  Due varianti: **full** (pagina Revisione) come sopra; **compact** (Home, una schermata sola): stesso banco, pannello di dettaglio sotto il disegno (pannelli sovrapposti, altezza del più lungo: niente salti né CLS), indice dei 10 passi a destra su desktop, frecce Precedente/Successivo su mobile. Si sfoglia solo a mano (frecce, indice, punti): niente scorrimento automatico. Senza JS le voci dell'indice portano ai passi della versione estesa.
- **Ritmo dei fondi in Home**: hero notte → servizi carta → revisione (compatta) notte → fiducia carta-2 → scadenza notte → dove/FAQ carta. Mai due blocchi notte attaccati.
- **Promemoria revisione** (`/it/promemoria/`): modulo in quattro blocchi numerati come una scheda tecnica (01 dati, 02 auto, 03 canale, 04 consensi), anteprima della scadenza mentre si compila, conferma con la data grande in stile cruscotto e la cronologia dei messaggi.

## Area admin (registro "prodotto")
Scena d'uso: il titolare al bancone o in officina, telefono in una mano, tra un cliente e l'altro; a volte al computer in ufficio. Quindi **prima il telefono**: barra in basso con quattro sezioni + "Altro", azioni grandi; da 1024 px barra laterale.
- Stessi token del sito (carta, navy, arancio, Archivo) ma **scala fissa** (titoli 1,625–2 rem, niente clamp), poco movimento (solo stati: caricamento, conferma, comparsa di un cliente nuovo), nessuna animazione d'ingresso.
- Numeri in **strisce con righe sottili** (come la fascia dati della Home), mai card con icone. Elenchi a righe, non a schede.
- Etichette di stato piccole e maiuscole: **Nuovo** (arancio pieno, clienti veri), **Esempio** (grigio), scadenze (arancio chiaro entro 30 giorni, rosso se scaduta). Tutte sopra 4,5:1.
- Conferme distruttive in due passi sul bottone stesso ("Prepara l'invio" → "Conferma l'invio"), niente finestre modali.
- Esiti delle azioni in un avviso in basso (`role=status`), il fuoco torna sul bottone usato.
- Email: tabelle e stili in linea, larghezza 600 px, filetto navy + arancio come la linea del tetto, bottone arancio con testo navy, piede navy con indirizzo e orari.

