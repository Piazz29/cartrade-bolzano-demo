// Accesso a Supabase SOLO dal server, con la service role key.
// Le tabelle hanno RLS attiva e nessuna policy pubblica: dal browser non si legge né si scrive nulla.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config, dbAttivo } from './config';
import type { Auto, Cliente, Evento } from '../crm/types';

let client: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!dbAttivo()) throw new Error('Supabase non configurato');
  client ??= createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) },
  });
  return client;
}

export const BUCKET_AUTO = 'demo-auto';

const ok = <T>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
};

export type NuovoCliente = Omit<Cliente, 'id' | 'creato_il' | 'esempio' | 'locale'>;

export async function inserisciCliente(c: NuovoCliente): Promise<Cliente> {
  return ok(await db().from('demo_clienti').insert(c).select().single());
}

export async function elencoClienti(): Promise<Cliente[]> {
  return ok(await db().from('demo_clienti').select('*').order('creato_il', { ascending: false }).limit(500));
}

export async function cliente(id: string): Promise<Cliente | null> {
  return ok(await db().from('demo_clienti').select('*').eq('id', id).maybeSingle());
}

export async function aggiornaCliente(id: string, patch: Partial<NuovoCliente>) {
  ok(await db().from('demo_clienti').update(patch).eq('id', id));
}

export async function elencoEventi(): Promise<Evento[]> {
  return ok(await db().from('demo_eventi').select('*').order('creato_il', { ascending: false }).limit(2000));
}

export async function registraEvento(e: Omit<Evento, 'id' | 'creato_il'>): Promise<Evento> {
  return ok(await db().from('demo_eventi').insert(e).select().single());
}

/** Email partite davvero nelle ultime 24 ore, in totale e verso un destinatario (hash dell'indirizzo) */
export async function emailInviate24h(destHash?: string): Promise<number> {
  let q = db()
    .from('demo_eventi')
    .select('id', { count: 'exact', head: true })
    .eq('canale', 'email')
    .eq('esito', 'inviato')
    .gte('creato_il', new Date(Date.now() - 24 * 3600 * 1000).toISOString());
  if (destHash) q = q.eq('dettagli->>dest', destHash);
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Ripristino della demo: cancella clienti veri di prova, eventi e auto.
 * Restano solo i contatori anonimi degli invii email delle ultime 24 ore (hash, nessun dato personale),
 * così il ripristino non azzera il limite anti-spam.
 */
export async function ripristina() {
  const d = db();
  const auto = ok(await d.from('demo_auto').select('foto_path')) as { foto_path: string | null }[];
  const paths = auto.map((a) => a.foto_path).filter((p): p is string => Boolean(p));
  if (paths.length) await d.storage.from(BUCKET_AUTO).remove(paths);
  ok(await d.from('demo_auto').delete().not('id', 'is', null));
  ok(await d.from('demo_clienti').delete().not('id', 'is', null));
  const ieri = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  // I clienti cancellati lasciano cliente_id nullo sugli eventi (on delete set null): gli eventi email
  // contengono solo l'hash del destinatario, mai l'indirizzo.
  ok(await d.from('demo_eventi').delete().or(`canale.neq.email,esito.neq.inviato,creato_il.lt.${ieri},tipo.eq.campagna_invio`));
}

export async function elencoAuto(): Promise<Auto[]> {
  const rows = ok(await db().from('demo_auto').select('*').order('creato_il', { ascending: false }).limit(100)) as Auto[];
  const paths = rows.map((r) => r.foto_path).filter((p): p is string => Boolean(p));
  if (paths.length) {
    const { data } = await db().storage.from(BUCKET_AUTO).createSignedUrls(paths, 60 * 60);
    const map = new Map((data ?? []).map((s) => [s.path, s.signedUrl]));
    rows.forEach((r) => (r.foto_url = r.foto_path ? (map.get(r.foto_path) ?? null) : null));
  }
  return rows;
}

export async function inserisciAuto(a: Omit<Auto, 'id' | 'creato_il' | 'foto_url' | 'locale' | 'foto_path'>, foto?: { bytes: ArrayBuffer; type: string }): Promise<Auto> {
  let foto_path: string | null = null;
  if (foto) {
    const ext = foto.type === 'image/webp' ? 'webp' : foto.type === 'image/png' ? 'png' : 'jpg';
    foto_path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const { error } = await db().storage.from(BUCKET_AUTO).upload(foto_path, foto.bytes, { contentType: foto.type, upsert: false });
    if (error) throw new Error(error.message);
  }
  return ok(await db().from('demo_auto').insert({ ...a, foto_path }).select().single());
}
