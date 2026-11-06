// Dati dell'admin nel browser. Unisce:
//  - clienti VERI dal server (Supabase), in cima con l'etichetta "Nuovo";
//  - iscrizioni salvate in locale (modalità simulata, stesso browser);
//  - 45 clienti di ESEMPIO (generati qui, mai inviati al server).
// Ogni azione verso un cliente vero passa dal server; verso un esempio è simulata.
// Se il server non risponde, tutto continua in locale e la barra in alto lo segnala.
import { generaEsempi } from '../lib/crm/esempi';
import { archivioLocale, cancella, leggi, salvaLocale, scrivi, CHIAVE_LOCALI } from '../lib/crm/locale';
import { pubblicoCampagna, REGOLE_PREDEFINITE, type Filtri, type Regole, type TipoPromemoria } from '../lib/crm/regole';
import { linkWhatsApp, testoWhatsApp, type TipoMessaggio } from '../lib/crm/messaggi';
import { modelloCampagna } from '../lib/crm/campagne';
import { uid, type Auto, type Cliente, type Esito, type Evento, type StatoServizi, type TipoEvento } from '../lib/crm/types';

const K_ESEMPI = 'ct-admin-esempi-v1';
const K_REGOLE = 'ct-admin-regole-v1';

export interface Dati {
  stato: StatoServizi;
  /** il server ha risposto */
  online: boolean;
  /** i dati veri arrivano da Supabase */
  live: boolean;
  clienti: Cliente[];
  eventi: Evento[];
  auto: Auto[];
}

interface ArchivioEsempi { giorno: string; clienti: Cliente[]; eventi: Evento[] }

const oggiKey = () => new Date().toDateString();

/** Esempi: rigenerati ogni giorno (le date restano relative a oggi), conservando le azioni fatte oggi */
function esempi(): ArchivioEsempi {
  const a = leggi<ArchivioEsempi | null>(K_ESEMPI, null);
  if (a && a.giorno === oggiKey()) return a;
  const nuovi = generaEsempi();
  const fresh = { giorno: oggiKey(), ...nuovi };
  scrivi(K_ESEMPI, fresh);
  return fresh;
}

export const regole = (): Regole => {
  const r = leggi<Regole | null>(K_REGOLE, null);
  return r ? { revisione: { ...REGOLE_PREDEFINITE.revisione, ...r.revisione }, tagliando: { ...REGOLE_PREDEFINITE.tagliando, ...r.tagliando } } : REGOLE_PREDEFINITE;
};
export const salvaRegole = (r: Regole) => scrivi(K_REGOLE, r);

let ultimo: Dati | null = null;
export const ultimiDati = () => ultimo;

async function api<T = any>(path: string, init?: RequestInit, timeout = 8000): Promise<{ status: number; data: T | null }> {
  try {
    const res = await fetch(path, { credentials: 'same-origin', ...init, signal: AbortSignal.timeout(timeout) });
    if (res.status === 401) {
      location.href = `/admin/login/?next=${encodeURIComponent(location.pathname + location.search)}`;
      return { status: 401, data: null };
    }
    return { status: res.status, data: (await res.json().catch(() => null)) as T | null };
  } catch {
    return { status: 0, data: null };
  }
}
const post = (path: string, body: unknown, timeout?: number) =>
  api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, timeout);

const STATO_OFFLINE: StatoServizi = { db: false, email: false, whatsappApi: false, demoKey: false };

export async function carica(): Promise<Dati> {
  const es = esempi();
  const loc = archivioLocale();
  const r = await api<{ ok: boolean; stato: StatoServizi; clienti: Cliente[]; eventi: Evento[]; auto: Auto[] }>('/api/admin/dati');
  const online = r.status > 0 && r.status < 500 && Boolean(r.data);
  const live = Boolean(online && r.data?.ok && r.data.stato.db);
  const veri = live ? r.data!.clienti : [];
  const perData = (a: Cliente, b: Cliente) => b.creato_il.localeCompare(a.creato_il);
  const reali = [...veri, ...loc.clienti.map((c) => ({ ...c, locale: true }))].sort(perData);
  const esempiOrdinati = [...es.clienti].sort((a, b) => a.scadenza.localeCompare(b.scadenza));
  ultimo = {
    stato: r.data?.stato ?? STATO_OFFLINE,
    online,
    live,
    clienti: [...reali, ...esempiOrdinati],
    eventi: [...(live ? r.data!.eventi : []), ...loc.eventi, ...es.eventi].sort((a, b) => b.creato_il.localeCompare(a.creato_il)),
    auto: [...(live ? r.data!.auto : []), ...loc.auto],
  };
  aggiornaBarra(ultimo);
  return ultimo;
}

