// Iscrizione pubblica ai promemoria (/it/promemoria/, /de/erinnerung/, QR della locandina).
// L'email di benvenuto parte SOLO se l'iscrizione arriva con il DEMO_KEY corretto (dal QR):
// l'endpoint è pubblico e non deve diventare un modo per mandare email a sconosciuti.
import type { APIRoute } from 'astro';
import { validaIscrizione } from '../../lib/crm/validate';
import { benvenuto } from '../../lib/crm/messaggi';
import type { Cliente } from '../../lib/crm/types';
import { dbAttivo } from '../../lib/server/config';
import { inserisciCliente, registraEvento } from '../../lib/server/db';
import { inviaEmail } from '../../lib/server/mail';
import { demoKeyValida, ipDi, json, stessaOrigine, troppeRichieste } from '../../lib/server/security';
import { baseUrlDi, leggiJson } from '../../lib/server/guard';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!stessaOrigine(request)) return json({ ok: false, error: 'origine' }, 403);
  if (troppeRichieste(`iscr:${ipDi(request, clientAddress)}`, 8, 10 * 60_000)) return json({ ok: false, error: 'troppe_richieste' }, 429);

  const body = await leggiJson(request);
  if (!body) return json({ ok: false, error: 'formato' }, 400);
  // Campo esca: invisibile alle persone, i bot lo compilano. Rispondiamo "ok" senza salvare nulla.
  if (typeof body.sito_web === 'string' && body.sito_web.trim()) return json({ ok: true, mode: 'live', email: 'non_inviata' });

  const v = validaIscrizione(body);
  if (!v.ok) return json({ ok: false, error: 'validazione', errors: v.errors }, 422);
  const conChiave = demoKeyValida(body.demo);
  const nuovo = { ...v.data, ultimo_tagliando: null, consenso_privacy_il: new Date().toISOString(), origine: conChiave ? ('qr' as const) : ('sito' as const) };

  // Senza database: la pagina salva l'iscrizione nel browser (modalità simulata)
  if (!dbAttivo()) return json({ ok: true, mode: 'simulato', email: 'simulato' });

  let c: Cliente;
  try {
    c = await inserisciCliente(nuovo);
    await registraEvento({ cliente_id: c.id, tipo: 'iscrizione', canale: 'sistema', esito: 'registrato', dettagli: { origine: c.origine } });
  } catch (err) {
    console.error('[iscrizione] salvataggio non riuscito', err);
    return json({ ok: false, error: 'server' }, 503);
  }

  let email: string = 'non_inviata';
  if (conChiave) {
    const r = await inviaEmail({ to: c.email, contenuto: benvenuto(c, baseUrlDi(request)), baseUrl: baseUrlDi(request), tipo: 'benvenuto', clienteId: c.id });
    email = r.esito === 'inviato' ? 'inviata' : r.esito === 'simulato' ? 'simulato' : 'errore';
  }
  return json({ ok: true, mode: 'live', email, id: c.id });
};
