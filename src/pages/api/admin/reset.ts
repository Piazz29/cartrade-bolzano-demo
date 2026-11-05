// "Ripristina demo": cancella da Supabase i clienti veri di prova, i loro eventi e le auto aggiunte.
import type { APIRoute } from 'astro';
import { dbAttivo } from '../../../lib/server/config';
import { ripristina } from '../../../lib/server/db';
import { json } from '../../../lib/server/security';
import { soloAdmin } from '../../../lib/server/guard';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const no = soloAdmin(ctx);
  if (no) return no;
  if (!dbAttivo()) return json({ ok: true, mode: 'simulato' });
  try {
    await ripristina();
    return json({ ok: true, mode: 'live' });
  } catch (err) {
    console.error('[admin/reset]', err);
    return json({ ok: false, error: 'db' }, 503);
  }
};
