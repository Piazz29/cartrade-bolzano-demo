// Tutti i dati veri per l'admin: clienti iscritti ed eventi. Gli esempi vivono nel browser.
import type { APIRoute } from 'astro';
import { dbAttivo, statoServizi } from '../../../lib/server/config';
import { elencoClienti, elencoEventi } from '../../../lib/server/db';
import { json } from '../../../lib/server/security';
import { soloAdmin } from '../../../lib/server/guard';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const no = soloAdmin(ctx);
  if (no) return no;
  const stato = statoServizi();
  if (!dbAttivo()) return json({ ok: true, stato, clienti: [], eventi: [] });
  try {
    const [clienti, eventi] = await Promise.all([elencoClienti(), elencoEventi()]);
    return json({ ok: true, stato, clienti, eventi });
  } catch (err) {
    console.error('[admin/dati]', err);
    return json({ ok: false, stato, error: 'db' }, 503);
  }
};
