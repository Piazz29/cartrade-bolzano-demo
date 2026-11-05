// Azioni sulla scheda di un cliente VERO: promemoria ora, lavoro completato (richiesta recensione),
// WhatsApp (Cloud API se configurata, altrimenti si registra il link aperto), visite e recensioni ottenute.
import type { APIRoute } from 'astro';
import { promemoria, recensione } from '../../../lib/crm/messaggi';
import type { TipoEvento } from '../../../lib/crm/types';
import { dbAttivo, whatsappApiAttiva } from '../../../lib/server/config';
import { aggiornaCliente, cliente, registraEvento } from '../../../lib/server/db';
import { inviaEmail } from '../../../lib/server/mail';
import { inviaWhatsAppApi } from '../../../lib/server/whatsapp';
import { json } from '../../../lib/server/security';
import { baseUrlDi, leggiJson, soloAdmin } from '../../../lib/server/guard';
import { isoDate, parseIsoDate } from '../../../lib/revisione';

export const prerender = false;

interface Body {
  azione?: 'promemoria' | 'recensione' | 'whatsapp' | 'recensione_ottenuta' | 'visita';
  clienteId?: string;
  tipo?: 'revisione' | 'tagliando';
  chiave?: string;
  scadenza?: string;
  /** WhatsApp: evento da registrare e testo già composto dall'admin */
  evento?: TipoEvento;
  testo?: string;
  motivo?: string;
}

const EVENTI_WA: TipoEvento[] = ['benvenuto', 'promemoria', 'campagna', 'recensione_richiesta'];

export const POST: APIRoute = async (ctx) => {
  const no = soloAdmin(ctx);
  if (no) return no;
  if (!dbAttivo()) return json({ ok: true, esito: 'simulato', motivo: 'non_configurato' });
  const b = await leggiJson<Body>(ctx.request);
  if (!b?.clienteId || !b.azione) return json({ ok: false, error: 'formato' }, 400);

  try {
    const c = await cliente(b.clienteId);
    if (!c) return json({ ok: false, error: 'cliente_inesistente' }, 404);
    const base = baseUrlDi(ctx.request);

    switch (b.azione) {
      case 'promemoria': {
        const tipo = b.tipo === 'tagliando' ? 'tagliando' : 'revisione';
        const scadT = tipo === 'tagliando' && b.scadenza ? parseIsoDate(b.scadenza) : undefined;
        const r = await inviaEmail({
          to: c.email,
          contenuto: promemoria(c, tipo, base, new Date(), scadT),
          baseUrl: base,
          tipo: 'promemoria',
          clienteId: c.id,
          dettagli: { regola: tipo, chiave: b.chiave ?? null, manuale: true },
        });
        return json({ ok: r.esito !== 'errore', esito: r.esito, motivo: r.motivo });
      }
      case 'recensione': {
        await registraEvento({ cliente_id: c.id, tipo: 'visita', canale: 'sistema', esito: 'registrato', dettagli: { motivo: b.motivo ?? 'lavoro' } });
        if (b.motivo === 'tagliando') await aggiornaCliente(c.id, { ultimo_tagliando: isoDate(new Date()) });
        const r = await inviaEmail({ to: c.email, contenuto: recensione(c), baseUrl: base, tipo: 'recensione_richiesta', clienteId: c.id });
        return json({ ok: r.esito !== 'errore', esito: r.esito, motivo: r.motivo });
      }
      case 'whatsapp': {
        const evento = EVENTI_WA.includes(b.evento as TipoEvento) ? (b.evento as TipoEvento) : 'promemoria';
        const testo = String(b.testo ?? '').slice(0, 1000);
        if (whatsappApiAttiva() && c.telefono) {
          const r = await inviaWhatsAppApi(c.telefono, c.lingua, c.nome, testo);
          await registraEvento({ cliente_id: c.id, tipo: evento, canale: 'whatsapp', esito: r.ok ? 'inviato' : 'errore', dettagli: { via: 'api', ...(r.ok ? {} : { motivo: 'errore_invio' }) } });
          // Se l'API fallisce, l'admin apre comunque il link wa.me: la demo non si ferma
          return json({ ok: true, mode: r.ok ? 'api' : 'link', esito: r.ok ? 'inviato' : 'aperto' });
        }
        await registraEvento({ cliente_id: c.id, tipo: evento, canale: 'whatsapp', esito: 'aperto', dettagli: { via: 'link' } });
        return json({ ok: true, mode: 'link', esito: 'aperto' });
      }
      case 'recensione_ottenuta':
        await registraEvento({ cliente_id: c.id, tipo: 'recensione_ottenuta', canale: 'sistema', esito: 'registrato', dettagli: {} });
        return json({ ok: true, esito: 'registrato' });
      case 'visita':
        await registraEvento({ cliente_id: c.id, tipo: 'visita', canale: 'sistema', esito: 'registrato', dettagli: { motivo: b.motivo ?? 'visita' } });
        return json({ ok: true, esito: 'registrato' });
      default:
        return json({ ok: false, error: 'azione' }, 400);
    }
  } catch (err) {
    console.error('[admin/azione]', err);
    return json({ ok: false, error: 'db' }, 503);
  }
};