/** Avviso "modalità simulata" in alto, solo nell'admin */
function aggiornaBarra(d: Dati) {
  const banner = document.querySelector<HTMLElement>('[data-sim-banner]');
  const text = document.querySelector<HTMLElement>('[data-sim-text]');
  const mode = document.querySelector<HTMLElement>('[data-mode]');
  const modeText = document.querySelector<HTMLElement>('[data-mode-text]');
  const modeInfo = document.querySelector<HTMLElement>('[data-mode-info]');
  let msg = '';
  if (!d.online) msg = 'Server non raggiungibile: modalità simulata. Le azioni restano in questo browser finché la rete non torna.';
  else if (!d.stato.db) msg = 'Modalità simulata: Supabase non configurato. Le azioni funzionano, ma restano in questo browser.';
  else if (!d.stato.email) msg = 'Invio email non configurato (Resend): i messaggi ai clienti veri sono simulati.';
  if (banner && text) {
    banner.hidden = !msg;
    text.textContent = msg;
  }
  if (mode && modeText) {
    mode.classList.toggle('is-live', d.live);
    mode.classList.toggle('is-sim', !d.live);
    modeText.textContent = d.live ? 'Collegato' : 'Simulato';
  }
  if (modeInfo) {
    const [titolo, testo] = d.live
      ? ['Collegato al database', 'Iscrizioni ed email partono davvero. I clienti con l’etichetta grigia «Esempio» sono finti e servono solo per la demo.']
      : !d.online
        ? ['Server non raggiungibile', 'Le azioni restano in questo browser finché la rete non torna.']
        : ['Modalità simulata', 'I dati restano in questo browser e nessun messaggio parte davvero.'];
    modeInfo.innerHTML = '';
    const b = document.createElement('strong');
    b.textContent = titolo;
    modeInfo.append(b, testo);
  }
}

export const isVero = (c: Cliente) => !c.esempio && !c.locale;
export const trova = (id: string) => ultimo?.clienti.find((c) => c.id === id) ?? null;

/* ------------------------------------------------------------------ */
/* Registrazione locale (esempi e modalità simulata)                    */
/* ------------------------------------------------------------------ */
function registraLocale(c: Cliente | null, e: { tipo: TipoEvento; canale: Evento['canale']; esito: Esito; dettagli?: Record<string, unknown> }) {
  const ev: Evento = { id: uid(), cliente_id: c?.id ?? null, tipo: e.tipo, canale: e.canale, esito: e.esito, dettagli: e.dettagli ?? {}, creato_il: new Date().toISOString() };
  if (c?.esempio) {
    const a = esempi();
    a.eventi.unshift(ev);
    scrivi(K_ESEMPI, a);
  } else {
    const a = archivioLocale();
    a.eventi.unshift(ev);
    salvaLocale(a);
  }
  ultimo?.eventi.unshift(ev);
  return ev;
}

export interface Risultato {
  esito: Esito;
  messaggio: string;
  tono: 'ok' | 'warn' | 'err';
}

const MOTIVI: Record<string, string> = {
  non_configurato: 'invio non configurato',
  limite_giorno: 'raggiunto il limite di 30 email al giorno',
  limite_destinatario: 'raggiunto il limite di 5 email al giorno per questo cliente',
  errore_invio: 'Resend non ha accettato l’invio',
};

function esitoServer(c: Cliente, cosa: string, r: { status: number; data: any }, fallback: () => Risultato): Risultato {
  if (r.status === 0 || r.status >= 500 || !r.data) return fallback();
  const d = r.data;
  if (d.esito === 'inviato') return { esito: 'inviato', messaggio: `${cosa} inviato a ${c.email}.`, tono: 'ok' };
  if (d.esito === 'simulato') return { esito: 'simulato', messaggio: `${cosa} simulato: ${MOTIVI[d.motivo] ?? 'demo'}.`, tono: 'warn' };
  return { esito: 'errore', messaggio: `${cosa} non inviato: ${MOTIVI[d.motivo] ?? 'errore'}.`, tono: 'err' };
}

const simulato = (c: Cliente, cosa: string): Risultato => ({
  esito: 'simulato',
  messaggio: c.esempio ? `${cosa} simulato (cliente di esempio).` : `${cosa} simulato: server non raggiungibile, registrato in questo browser.`,
  tono: c.esempio ? 'ok' : 'warn',
});

/* ------------------------------------------------------------------ */
/* Azioni                                                              */
/* ------------------------------------------------------------------ */
export async function inviaPromemoria(c: Cliente, tipo: TipoPromemoria = 'revisione', chiave?: string, scadenza?: string): Promise<Risultato> {
  const cosa = tipo === 'tagliando' ? 'Promemoria tagliando' : 'Promemoria revisione';
  const locale = () => {
    registraLocale(c, { tipo: 'promemoria', canale: 'email', esito: 'simulato', dettagli: { regola: tipo, chiave, manuale: true } });
    return simulato(c, cosa);
  };
  if (!isVero(c)) return locale();
  return esitoServer(c, cosa, await post('/api/admin/azione', { azione: 'promemoria', clienteId: c.id, tipo, chiave, scadenza }, 15000), locale);
}

