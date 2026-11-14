// Invio di una campagna ai clienti VERI selezionati dall'admin.
// Il server ricontrolla il consenso alle offerte di ognuno: senza consenso non parte nulla, qualunque cosa chieda il browser.
// I clienti di esempio sono simulati nel browser: qui arriva solo il loro numero, per il riepilogo.
import type { APIRoute } from 'astro';
import { modelloCampagna } from '../../../lib/crm/campagne';
import { campagna, testoWhatsApp } from '../../../lib/crm/messaggi';
import { dbAttivo, whatsappApiAttiva } from '../../../lib/server/config';
import { elencoClienti, registraEvento } from '../../../lib/server/db';
import { inviaEmail } from '../../../lib/server/mail';
import { inviaWhatsAppApi } from '../../../lib/server/whatsapp';
import { json } from '../../../lib/server/security';
import { baseUrlDi, leggiJson, soloAdmin } from '../../../lib/server/guard';

export const prerender = false;

interface Body { modello?: string; clienteIds?: string[]; simulati?: number; esclusi?: number; filtri?: Record<string, unknown> }

export const POST: APIRoute = async (ctx) => {
  const no = soloAdmin(ctx);
  if (no) return no;
  const b = await leggiJson<Body>(ctx.request);
  const m = modelloCampagna(String(b?.modello ?? ''));
  if (!b || !m) return json({ ok: false, error: 'modello' }, 400);
  const ids = new Set((Array.isArray(b.clienteIds) ? b.clienteIds : []).slice(0, 200).map(String));
  const simulati = Math.max(0, Math.min(500, Number(b.simulati) || 0));
  const esclusiBrowser = Math.max(0, Math.min(500, Number(b.esclusi) || 0));
  if (!dbAttivo()) return json({ ok: true, mode: 'simulato', inviati: 0, errori: 0 });

  const idCampagna = crypto.randomUUID();
  const base = baseUrlDi(ctx.request);
  try {
    const tutti = await elencoClienti();
    const scelti = tutti.filter((c) => ids.has(c.id));
    const conConsenso = scelti.filter((c) => c.consenso_offerte);
    let inviati = 0;
    let errori = 0;
    let limite = false;
    for (const c of conConsenso) {
      if (c.canale === 'whatsapp' && whatsappApiAttiva() && c.telefono) {
        const r = await inviaWhatsAppApi(c.telefono, c.lingua, c.nome, testoWhatsApp('campagna', c, base, { modello: m.id }));
        await registraEvento({ cliente_id: c.id, tipo: 'campagna', canale: 'whatsapp', esito: r.ok ? 'inviato' : 'errore', dettagli: { campagna: idCampagna, modello: m.id } });
        if (r.ok) { inviati++; continue; }
      }
      const r = await inviaEmail({ to: c.email, contenuto: campagna(m.id, c, base), baseUrl: base, tipo: 'campagna', clienteId: c.id, dettagli: { campagna: idCampagna, modello: m.id } });
      if (r.esito === 'inviato') inviati++;
      else if (r.esito === 'errore') { errori++; if (r.motivo === 'limite_giorno') limite = true; }
    }
    const esclusi = esclusiBrowser + (scelti.length - conConsenso.length);
    await registraEvento({
      cliente_id: null,
      tipo: 'campagna_invio',
      canale: 'sistema',
      esito: errori && !inviati ? 'errore' : 'inviato',
      dettagli: { campagna: idCampagna, modello: m.id, titolo: m.titolo, destinatari: conConsenso.length + simulati, inviati, simulati, esclusi, errori },
    });
    return json({ ok: true, mode: 'live', campagna: idCampagna, inviati, errori, limite });
  } catch (err) {
    console.error('[admin/campagna]', err);
    return json({ ok: false, error: 'db' }, 503);
  }
};
