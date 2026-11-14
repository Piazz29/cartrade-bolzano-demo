---
register: brand
---

# CAR TRADE SRL · Bolzano

## Product purpose
Sito vetrina per un'attività locale con tre mestieri sotto lo stesso tetto in zona industriale a Bolzano: centro revisioni affiliato DEKRA (abilitazione auto), officina meccanica, carrozzeria. Il sito deve trasformare una visita in una di queste azioni: prenotare la revisione (portale DEKRA), chiamare o scrivere su WhatsApp, chiedere un preventivo.

Per scelta del cliente il sito **non ha database né gestionale**: nessuna iscrizione, nessuna lista clienti. Si contatta l'officina solo dai canali della pagina Contatti (telefono, WhatsApp, prenotazione DEKRA, moduli che arrivano per email). La versione con lista clienti e admin è archiviata in `archivio/lista-clienti/`.

Questa versione è una **demo** da mostrare al titolare per convincerlo a rifare il sito attuale (one-page generico, testi da template).

## Users
- **Chi deve fare la revisione** (la maggioranza): privati di Bolzano e dintorni, 30-70 anni, sullo smartphone. Vogliono sapere quando scade, quanto costa, quando possono passare, e cosa succede se non passa.
- **Chi ha un problema all'auto**: un guasto, un tagliando, un danno di carrozzeria. Vuole un preventivo senza perdere mezza giornata.
- Trilingue: italiano e tedesco (Alto Adige), più inglese per turisti, lavoratori stranieri e chi vive in zona senza parlare le due lingue locali. Il tedesco è tedesco standard con la terminologia locale (in Südtirol si dice "Revision", non "HU/TÜV"). In inglese si usa "inspection" (non "MOT", che è britannico) e inglese britannico per date e ortografia (tyres, centre).

## Brand personality
L'officina di fiducia che lavora bene. Concreta, precisa, onesta sui prezzi, senza esibizionismo. Tre parole: **preciso, diretto, solido**.

## Tone of voice
Frasi brevi, verbi concreti, numeri veri. In italiano si dà del tu, come nelle CTA del brief ("Prenota la revisione", "Vedi le auto"). In tedesco si usa "Sie", come si aspetta un cliente altoatesino da un'azienda. In inglese tono diretto e cordiale, "you".

## Anti-references
- Concessionari di lusso (nero + oro, video a tutto schermo, "esperienza esclusiva").
- Template da officina: icone di chiavi inglesi in cerchi arancioni, card tutte uguali, stock photo di meccanici sorridenti col pollice alzato.
- Estetica AI generica: gradienti viola, glassmorphism, emoji, "hero metric" con tre numeri a caso.

## References
- Porsche Approved / Polestar: pulizia, griglia, foto protagoniste, testo asciutto.
- Officine tedesche serie (Bosch Car Service di quartiere fatto bene): concretezza, orari e telefono sempre in vista.
- Schede tecniche automotive: righe sottili, etichette piccole, numeri grandi e tabulari.

## Strategic principles
1. Mobile prima di tutto: telefono, WhatsApp e prenotazione a un pollice di distanza, sempre.
2. Un solo indirizzo, quattro servizi: il vantaggio è "se la revisione non passa, l'officina è qui".
3. Mai inventare fatti: dove serve un dato reale si lascia un TODO visibile nel codice.