export async function lavoroCompletato(c: Cliente, motivo: string): Promise<Risultato> {
  const cosa = 'Richiesta di recensione';
  const locale = () => {
    registraLocale(c, { tipo: 'visita', canale: 'sistema', esito: 'registrato', dettagli: { motivo } });
    registraLocale(c, { tipo: 'recensione_richiesta', canale: 'email', esito: 'simulato' });
    return simulato(c, cosa);
  };
  if (!isVero(c)) return locale();
  return esitoServer(c, cosa, await post('/api/admin/azione', { azione: 'recensione', clienteId: c.id, motivo }, 15000), locale);
}

export async function recensioneOttenuta(c: Cliente): Promise<Risultato> {
  const locale = () => {
    registraLocale(c, { tipo: 'recensione_ottenuta', canale: 'sistema', esito: 'registrato' });
    return { esito: 'registrato' as Esito, messaggio: 'Recensione segnata come ottenuta.', tono: 'ok' as const };
  };
  if (!isVero(c)) return locale();
  const r = await post('/api/admin/azione', { azione: 'recensione_ottenuta', clienteId: c.id });
  return r.data?.ok ? { esito: 'registrato', messaggio: 'Recensione segnata come ottenuta.', tono: 'ok' } : locale();
}

const EVENTO_WA: Record<TipoMessaggio, TipoEvento> = {
  benvenuto: 'benvenuto',
  promemoria: 'promemoria',
  tagliando: 'promemoria',
  campagna: 'campagna',
  recensione: 'recensione_richiesta',
};

/**
 * WhatsApp. Modalità predefinita: apre wa.me con il messaggio già scritto sul dispositivo di chi usa l'admin
 * (la finestra si apre SUBITO, nel gesto del clic, altrimenti il browser la blocca). Con la Cloud API configurata
 * parte dal server; se l'API fallisce si ricade sul link.
 */
export async function whatsapp(c: Cliente, tipo: TipoMessaggio, modello?: string): Promise<Risultato> {
  const testo = testoWhatsApp(tipo, c, location.origin, { modello });
  const evento = EVENTO_WA[tipo];
  if (c.esempio) {
    registraLocale(c, { tipo: evento, canale: 'whatsapp', esito: 'simulato', dettagli: { via: 'link' } });
    return { esito: 'simulato', messaggio: 'WhatsApp simulato (cliente di esempio, numero finto).', tono: 'ok' };
  }
  const link = linkWhatsApp(c.telefono || null, testo);
  const api = Boolean(ultimo?.stato.whatsappApi && c.telefono && isVero(c));
  if (!api) window.open(link, '_blank', 'noopener');
  if (!isVero(c)) {
    registraLocale(c, { tipo: evento, canale: 'whatsapp', esito: 'aperto', dettagli: { via: 'link' } });
    return { esito: 'aperto', messaggio: c.telefono ? 'WhatsApp aperto con il messaggio pronto.' : 'WhatsApp aperto: scegli il contatto, il messaggio è pronto.', tono: 'ok' };
  }
  const r = await post('/api/admin/azione', { azione: 'whatsapp', clienteId: c.id, evento, testo });
  if (api && r.data?.mode === 'api') return { esito: 'inviato', messaggio: `WhatsApp inviato a ${c.telefono} con il modello approvato.`, tono: 'ok' };
  if (api) window.open(link, '_blank', 'noopener');
  if (!r.data) registraLocale(c, { tipo: evento, canale: 'whatsapp', esito: 'aperto', dettagli: { via: 'link' } });
  return { esito: 'aperto', messaggio: c.telefono ? 'WhatsApp aperto con il messaggio pronto.' : 'WhatsApp aperto: scegli il contatto, il messaggio è pronto.', tono: 'ok' };
}

export interface RisultatoCampagna {
  destinatari: number;
  inviati: number;
  simulati: number;
  esclusi: number;
  errori: number;
  messaggio: string;
  tono: Risultato['tono'];
}

