// Showroom: aggiunta di un'auto dal telefono. Le auto restano nell'admin: il sito pubblico è statico (vedi README).
import type { APIRoute } from 'astro';
import type { Alimentazione, Cambio } from '../../../lib/crm/types';
import { dbAttivo } from '../../../lib/server/config';
import { inserisciAuto } from '../../../lib/server/db';
import { json } from '../../../lib/server/security';
import { soloAdmin } from '../../../lib/server/guard';

export const prerender = false;

const ALIM: Alimentazione[] = ['petrol', 'diesel', 'hybrid', 'phev', 'electric', 'lpg'];
const TIPI = ['image/jpeg', 'image/webp', 'image/png'];

export const POST: APIRoute = async (ctx) => {
  const no = soloAdmin(ctx);
  if (no) return no;
  let f: FormData;
  try {
    f = await ctx.request.formData();
  } catch {
    return json({ ok: false, error: 'formato' }, 400);
  }
  const s = (k: string, max = 60) => String(f.get(k) ?? '').trim().slice(0, max);
  const n = (k: string) => Number(String(f.get(k) ?? '').replace(/[^\d]/g, ''));
  const anno = n('anno');
  const a = {
    marca: s('marca'),
    modello: s('modello'),
    versione: s('versione', 80),
    prezzo: n('prezzo'),
    km: n('km'),
    anno,
    alimentazione: (ALIM.includes(s('alimentazione') as Alimentazione) ? s('alimentazione') : 'petrol') as Alimentazione,
    cambio: (s('cambio') === 'automatic' ? 'automatic' : 'manual') as Cambio,
  };
  const errors: Record<string, string> = {};
  if (!a.marca) errors.marca = 'required';
  if (!a.modello) errors.modello = 'required';
  if (!a.prezzo || a.prezzo > 2_000_000) errors.prezzo = 'required';
  if (!Number.isFinite(a.km) || a.km > 2_000_000) errors.km = 'required';
  if (!anno || anno < 1950 || anno > new Date().getFullYear() + 1) errors.anno = 'required';
  if (Object.keys(errors).length) return json({ ok: false, error: 'validazione', errors }, 422);

  const foto = f.get('foto');
  let file: { bytes: ArrayBuffer; type: string } | undefined;
  if (foto && typeof foto === 'object' && 'arrayBuffer' in foto && foto.size > 0) {
    if (!TIPI.includes(foto.type) || foto.size > 3 * 1024 * 1024) return json({ ok: false, error: 'foto' }, 422);
    file = { bytes: await foto.arrayBuffer(), type: foto.type };
  }
  if (!dbAttivo()) return json({ ok: true, mode: 'simulato' });
  try {
    const auto = await inserisciAuto(a, file);
    return json({ ok: true, mode: 'live', auto });
  } catch (err) {
    console.error('[admin/auto]', err);
    return json({ ok: false, error: 'db' }, 503);
  }
};
