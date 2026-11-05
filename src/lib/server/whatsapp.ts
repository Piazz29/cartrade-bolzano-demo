// WhatsApp Cloud API (facoltativa). Se WHATSAPP_TOKEN, WHATSAPP_PHONE_ID e WHATSAPP_TEMPLATE non sono impostate,
// l'admin usa il link wa.me con il messaggio già scritto (modalità predefinita, sempre funzionante).
// Il modello approvato su Meta deve avere due variabili nel corpo: {{1}} = nome, {{2}} = testo.
// Stesso nome di modello in italiano (it) e tedesco (de). Vedi README.
import { config, whatsappApiAttiva } from './config';
import type { Lingua } from '../crm/types';

const GRAPH = 'https://graph.facebook.com/v21.0';

export async function inviaWhatsAppApi(to: string, lingua: Lingua, nome: string, testo: string): Promise<{ ok: boolean; id?: string; errore?: string }> {
  if (!whatsappApiAttiva()) return { ok: false, errore: 'non_configurato' };
  // I parametri dei modelli non ammettono a capo né più di 4 spazi di fila
  const param = (s: string) => s.replace(/\s*\n+\s*/g, ' · ').replace(/\s{4,}/g, ' ').slice(0, 1000);
  try {
    const res = await fetch(`${GRAPH}/${config.whatsapp.phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.whatsapp.token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'template',
        template: {
          name: config.whatsapp.template,
          language: { code: lingua },
          components: [{ type: 'body', parameters: [{ type: 'text', text: param(nome) }, { type: 'text', text: param(testo) }] }],
        },
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { messages?: { id: string }[]; error?: { message?: string } };
    if (!res.ok) return { ok: false, errore: body.error?.message ?? `HTTP ${res.status}` };
    return { ok: true, id: body.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, errore: err instanceof Error ? err.message : 'rete' };
  }
}
