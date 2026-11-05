# Car Trade Bolzano · demo del nuovo sito e della lista clienti

Demo di proposta per **CAR TRADE SRL** (Via Werner von Siemens 4/F, Bolzano): centro revisioni affiliato DEKRA, officina, carrozzeria, auto usate e km 0.
Sito bilingue (italiano `/it/`, tedesco `/de/`), pensato prima di tutto per il telefono, più un'**area clienti** (`/admin/`) con promemoria, campagne e richieste di recensione.

> **Il messaggio per il titolare:** il gestionale DEKRA resta com'è. Questo aggiunge quello che DEKRA non ti dà: i tuoi clienti, che tornano da te.

- Direzione estetica, palette, tipografia, griglia e motion: [DESIGN.md](DESIGN.md)
- Pubblico, tono e principi: [PRODUCT.md](PRODUCT.md)
- Database: [supabase/schema.sql](supabase/schema.sql) · Variabili d'ambiente: [.env.example](.env.example)

## Indice

1. [Avvio](#avvio)
2. [Stack e struttura](#stack-e-struttura)
3. [Lista clienti: messa in funzione passo passo](#lista-clienti-messa-in-funzione-passo-passo) (Supabase, Resend, Vercel)
4. [Come entrare nell'admin e ripristinare la demo](#come-entrare-nelladmin-e-ripristinare-la-demo)
5. [Copione di 5 minuti per l'incontro](#copione-di-5-minuti-per-lincontro)
6. [Checklist del giorno prima](#checklist-del-giorno-prima)
7. [Come funziona la lista clienti](#come-funziona-la-lista-clienti) (sicurezza, modalità simulata, WhatsApp, produzione)
8. [Foto reali: cosa scattare](#foto-reali-cosa-scattare)
9. [Funzioni del sito da mostrare](#funzioni-del-sito-da-mostrare)
10. [Qualità verificata](#qualità-verificata)
11. [Cosa serve dal cliente e TODO nel codice](#cosa-serve-dal-cliente)

## Avvio

Serve Node.js 22 o superiore.

```bash
npm install
cp .env.example .env   # facoltativo: senza chiavi tutto gira in modalità simulata
npm run dev            # http://localhost:4321  (Astro 7 avvia il server in background: `npx astro dev stop` per fermarlo)
npm run build          # build per Vercel in .vercel/output/ (pagine statiche + funzioni /api e /admin)
npm run check          # controllo dei tipi (0 errori attesi)
```

In locale, senza `ADMIN_DEMO_PASSWORD`, la password dell'admin è `demo` (solo in sviluppo: in produzione senza variabile l'admin resta chiuso).

**Demo online su Vercel** (deploy da GitHub: produzione a ogni push su `main`, anteprima per ogni altro branch). `vercel.json` aggiunge l'header `X-Robots-Tag: noindex` a tutto il sito: la demo non viene indicizzata. **Al lancio sul dominio vero, togliere quell'header** da `vercel.json`. Prima della messa online: confermare il dominio in `astro.config.mjs` (oggi `https://cartradebolzano.it`).

### Google Maps e recensioni Google

Il sito è collegato alla scheda Google reale **"Centro Revisioni Dekra - Car Trade Srl"** (Place ID e cid in `src/data/site.ts`).

- **Senza chiave** (come adesso): la mappa Google è incorporata e mostra la scheda con voto e recensioni; la sezione recensioni mostra voto, numero e i pulsanti "Leggi tutte le recensioni" e "Lascia una recensione".
- **Con la chiave**: compaiono anche le **card con le recensioni vere** (le 5 che Google considera più pertinenti, nella lingua della pagina) e voto e numero si aggiornano da soli. La mappa passa alla Maps Embed API ufficiale.

Per attivarla: segui le istruzioni in `.env.example` (progetto Google Cloud, tre API, chiave limitata al dominio), imposta `PUBLIC_GOOGLE_MAPS_API_KEY` e rifai il build. Le recensioni si caricano nel browser e non in build perché le policy di Google Places vietano di salvarne i contenuti; si caricano solo quando la sezione sta per entrare in vista.

## Stack e struttura

- **Astro 7** + **Tailwind CSS 4**, nessun framework JavaScript lato client.
- **@astrojs/vercel**: il sito pubblico resta **prerenderizzato** (HTML statico); solo `/api/*` e `/admin/*` sono funzioni on-demand (`export const prerender = false`).
- **Supabase** (database dei clienti, solo dal server), **Resend** (email), **qrcode** (QR della locandina). Nessun'altra dipendenza nuova.
- Variabili d'ambiente tipizzate con `astro:env` (`astro.config.mjs`): tutte facoltative, se mancano la demo passa alla modalità simulata.
- **GSAP + ScrollTrigger** caricati in modo lazy solo dove servono; **Lenis** solo su desktop con mouse; con "riduci movimento" non si carica nulla.
- Font **Archivo** variabile, self-hosted e ridotto ai caratteri latini.

```
src/
  data/site.ts            dati aziendali reali (indirizzo, telefono, orari, tariffa, link DEKRA, Place ID): unica fonte
  data/foto.ts            mappa delle foto del sito: posizione → nome file fisso, segnaposto, inquadratura
  assets/foto/            foto vere (nomi fissi), ottimizzate da astro:assets
  i18n/                   rotte localizzate (IT/DE), testi comuni, etichette auto
  lib/revisione.ts        regola della scadenza revisione (calcolatore, iscrizione, email, admin)
  lib/crm/                lista clienti: tipi, validazione, regole promemoria, campagne, testi email/WhatsApp, esempi
  lib/email/render.ts     impaginazione HTML delle email (tabelle, stili inline)
  lib/server/             solo server: configurazione, Supabase, invio email con limiti, sessione admin, WhatsApp API
  admin/                  dati e interfaccia dell'admin nel browser (unione veri + esempi, modalità simulata)
  views/                  le pagine del sito, con i testi IT e DE affiancati
  pages/it, pages/de      rotte del sito (file sottili che richiamano le viste)
  pages/admin/            area admin (solo italiano, on-demand)
  pages/api/              endpoint: iscrizione, richiesta, admin/*
  pages/llms.txt.ts       presentazione per assistenti e motori di risposta (IT + DE)
supabase/schema.sql       tabelle demo_clienti, demo_eventi, demo_auto + storage, RLS attiva
```

Pagine pubbliche: Home · Revisione · Officina e carrozzeria · Auto · Scheda auto · Azienda · Contatti · **Promemoria revisione** (`/it/promemoria/`, `/de/erinnerung/`) · **Privacy** (`/it/privacy/`, `/de/datenschutz/`) · 404.
Area admin: Panoramica · Clienti · Scheda cliente · Promemoria · Campagne · Recensioni · Showroom · Modelli email · Locandina QR.

## Lista clienti: messa in funzione passo passo

Senza questi passaggi la demo funziona lo stesso, ma in **modalità simulata** (dati nel browser, nessun messaggio vero). Per l'incontro con il titolare servono tutti e cinque.

### 1. Supabase (database, piano gratuito)

1. Vai su [supabase.com](https://supabase.com) → **New project**. Nome: `cartrade-demo`, regione **Frankfurt (eu-central-1)**, password del database lunga (salvala, non serve al sito).
2. Quando il progetto è pronto: **SQL Editor** → **New query** → incolla tutto [supabase/schema.sql](supabase/schema.sql) → **Run**. Crea le tabelle `demo_clienti`, `demo_eventi`, `demo_auto` e lo storage privato `demo-auto`. Si può rieseguire senza danni.
3. **Project Settings** → **API**: copia **Project URL** (→ `SUPABASE_URL`) e la chiave **service_role** (→ `SUPABASE_SERVICE_ROLE_KEY`).
   La service role salta la RLS: va **solo** nelle variabili del server su Vercel, mai in variabili `PUBLIC_` né nel codice. Le tabelle hanno la RLS attiva e nessuna policy: con la chiave pubblica (anon) non si legge nulla.

### 2. Resend (email) e verifica del dominio auralpdigital.com

1. Crea l'account su [resend.com](https://resend.com).
2. **Domains** → **Add Domain** → `auralpdigital.com`, regione **EU (Ireland)**. Resend mostra 3–4 record DNS (di solito: un **MX** e un **TXT SPF** sul sottodominio `send`, un **TXT DKIM** su `resend._domainkey`; facoltativo un **TXT DMARC** su `_dmarc`).
3. Se il DNS di `auralpdigital.com` è gestito da Vercel: **vercel.com** → **Domains** (dal menu del team) → `auralpdigital.com` → **DNS Records** → **Add** per ogni riga di Resend:
   - **Name**: quello che Resend indica *senza* il dominio (es. `send`, `resend._domainkey`, `_dmarc`);
   - **Type**: MX o TXT come indicato; **Value**: copiato esattamente; per l'MX la **Priority** indicata (di solito 10); TTL predefinito.
   (Se il DNS è presso un altro registrar, i record vanno aggiunti lì: Vercel li gestisce solo se i nameserver del dominio puntano a Vercel.)
4. Torna su Resend → **Verify DNS Records**. Di solito bastano pochi minuti (fino a qualche ora). Lo stato deve diventare **Verified**.
5. **API Keys** → **Create API Key**, permesso **Sending access**, dominio `auralpdigital.com` → copia la chiave (→ `RESEND_API_KEY`).
6. Mittente: `EMAIL_FROM="Car Trade Bolzano · demo <demo@auralpdigital.com>"` (è anche il valore predefinito). Le risposte dei clienti arrivano a `DEMO_OWNER_EMAIL` (Reply-To).

### 3. Variabili su Vercel

Vercel → progetto `cartrade-bolzano-demo` → **Settings** → **Environment Variables**. Aggiungile per **Preview** e **Production**:

| Variabile | Valore |
|---|---|
| `SUPABASE_URL` | Project URL di Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | chiave service_role (segreta) |
| `RESEND_API_KEY` | chiave Resend con Sending access |
| `EMAIL_FROM` | `Car Trade Bolzano · demo <demo@auralpdigital.com>` |
| `DEMO_OWNER_EMAIL` | l'email demo del titolare: riceve contatti e preventivi (con le foto) |
| `DEMO_KEY` | stringa casuale lunga, es. il risultato di `openssl rand -hex 12` |
| `ADMIN_DEMO_PASSWORD` | password dell'admin, da dire a voce al titolare |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TEMPLATE` | facoltative, vedi [WhatsApp](#whatsapp) |

Poi **Deployments** → ultimo deploy del branch → **⋯** → **Redeploy**: le variabili valgono solo per i deploy fatti dopo.

### 4. Protezione delle anteprime: da disattivare

Le anteprime di Vercel sono protette da **Vercel Authentication**: chi non è nel team vede la pagina di login di Vercel. Il titolare che inquadra il QR col suo telefono resterebbe bloccato.
**Settings** → **Deployment Protection** → **Vercel Authentication** → **Disabled** (oppure limitata alla sola produzione) → **Save**. La demo resta comunque fuori da Google (header `noindex`) e l'admin chiede la password.
Verifica: apri l'URL di anteprima dal telefono **in rete mobile** (non dal Wi-Fi dell'ufficio, non da un browser dove sei loggato su Vercel).

### 5. Prova

1. Apri `/admin/` → login → in alto deve comparire **"Dati reali"** (pallino verde) e nessun avviso di modalità simulata.
2. `/admin/locandina/` → nessun avviso su `DEMO_KEY` → inquadra il QR dallo schermo col telefono → iscriviti con la tua email.
3. Entro un minuto arriva l'email di benvenuto; entro 10 secondi compari nella Panoramica come **Nuovo**.
4. Alla fine: **Ripristina demo**.

## Come entrare nell'admin e ripristinare la demo

- **Indirizzo**: `<URL del sito>/admin/` (anche dal telefono). Password: il valore di `ADMIN_DEMO_PASSWORD`. La sessione dura 12 ore; **Esci** è l'icona in alto a destra.
- **Ripristinare la demo**: Panoramica → in fondo, sezione **Demo** → **Ripristina demo** → **Conferma: cancella i clienti veri** (oppure menu **Altro** → Ripristina demo).
  Cancella da Supabase i clienti iscritti per prova, i loro eventi e le auto aggiunte; ricarica i 45 clienti di esempio e le regole predefinite. Restano solo i contatori anonimi degli invii email delle ultime 24 ore (hash, nessun indirizzo), perché il ripristino non azzeri il limite anti-spam.
- Gli esempi si rigenerano anche da soli ogni giorno, con le date sempre relative a oggi.

## Copione di 5 minuti per l'incontro

**Prima di iniziare:** sul computer l'admin aperto sulla **Panoramica**, sul tavolo la **locandina stampata**, il tuo telefono in mano. Il titolare usa il **suo** telefono.

**0:00 · Apertura (30 s)**
Mostra la Panoramica. *"Il gestionale DEKRA resta com'è. Questo aggiunge quello che DEKRA non ti dà: i tuoi clienti, che tornano da te. Qui ci sono 45 clienti di esempio; tra un minuto ci sarai anche tu, vero."*

**0:30 · L'iscrizione dal bancone (1 min)**
Dagli la locandina. *"Questa sta sul bancone. Il cliente aspetta la revisione, inquadra e in 30 secondi è iscritto. Prova tu."*
Lui inquadra, compila targa e mese dell'ultima revisione, spunta i consensi **compreso "offerte"** (serve per il passo della campagna) e mette tra gli interessi **Gomme**.
Mentre scrive: *"Tre consensi separati, nessuno già spuntato: è come lo vuole il Garante."*

**1:30 · Lui compare nella lista (30 s)**
Sul suo telefono c'è la conferma con la sua scadenza. Indica il computer: entro 10 secondi compare in cima, con l'etichetta arancione **Nuovo**. *"Ecco: il tuo primo cliente che è tuo, non di DEKRA."* Nel frattempo gli arriva l'email di benvenuto.

**2:00 · Il promemoria (45 s)**
Apri la sua scheda → **Invia promemoria ora**. *"Questo parte da solo 30 e 7 giorni prima della scadenza, con il link per prenotare su DEKRA. Lo mando adesso solo per fartelo vedere."* Gli arriva l'email.
Poi **Invia su WhatsApp**: si apre WhatsApp con il messaggio già scritto per il suo numero. *"Per chi preferisce WhatsApp: un tocco e il messaggio è pronto. Più avanti può partire anche da solo."*

**2:45 · La campagna (45 s)**
**Campagne** → **Gomme invernali**. Indica il conteggio: *"38 clienti, 7 esclusi perché senza consenso alle offerte: chi non ha detto sì non riceve niente, lo decide il sistema, non noi."* (i numeri cambiano con gli esempi del giorno).
**Prepara l'invio** → **Conferma**. *"Tra i clienti veri la ricevi solo tu; gli esempi sono simulati."* Gli arriva l'email con l'obbligo del 15 novembre.

**3:30 · La recensione (45 s)**
Torna sulla sua scheda → **Lavoro completato** → **Revisione** → **Invia richiesta di recensione**. *"Hai 61 recensioni su Google. Ogni cliente contento a cui lo chiedi al momento giusto è una stella in più, e chi cerca un'officina a Bolzano le legge."* Gli arriva l'email con il pulsante che apre direttamente "Scrivi una recensione" sulla sua scheda.

**4:15 · Cos'altro c'è (30 s)**
Scorri veloce: **Showroom** (*"fotografi l'auto col telefono e vedi subito la scheda"*), **Modelli email** in italiano e tedesco, **Promemoria** con le regole che può cambiare.

**4:45 · Chiusura (15 s)**
**Ripristina demo** davanti a lui. *"Ecco, i tuoi dati sono cancellati, come promesso. Se partiamo, la lista è tua dal primo giorno."*

**Se qualcosa non va:** se la rete cade, l'admin continua in modalità simulata (avviso arancione in alto): fai vedere comunque i passaggi, le email le mostri in **Modelli email**. Se un'email non arriva in 1 minuto, guarda nella cartella Spam e mostra l'anteprima intanto.

## Checklist del giorno prima

- [ ] Variabili impostate su Vercel (Preview) e **Redeploy** fatto; in `/admin/` compare **Dati reali** senza avvisi.
- [ ] **Deployment Protection disattivata**: l'URL di anteprima si apre da un telefono in rete mobile, senza login Vercel.
- [ ] Dominio `auralpdigital.com` **Verified** su Resend.
- [ ] **Prova completa con il tuo numero e la tua email**: QR → iscrizione → benvenuto → "Nuovo" in admin → promemoria → WhatsApp → campagna Gomme invernali → lavoro completato → ripristino. Controlla che le email arrivino in **Posta in arrivo** (Gmail e iCloud), non in Spam.
- [ ] Dopo la prova: **Ripristina demo**. (Limiti: 5 email al giorno per destinatario, 30 in totale: la prova del giorno prima non li consuma per l'incontro.)
- [ ] **Locandina stampata** a colori, A5, al 100%; QR provato con un iPhone e un Android.
- [ ] `DEMO_OWNER_EMAIL` = l'email del titolare per la demo (riceverà anche i preventivi di prova): confermata.
- [ ] **Telefono e computer carichi**, hotspot del telefono pronto come rete di riserva.
- [ ] WhatsApp aperto sul computer (WhatsApp Desktop o Web) se vuoi mostrare "Invia su WhatsApp" dal computer, oppure l'admin aperto anche sul telefono.
- [ ] **Link aperti** nel browser del computer: `/admin/` (già loggato la mattina stessa: la sessione dura 12 ore), `/admin/campagne/`, `/admin/email/`, la Home del sito.

## Come funziona la lista clienti

### Percorso dei dati
1. Il cliente si iscrive su `/it/promemoria/` o `/de/erinnerung/` (da footer, Home, Revisione, calcolatore o QR). Il modulo valida i dati nel browser e il server li rivalida (`src/lib/crm/validate.ts`).
2. `/api/iscrizione` salva il cliente su Supabase e calcola la scadenza con la stessa regola del calcolatore (`src/lib/revisione.ts`).
3. Solo se l'iscrizione arriva con il **DEMO_KEY corretto** (il QR della locandina contiene `?demo=…`), parte l'email di benvenuto.
4. L'admin legge i clienti veri ogni 10 secondi e li mostra in cima con **Nuovo**, uniti ai 45 esempi.
5. Promemoria, campagne e richieste di recensione ai clienti veri passano da `/api/admin/*` e Resend; ogni invio diventa un evento nello storico del cliente.

### Sicurezza dell'endpoint pubblico (niente spam)
- Email ai clienti **solo** con il DEMO_KEY del QR oppure dall'admin autenticato. Moduli contatti/preventivo: destinatario fisso (`DEMO_OWNER_EMAIL`).
- **Limiti**: massimo **30 email al giorno** in totale e **5 per destinatario**, contati su Supabase (hash dell'indirizzo, mai l'indirizzo in chiaro). Senza Supabase le email non partono (non si potrebbero contare).
- Validazione completa lato server, **campo esca** (honeypot) contro i bot, controllo dell'origine (niente invii da altri siti), limite di richieste per IP.
- Admin: password verificata sul server con confronto a tempo costante e ritardo fisso, sessione in **cookie httpOnly, Secure, SameSite=Strict** firmato HMAC (cambiando la password si chiudono tutte le sessioni), `noindex`, fuori da sitemap e robots, `X-Frame-Options: DENY`.
- Il QR si genera **sul server** a ogni apertura della locandina (non in build): una pagina prerenderizzata pubblicherebbe il DEMO_KEY in un file statico leggibile da chiunque.

### Modalità simulata (la demo non si rompe mai)
Se Supabase o Resend non sono configurati, o la rete cade durante l'incontro:
- l'iscrizione pubblica si salva nel **localStorage** del browser e la persona vede comunque la sua conferma (nessun avviso sul sito pubblico);
- l'admin sullo stesso browser la mostra come **Nuovo** (con l'etichetta "Locale"), e ogni azione viene registrata come **simulata**;
- solo nell'admin compare un avviso arancione che spiega cosa manca.
Il modulo preventivo, se l'invio fallisce davvero, propone di mandare lo stesso testo su WhatsApp (piano B onesto, nessuna finta conferma).

### WhatsApp
- **Modalità predefinita (sempre funzionante):** "Invia su WhatsApp" apre `https://wa.me/<numero del cliente>?text=<messaggio già scritto>` sul dispositivo di chi usa l'admin e registra l'evento. Per i clienti di esempio (numeri finti) l'invio è simulato.
- **Modalità automatica (facoltativa):** con `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` e `WHATSAPP_TEMPLATE` impostate, il messaggio parte dal server con la **WhatsApp Cloud API** e un modello approvato. Se ne manca una, si usa il link senza errori; se l'API rifiuta l'invio, si apre comunque il link.

Cosa serve su Meta per attivarla in produzione:
1. Un **Meta Business Manager** verificato a nome di CAR TRADE SRL ([business.facebook.com](https://business.facebook.com)).
2. Su [developers.facebook.com](https://developers.facebook.com) → **Crea app** (tipo Business) → aggiungi il prodotto **WhatsApp**.
3. **Numero di telefono**: un numero dedicato (non può essere usato contemporaneamente nell'app WhatsApp normale), verificato via SMS o chiamata. Il suo **Phone number ID** → `WHATSAPP_PHONE_ID`.
4. **Token permanente**: Business Manager → Utenti di sistema → crea un utente di sistema admin → assegnagli l'app e l'account WhatsApp → genera token con permessi `whatsapp_business_messaging` e `whatsapp_business_management` → `WHATSAPP_TOKEN`.
5. **Modello di messaggio** (WhatsApp Manager → Modelli): categoria **Utility** per i promemoria (Marketing per le campagne), **stesso nome** in lingua **Italiano (it)** e **Tedesco (de)**, corpo con due variabili, ad esempio `Ciao {{1}}, {{2}} · Car Trade Bolzano` (in tedesco `Guten Tag {{1}}, {{2}} · Car Trade Bozen`). Dopo l'approvazione, il nome → `WHATSAPP_TEMPLATE`.
6. I messaggi avviati dall'azienda sono a pagamento per conversazione (tariffe Meta per l'Italia) e richiedono il consenso del cliente: è quello raccolto nel modulo.

### Promemoria automatici in produzione
Nella demo le regole (30 e 7 giorni prima della revisione, tagliando dopo 12 mesi) si modificano in **Promemoria** e il calendario "Prossimi invii" si aggiorna; gli invii si fanno con "Invia ora". In produzione:
- le regole vanno in una tabella `impostazioni` (oggi stanno nel browser);
- un **Vercel Cron** giornaliero (es. ore 9:00, `vercel.json` → `crons`) chiama una rotta `/api/cron/promemoria` protetta da `CRON_SECRET`, che usa la stessa funzione `prossimiInvii()` di `src/lib/crm/regole.ts` e invia con `inviaEmail()`; la chiave di ogni promemoria (`revisione:<scadenza>:<giorni>`) impedisce doppi invii;
- link di disiscrizione con un clic (oggi: "rispondi STOP"), da aggiungere insieme all'informativa definitiva.

### Showroom in produzione
Le auto aggiunte dall'admin finiscono su Supabase (`demo_auto` + storage) e si vedono **solo nell'admin**: il sito pubblico resta statico (le schede vengono da `src/content/cars/*.json`). Per il lancio ci sono due strade:
1. **Ricostruzione automatica (consigliata):** l'admin salva l'auto su Supabase e chiama un **Deploy Hook** di Vercel; il build legge le auto da Supabase (loader della content collection) e pubblica pagine statiche, veloci e indicizzabili, in un paio di minuti. Foto in un bucket pubblico (o Vercel Blob) ottimizzate da `astro:assets`.
2. **Pagine on-demand con cache (ISR):** le pagine `/it/auto/` e le schede leggono Supabase a ogni richiesta, con cache di qualche minuto. Pubblicazione istantanea, un po' più complessa da tenere veloce.
In entrambi i casi servono anche "venduta" / "nascondi" e l'ordine delle auto.

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
| `piazzale-auto` | Indice servizi Home | Un'auto in vendita, pulita, di tre quarti anteriore, sfondo ordinato. |
| `sede` | Azienda, foto in alto | Facciata con l'insegna dal piazzale, con un po' di cielo. Già presente ma a 680 px: serve ≥ 2400 px. |
| `showroom-1`, `-2`, `-3` | Azienda, mosaico showroom | Già presenti (dalle recensioni Google: **verificare i diritti**). 1 e 3 verticali, 2 orizzontale e larga. |
| `team-1` … `team-4` | Azienda, ritratti | Mezzo busto, stesso taglio per tutti, verticali: titolare, responsabile tecnico, capo officina, carrozziere. Con il nome di ciascuno. |

Le foto delle **auto in vendita** sono a parte: oggi Unsplash nelle schede DEMO di `src/content/cars/`, in produzione dalle auto reali (vedi [Showroom in produzione](#showroom-in-produzione)).

## Funzioni del sito da mostrare

0. **Schermata di caricamento** con il logo che si compone (a ogni ingresso nel sito, non navigando tra le pagine), **hero a tutto schermo**, transizioni morbide tra le pagine.
   **"Riduci movimento" attivo** (iPhone: Impostazioni › Accessibilità › Movimento): il sito resta completo ma più calmo; i loghi delle marche scorrono più lenti. La fascia dei loghi ha il **pulsante pausa/riprendi** (WCAG 2.2.2).
1. **Calcolatore scadenza revisione** (Home e Revisione): scadenza esatta secondo il Codice della Strada, giorni mancanti, misuratore del ciclo, file `.ics`, **"Avvisami prima della scadenza"** che porta all'iscrizione con mese e anno già compilati.
2. **Promemoria revisione**: iscrizione in 30 secondi, consensi separati, conferma con la scadenza e le date dei messaggi.
3. **Barra fissa su mobile**: Chiama · WhatsApp · Prenota (portale DEKRA).
4. **Showroom** con filtri condivisibili nell'URL; **scheda auto** con galleria e WhatsApp precompilato.
5. **Preventivo carrozzeria con foto**: fino a 6 foto dal telefono, ridimensionate nel browser, **inviate davvero** al titolare in allegato.
6. **Aperto ora / Chiuso ora** sul fuso di Roma; **selettore lingua** sempre visibile.
7. **FAQ** con risposte vere su Home, Revisione e Officina.

## Qualità verificata

Verifiche di questo branch (novembre 2026):

- `npm run check`: 0 errori, 0 avvisi. `npm run build`: completato.
- **Percorso dal vivo in modalità simulata** (Playwright, telefono 390 px + admin nello stesso browser): iscrizione dal "QR" con errori e correzione → conferma con scadenza e date → login (password sbagliata, poi giusta) → cliente in cima come **Nuovo** → "Invia promemoria ora" → "Invia su WhatsApp" apre `wa.me/39…` con il messaggio → campagna Gomme invernali con esclusi per consenso → lavoro completato con richiesta di recensione nello storico → ripristino: tutto superato.
- **axe-core 4.10** (WCAG 2.0/2.1/2.2 A e AA): **0 violazioni** su 22 pagine (12 pubbliche, 10 admin) a 390 e 1440 px.
- **Lighthouse 12 mobile** (build di produzione servita in locale, rete lenta simulata): Accessibilità, Best practice e SEO **100** su Home, Promemoria, Officina e Revisione; Performance Revisione 96, Promemoria 95, Officina 94. Home 87–88 contro 88–89 del branch `main` misurato nelle stesse condizioni: l'LCP è la foto Unsplash della hero (3,5–3,7 s in questo ambiente su entrambi i branch). I valori del README precedente (96–99) erano misurati su un altro server: si confrontano solo misure fatte nello stesso modo.
- **Audit qualità** (web-quality-audit) sulle pagine generate: un solo H1 per pagina, nessun ID duplicato, title e description unici con servizio + Bolzano/Bozen, JSON-LD valido, sitemap con le pagine nuove e senza admin, robots.txt che esclude `/admin/` e `/api/`. Da fare al lancio: una Content-Security-Policy.
- **SEO e GEO**: schema.org `AutoRepair` + `AutoDealer` con `hasMap` e `sameAs` (scheda Google per cid e pagina DEKRA; Facebook escluso perché fermo al 2018 con un altro indirizzo), `areaServed` (Bolzano, Laives, Appiano, Oltradige, Bassa Atesina; in tedesco Bozen, Leifers, Eppan, Überetsch, Unterland), `makesOffer`, `knowsLanguage`; `FAQPage` su Home, Revisione e Officina; `llms.txt` alla radice in italiano e tedesco.
- Restano valide le verifiche precedenti su browser mobili reali (Safari iPhone, Chrome Android, Samsung Internet) per le pagine non toccate.

## Cosa serve dal cliente

1. **Foto** secondo la [tabella delle foto](#foto-reali-cosa-scattare), in un servizio fotografico unico.
2. **Nomi e ruoli del team**.
3. **Testi azienda**: storia, anno di fondazione, tappe, numeri reali.
4. **Elenco auto in vendita** con foto reali, oppure accesso al gestionale/portale (es. AutoScout24).
5. **Orari confermati**, in particolare il **sabato mattina**.
6. **Email** di contatto e conferma che il **324 696 5239 è su WhatsApp**.
7. **Chiave Google Maps Platform** per le recensioni live.
8. Conferma di **servizi** (climatizzazione, pneumatici, forno di verniciatura, sinistri), **permute e finanziamenti**, **garanzia**, **tempi di risposta** ai preventivi, **DEKRA Safety Check** (nome, contenuto, prezzo per i centri affiliati).
9. Testi **privacy e cookie** dal consulente (oggi pagina segnaposto in `/it/privacy/`), con il periodo di conservazione dei dati della lista clienti.
10. Regole d'uso del **marchio DEKRA**: finché non sono chiare, solo la dicitura "Centro revisioni affiliato DEKRA", senza logo.

## Elenco dei TODO nel codice

Cercali con `grep -rn TODO src astro.config.mjs`.

**Dati da confermare**
- `src/data/site.ts` · sabato; WhatsApp; email; tariffa revisione 79,02 €.
- `src/layouts/Base.astro`, `src/components/HoursTable.astro` · sabato.
- `astro.config.mjs` · dominio definitivo.
- `src/views/RevisioneView.astro` · durata del controllo, metodi di pagamento, nuova revisione dopo "ripetere".
- `src/views/OfficinaView.astro` · climatizzazione, pneumatici, forno, sinistri; FAQ su preventivi e tempi di risposta.
- `src/views/HomeView.astro` · politica dei preventivi; parcheggio clienti.
- `src/lib/crm/campagne.ts` · check-up vacanze (durata, prezzo), climatizzatore, DEKRA Safety Check.
- `src/views/ShowroomView.astro`, `src/views/CarDetailView.astro` · permute, finanziamenti, cosa include la consegna.
- `src/components/RequestForm.astro` · tempi di risposta reali.
- `src/views/AziendaView.astro` · storia, tappe, nomi del team, indicazioni stradali.

**Contenuti da sostituire**
- `src/components/Marquee.astro` · elenco delle marche e uso dei loghi.
- `src/views/AziendaView.astro` · diritti delle foto dello showroom.
- Foto Unsplash segnaposto: si sostituiscono senza toccare il codice, vedi [Foto reali](#foto-reali-cosa-scattare).
- `src/content/cars/*.json` · 8 auto **DEMO**, vedi `src/content/cars/LEGGIMI.md`.
- `src/views/PrivacyView.astro` · informativa definitiva IT e DE.

**Funzioni da collegare al lancio**
- Promemoria automatici con Vercel Cron e regole nel database (vedi [Promemoria automatici in produzione](#promemoria-automatici-in-produzione)); link di disiscrizione.
- Showroom pubblico dalle auto dell'admin (vedi [Showroom in produzione](#showroom-in-produzione)).
- `.env` · `PUBLIC_GOOGLE_MAPS_API_KEY` per le recensioni Google live.
- `src/components/MapBlock.astro` · mappa collegata al banner cookie.
- Tabelle di produzione al posto di quelle `demo_*` (stesso schema), senza esempi e senza "Ripristina demo".

## Note

- I dati reali (ragione sociale, P. IVA, indirizzo, telefono, orari lun–ven, coordinate, link DEKRA, voto Google 4,5 su 61 recensioni) vengono dal sito attuale, dalla scheda DEKRA e dal brief. Tutti i testi sono scritti da zero; nessuna recensione è inventata.
- Il tedesco è tedesco standard con la terminologia altoatesina: "Revision" (non "HU/TÜV"), "Tageszulassung" per km 0, "MwSt.-Nr." per la P. IVA, "PS" per i cavalli. In tedesco si usa "Sie".
- Clienti di esempio: nomi italiani e tedeschi dell'area di Bolzano, email `@example.com`, numeri `+39 000…`. Nessun numero o indirizzo reale nel codice: quelli veri arrivano solo dalle variabili d'ambiente e dalle iscrizioni.
