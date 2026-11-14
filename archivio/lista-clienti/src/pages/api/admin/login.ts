// Accesso all'admin: password demo (ADMIN_DEMO_PASSWORD) verificata sul server, sessione in cookie httpOnly.
import type { APIRoute } from 'astro';
import { config } from '../../../lib/server/config';
import { apriSessione, ipDi, json, passwordCorretta, stessaOrigine, troppeRichieste } from '../../../lib/server/security';
import { leggiJson } from '../../../lib/server/guard';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, clientAddress, url }) => {
  if (!stessaOrigine(request)) return json({ ok: false, error: 'origine' }, 403);
  if (!config.adminPassword) return json({ ok: false, error: 'non_configurato' }, 503);
  if (troppeRichieste(`login:${ipDi(request, clientAddress)}`, 8, 10 * 60_000)) return json({ ok: false, error: 'troppe_richieste' }, 429);
  const body = await leggiJson<{ password?: string }>(request);
  // Piccolo ritardo fisso: rende inutili i tentativi a raffica
  await new Promise((r) => setTimeout(r, 350));
  if (!passwordCorretta(body?.password)) return json({ ok: false, error: 'password' }, 401);
  apriSessione(cookies, url.protocol === 'https:');
  return json({ ok: true });
};