export async function inviaCampagna(modelloId: string, filtri: Filtri): Promise<RisultatoCampagna> {
  const d = ultimo ?? (await carica());
  const m = modelloCampagna(modelloId)!;
  const { destinatari, esclusi } = pubblicoCampagna(d.clienti, filtri);
  const veri = destinatari.filter(isVero);
  const finti = destinatari.filter((c) => !isVero(c));
  const idCampagna = uid();
  finti.forEach((c) => registraLocale(c, { tipo: 'campagna', canale: c.canale, esito: 'simulato', dettagli: { campagna: idCampagna, modello: m.id } }));

  let inviati = 0;
  let errori = 0;
  let simulatiVeri = 0;
  let limite = false;
  let serverOk = false;
  if (veri.length) {
    const r = await post('/api/admin/campagna', { modello: m.id, clienteIds: veri.map((c) => c.id), simulati: finti.length, esclusi }, 60000);
    if (r.data?.ok && r.data.mode === 'live') {
      serverOk = true;
      inviati = r.data.inviati;
      errori = r.data.errori;
      limite = r.data.limite;
      simulatiVeri = veri.length - inviati - errori;
    } else {
      veri.forEach((c) => registraLocale(c, { tipo: 'campagna', canale: c.canale, esito: 'simulato', dettagli: { campagna: idCampagna, modello: m.id } }));
      simulatiVeri = veri.length;
    }
  }
  const simulati = finti.length + simulatiVeri;
  // Il riepilogo lo scrive il server quando i veri partono da lì; altrimenti resta in locale
  if (!serverOk) {
    registraLocale(null, {
      tipo: 'campagna_invio',
      canale: 'sistema',
      esito: 'simulato',
      dettagli: { campagna: idCampagna, modello: m.id, titolo: m.titolo, destinatari: destinatari.length, inviati, simulati, esclusi, errori },
    });
  }
  const parti = [inviati && `${inviati} ${inviati === 1 ? 'inviata davvero' : 'inviate davvero'}`, simulati && `${simulati} simulat${simulati === 1 ? 'a' : 'e'}`, errori && `${errori} non partit${errori === 1 ? 'a' : 'e'}${limite ? ' (limite giornaliero)' : ''}`].filter(Boolean);
  return {
    destinatari: destinatari.length,
    inviati,
    simulati,
    esclusi,
    errori,
    messaggio: `Campagna “${m.titolo}”: ${parti.join(', ') || 'nessun destinatario'}.`,
    tono: errori ? 'warn' : 'ok',
  };
}

export async function ripristina(): Promise<Risultato> {
  const r = await post('/api/admin/reset', {}, 20000);
  cancella(CHIAVE_LOCALI);
  cancella(K_ESEMPI);
  cancella(K_REGOLE);
  if (r.status === 0 || !r.data?.ok) return { esito: 'errore', messaggio: 'Dati locali ripristinati. Il server non ha risposto: i clienti veri su Supabase sono ancora lì, riprova.', tono: 'warn' };
  return { esito: 'registrato', messaggio: r.data.mode === 'live' ? 'Demo ripristinata: clienti veri cancellati da Supabase, esempi ricaricati.' : 'Demo ripristinata: esempi ricaricati.', tono: 'ok' };
}

export async function aggiungiAuto(form: FormData, anteprima: string | null): Promise<{ auto: Auto; risultato: Risultato }> {
  const r = await api<{ ok: boolean; mode: string; auto?: Auto; errors?: Record<string, string> }>('/api/admin/auto', { method: 'POST', body: form }, 30000);
  if (r.status === 422) throw Object.assign(new Error('validazione'), { errors: r.data?.errors ?? {} });
  if (r.data?.ok && r.data.mode === 'live' && r.data.auto) {
    const auto = { ...r.data.auto, foto_url: anteprima ?? r.data.auto.foto_url };
    ultimo?.auto.unshift(auto);
    return { auto, risultato: { esito: 'registrato', messaggio: 'Auto salvata su Supabase.', tono: 'ok' } };
  }
  const n = (k: string) => Number(String(form.get(k) ?? '').replace(/[^\d]/g, '')) || 0;
  const auto: Auto = {
    id: uid(),
    creato_il: new Date().toISOString(),
    marca: String(form.get('marca') ?? ''),
    modello: String(form.get('modello') ?? ''),
    versione: String(form.get('versione') ?? ''),
    prezzo: n('prezzo'),
    km: n('km'),
    anno: n('anno'),
    alimentazione: String(form.get('alimentazione') ?? 'petrol') as Auto['alimentazione'],
    cambio: String(form.get('cambio') ?? 'manual') as Auto['cambio'],
    foto_path: null,
    foto_url: anteprima,
    locale: true,
  };
  const a = archivioLocale();
  a.auto.unshift(auto);
  salvaLocale(a);
  ultimo?.auto.unshift(auto);
  return { auto, risultato: { esito: 'simulato', messaggio: 'Auto salvata in questo browser (modalità simulata).', tono: 'warn' } };
}

/** Ricarica ogni N secondi mentre la scheda è visibile: i clienti veri compaiono da soli */
export function aggiornaOgni(secondi: number, cb: (d: Dati) => void) {
  let t = 0;
  const tick = async () => {
    if (document.visibilityState === 'visible') cb(await carica());
    t = window.setTimeout(tick, secondi * 1000);
  };
  t = window.setTimeout(tick, secondi * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      clearTimeout(t);
      void tick();
    }
  });
}
