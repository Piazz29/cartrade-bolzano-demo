-- Car Trade Bolzano · lista clienti (demo)
-- Da incollare in Supabase › SQL Editor › New query › Run. Si può rieseguire senza danni.
--
-- Sicurezza: RLS attiva su tutte le tabelle e NESSUNA policy. Il browser (chiave anon) non legge e non scrive nulla;
-- l'unico accesso è dal server del sito con la service role key, che non finisce mai nel codice della pagina.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Clienti iscritti ai promemoria
-- ---------------------------------------------------------------------------
create table if not exists public.demo_clienti (
  id                   uuid primary key default gen_random_uuid(),
  creato_il            timestamptz not null default now(),
  nome                 text not null check (char_length(nome) between 1 and 60),
  cognome              text not null check (char_length(cognome) between 1 and 60),
  email                text not null check (char_length(email) between 3 and 160),
  telefono             text not null default '' check (char_length(telefono) <= 20),
  targa                text not null check (targa ~ '^[A-Z0-9]{5,10}$'),
  rif_tipo             text not null check (rif_tipo in ('rev', 'reg')),   -- ultima revisione | immatricolazione
  rif_mese             smallint not null check (rif_mese between 1 and 12),
  rif_anno             smallint not null check (rif_anno between 1950 and 2100),
  scadenza             date not null,                                       -- calcolata dal server (lib/revisione.ts)
  ultimo_tagliando     date,
  interessi            text[] not null default '{}'
                       check (interessi <@ array['revisione','tagliando','carrozzeria','gomme','auto']::text[]),
  canale               text not null check (canale in ('email', 'whatsapp')),
  lingua               text not null check (lingua in ('it', 'de')),
  consenso_privacy_il  timestamptz not null,                                -- presa visione dell'informativa
  consenso_promemoria  boolean not null default false,
  consenso_offerte     boolean not null default false,
  origine              text not null default 'sito' check (origine in ('qr', 'sito', 'admin'))
);
create index if not exists demo_clienti_creato_idx on public.demo_clienti (creato_il desc);
create index if not exists demo_clienti_scadenza_idx on public.demo_clienti (scadenza);

-- ---------------------------------------------------------------------------
-- Eventi: iscrizioni, invii (email/WhatsApp), visite, recensioni, campagne, richieste dal sito.
-- Gli eventi email contengono solo l'HASH del destinatario (per i limiti anti-spam), mai l'indirizzo.
-- ---------------------------------------------------------------------------
create table if not exists public.demo_eventi (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid references public.demo_clienti (id) on delete set null,
  tipo        text not null check (tipo in ('iscrizione','benvenuto','promemoria','campagna','campagna_invio',
                                            'recensione_richiesta','recensione_ottenuta','visita','richiesta')),
  canale      text not null check (canale in ('email', 'whatsapp', 'sistema')),
  esito       text not null check (esito in ('inviato', 'simulato', 'aperto', 'registrato', 'errore')),
  dettagli    jsonb not null default '{}'::jsonb,
  creato_il   timestamptz not null default now()
);
create index if not exists demo_eventi_cliente_idx on public.demo_eventi (cliente_id);
create index if not exists demo_eventi_creato_idx on public.demo_eventi (creato_il desc);
-- Conteggio veloce degli invii email delle ultime 24 ore (limite: 30 al giorno, 5 per destinatario)
create index if not exists demo_eventi_email_idx on public.demo_eventi (creato_il) where canale = 'email' and esito = 'inviato';
create index if not exists demo_eventi_dest_idx on public.demo_eventi ((dettagli ->> 'dest')) where canale = 'email';

-- ---------------------------------------------------------------------------
-- Auto aggiunte dall'admin (showroom). La foto sta nello storage privato "demo-auto".
-- ---------------------------------------------------------------------------
create table if not exists public.demo_auto (
  id             uuid primary key default gen_random_uuid(),
  creato_il      timestamptz not null default now(),
  marca          text not null check (char_length(marca) between 1 and 60),
  modello        text not null check (char_length(modello) between 1 and 60),
  versione       text not null default '' check (char_length(versione) <= 80),
  prezzo         integer not null check (prezzo between 1 and 2000000),
  km             integer not null check (km between 0 and 2000000),
  anno           smallint not null check (anno between 1950 and 2100),
  alimentazione  text not null check (alimentazione in ('petrol','diesel','hybrid','phev','electric','lpg')),
  cambio         text not null check (cambio in ('manual','automatic')),
  foto_path      text
);
create index if not exists demo_auto_creato_idx on public.demo_auto (creato_il desc);

-- ---------------------------------------------------------------------------
-- RLS attiva, nessuna policy: accesso solo con la service role key (che salta la RLS).
-- In più togliamo ogni permesso ai ruoli pubblici, per non dipendere solo dalla RLS.
-- ---------------------------------------------------------------------------
alter table public.demo_clienti enable row level security;
alter table public.demo_eventi  enable row level security;
alter table public.demo_auto    enable row level security;
revoke all on public.demo_clienti, public.demo_eventi, public.demo_auto from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage privato per le foto delle auto (max 3 MB, solo immagini). Si leggono con URL firmati a tempo.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('demo-auto', 'demo-auto', false, 3145728, array['image/jpeg', 'image/webp', 'image/png'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
