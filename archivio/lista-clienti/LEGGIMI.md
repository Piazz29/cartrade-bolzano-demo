# Archivio · lista clienti, promemoria e admin

Copia completa del sito **così com'era il 14 novembre 2026, prima di togliere il database**: iscrizione ai promemoria, lista clienti su Supabase, area admin, email e WhatsApp ai clienti. Già in tre lingue (IT/DE/EN), CRM compreso.

Il cliente per ora non vuole né database né gestionale, quindi queste funzioni sono state tolte dal sito. Questa cartella **non viene compilata né pubblicata**: è esclusa da TypeScript (`tsconfig.json`) e da Tailwind (`@source not` in `src/styles/global.css`), e Astro costruisce solo `src/`.

## Cosa contiene

- `src/`: tutto il codice di allora (senza `src/assets/`, le foto sono rimaste nel sito). Le parti tolte dal sito sono:
  - `pages/admin/`, `pages/api/admin/`, `pages/api/iscrizione.ts`: area admin e API
  - `admin/`, `layouts/AdminLayout.astro`, `styles/admin.css`: interfaccia dell'admin
  - `lib/crm/`: tipi, validazione, regole dei promemoria, campagne, testi di email e WhatsApp, clienti di esempio
  - `lib/server/`: configurazione completa, Supabase (`db.ts`), invio email con limiti contati sul database, sessione admin, WhatsApp Cloud API
  - `views/PromemoriaView.astro` e `pages/it/promemoria.astro`, `pages/de/erinnerung.astro`, `pages/en/reminder.astro`: pagina di iscrizione
  - `types/qrcode.d.ts`: tipi per la locandina QR
- `supabase/schema.sql`: tabelle `demo_clienti` e `demo_eventi`, RLS attiva.
- `README.md`: guida completa di allora (Supabase, Resend, Vercel, copione di 5 minuti per l'incontro, checklist, sicurezza, WhatsApp, promemoria automatici in produzione).
- `astro.config.mjs`, `.env.example`, `package.json`, `DESIGN.md`, `PRODUCT.md`, `tsconfig.json` di allora.

## Come ripristinarlo

1. **Copia di nuovo nel sito** le cartelle e i file elencati sopra (da `archivio/lista-clienti/src/…` a `src/…`) e `supabase/` nella radice del progetto.
2. **File condivisi**: questi sono stati modificati nel sito e vanno riportati alla versione dell'archivio, o uniti a mano se nel frattempo sono cambiati:
   - `src/pages/api/richiesta.ts`, `src/lib/email/render.ts`, `src/lib/server/*` (tornano a usare `lib/crm` e Supabase); poi cancella `src/lib/contatti.ts`
   - `src/i18n/routes.ts` (rotta `promemoria`), `src/i18n/ui.ts` (`nav.promemoria`)
   - `src/components/RevisionCalculator.astro` (blocco "Avvisami prima della scadenza"), `src/components/Footer.astro` (link Promemoria)
   - `src/views/HomeView.astro` e `src/views/RevisioneView.astro` (FAQ "Mi ricordate voi…", link "Ti ricordiamo noi la revisione")
   - `src/views/PrivacyView.astro` (informativa con iscrizioni e offerte), `src/pages/llms.txt.ts`, `src/pages/robots.txt.ts` (`Disallow: /admin/`)
   - `astro.config.mjs` (variabili `SUPABASE_*`, `DEMO_KEY`, `ADMIN_DEMO_PASSWORD`, `WHATSAPP_*`), `.env.example`
   - `vercel.json`: rimettere il blocco per l'admin:
     ```json
     { "source": "/admin/(.*)", "headers": [{ "key": "Cache-Control", "value": "no-store" }, { "key": "X-Frame-Options", "value": "DENY" }] }
     ```
3. **Dipendenze**: `npm install @supabase/supabase-js qrcode`.
4. **Database**: crea il progetto Supabase ed esegui `supabase/schema.sql` (guida passo passo nel `README.md` di questa cartella).
5. `npm run check` (0 errori attesi) e `npm run build`.

Se il progetto è su git, conviene fare il ripristino su un branch dedicato e confrontare con `git diff` i file condivisi.
