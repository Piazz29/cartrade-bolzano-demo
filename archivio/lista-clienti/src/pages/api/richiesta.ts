// Modulo contatti e preventivo carrozzeria con foto. Destinatario fisso: il titolare (DEMO_OWNER_EMAIL).
// Le foto arrivano già ridimensionate dal browser (max 6, in totale sotto il limite di 4,5 MB delle funzioni Vercel).
import type { APIRoute } from 'astro';
import { validaRichiesta } from '../../lib/crm/validate';
import { nuovaRichiesta } from '../../lib/crm/messaggi';
import { config, dbAttivo } from '../../lib/server/config';
import { registraEvento } from '../../lib/server/db';
import { inviaEmail } from '../../lib/server/mail';
import { ipDi, json, stessaOrigine, troppeRichieste } from '../../lib/server/security';
import { baseUrlDi } from '../../lib/server/guard';

export const prerender = false;

const MAX_FOTO = 6;
const MAX_FOTO_BYTES = 1.5 * 1024 * 1024;
const TIPI = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!stessaOrigine(request)) return json({ ok: false, error: 'origine' }, 403);
  if (troppeRichieste(`rich:${ipDi(request, clientAddress)}`, 6, 10 * 60_000)) return json({ ok: false, error: 'troppe_richieste' }, 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'formato' }, 400);
  }
  if (String(form.get('sito_web') ?? '').trim()) return json({ ok: true, mode: 'live', email: 'inviata' });

  const campi = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string'));
  const v = validaRichiesta(campi);
  if (!v.ok) return json({ ok: false, error: 'validazione', errors: v.errors }, 422);

  const foto = form.getAll('foto').filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f);
  if (foto.length > MAX_FOTO) return json({ ok: false, error: 'foto_troppe' }, 422);
  const allegati: { filename: string; content: Buffer }[] = [];
  for (const [i, f] of foto.entries()) {
    const ext = TIPI.get(f.type);
    if (!ext || f.size > MAX_FOTO_BYTES) return json({ ok: false, error: 'foto_formato' }, 422);
    allegati.push({ filename: `foto-${i + 1}.${ext}`, content: Buffer.from(await f.arrayBuffer()) });
  }

  if (!config.ownerEmail) {
    if (dbAttivo()) await registraEvento({ cliente_id: null, tipo: 'richiesta', canale: 'sistema', esito: 'simulato', dettagli: { variante: v.data.variante, foto: allegati.length } }).catch(() => {});
    return json({ ok: true, mode: 'simulato', email: 'simulato' });
  }
  const r = await inviaEmail({
    to: config.ownerEmail,
    contenuto: nuovaRichiesta(v.data, allegati.length),
    baseUrl: baseUrlDi(request),
    tipo: 'richiesta',
    dettagli: { variante: v.data.variante, tipo: v.data.tipo, foto: allegati.length },
    allegati,
    replyTo: v.data.email || undefined,
  });
  if (r.esito === 'errore') return json({ ok: false, error: r.motivo ?? 'invio' }, r.motivo?.startsWith('limite') ? 429 : 502);
  return json({ ok: true, mode: r.esito === 'inviato' ? 'live' : 'simulato', email: r.esito === 'inviato' ? 'inviata' : 'simulato' });
};
