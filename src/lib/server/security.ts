// Sicurezza: confronto a tempo costante, hash, sessione admin firmata, controllo dell'origine,
// limite di richieste per IP (best effort, in memoria della singola istanza).
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { config } from './config';

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function stessoValore(a: string, b: string) {
  const ha = Buffer.from(sha256(a));
  const hb = Buffer.from(sha256(b));
  return a.length > 0 && b.length > 0 && timingSafeEqual(ha, hb);
}

/** Il DEMO_KEY arriva dal QR della locandina (?demo=…) */
export const demoKeyValida = (k: unknown) => typeof k === 'string' && Boolean(config.demoKey) && stessoValore(k, config.demoKey);

/* ------------------------------------------------------------------ */
/* Sessione admin: cookie httpOnly con scadenza firmata HMAC            */
/* Cambiare ADMIN_DEMO_PASSWORD invalida tutte le sessioni aperte.      */
/* ------------------------------------------------------------------ */
export const COOKIE = 'ct_admin';
const DURATA_S = 12 * 60 * 60;
const chiave = () => sha256(`ct-admin-session:${config.adminPassword}`);
const firma = (v: string) => createHmac('sha256', chiave()).update(v).digest('base64url');

export function apriSessione(cookies: AstroCookies, secure: boolean) {
  const exp = String(Math.floor(Date.now() / 1000) + DURATA_S);
  cookies.set(COOKIE, `${exp}.${firma(exp)}`, { httpOnly: true, secure, sameSite: 'strict', path: '/', maxAge: DURATA_S });
}

export const chiudiSessione = (cookies: AstroCookies) => cookies.delete(COOKIE, { path: '/' });

export function sessioneValida(cookies: AstroCookies): boolean {
  if (!config.adminPassword) return false;
  const raw = cookies.get(COOKIE)?.value ?? '';
  const [exp, sig] = raw.split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const atteso = firma(exp);
  return sig.length === atteso.length && timingSafeEqual(Buffer.from(sig), Buffer.from(atteso));
}

export const passwordCorretta = (p: unknown) => typeof p === 'string' && Boolean(config.adminPassword) && stessoValore(p, config.adminPassword);

/* ------------------------------------------------------------------ */
/* Richieste: solo dalla stessa origine (niente invii da altri siti)    */
/* ------------------------------------------------------------------ */
export function stessaOrigine(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('sec-fetch-site') !== 'cross-site';
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

const finestre = new Map<string, number[]>();
/** max richieste per finestra (ms) per chiave (es. IP + rotta). Su Vercel vale per la singola istanza: è una prima barriera, i limiti veri sono su Supabase. */
export function troppeRichieste(chiave: string, max: number, finestraMs: number) {
  const ora = Date.now();
  const lista = (finestre.get(chiave) ?? []).filter((t) => ora - t < finestraMs);
  lista.push(ora);
  finestre.set(chiave, lista);
  if (finestre.size > 5000) finestre.clear();
  return lista.length > max;
}

export const ipDi = (request: Request, clientAddress?: string) =>
  request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress || 'ignoto';

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
