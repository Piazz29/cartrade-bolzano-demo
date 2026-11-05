// Invio email con Resend, con i limiti anti-spam e la registrazione dell'evento.
// Ogni invio passa da qui: nessun altro punto del codice chiama Resend.
import { Resend } from 'resend';
import { config, emailAttiva, LIMITI, dbAttivo } from './config';
import { emailInviate24h, registraEvento } from './db';
import { sha256 } from './security';
import { renderEmail, renderText } from '../email/render';
import type { Contenuto } from '../crm/messaggi';
import type { Esito, TipoEvento } from '../crm/types';

let resend: Resend | null = null;

export interface EsitoInvio {
  esito: Esito;
  /** perché non è partita (simulata o errore) */
  motivo?: 'non_configurato' | 'limite_giorno' | 'limite_destinatario' | 'errore_invio';
  eventoId?: string;
}

interface Opzioni {
  to: string;
  contenuto: Contenuto;
  baseUrl: string;
  tipo: TipoEvento;
  clienteId?: string | null;
  /** dettagli dell'evento: MAI dati personali (restano anche dopo il ripristino della demo) */
  dettagli?: Record<string, unknown>;
  allegati?: { filename: string; content: Buffer }[];
  replyTo?: string;
}

export async function inviaEmail(o: Opzioni): Promise<EsitoInvio> {
  const dest = sha256(o.to.trim().toLowerCase());
  const log = async (esito: Esito, extra: Record<string, unknown> = {}) => {
    if (!dbAttivo()) return undefined;
    try {
      const e = await registraEvento({ cliente_id: o.clienteId ?? null, tipo: o.tipo, canale: 'email', esito, dettagli: { dest, ...o.dettagli, ...extra } });
      return e.id;
    } catch (err) {
      console.error('[mail] evento non registrato', err);
      return undefined;
    }
  };

  if (!emailAttiva()) return { esito: 'simulato', motivo: 'non_configurato', eventoId: await log('simulato', { motivo: 'non_configurato' }) };

  const [totale, perDest] = await Promise.all([emailInviate24h(), emailInviate24h(dest)]);
  if (totale >= LIMITI.emailGiorno) return { esito: 'errore', motivo: 'limite_giorno', eventoId: await log('errore', { motivo: 'limite_giorno' }) };
  if (perDest >= LIMITI.emailPerDestinatario) return { esito: 'errore', motivo: 'limite_destinatario', eventoId: await log('errore', { motivo: 'limite_destinatario' }) };

  resend ??= new Resend(config.resendKey);
  try {
    const { data, error } = await resend.emails.send({
      from: config.emailFrom,
      to: [o.to],
      subject: o.contenuto.oggetto,
      html: renderEmail(o.contenuto, { baseUrl: o.baseUrl }),
      text: renderText(o.contenuto),
      replyTo: o.replyTo ?? (config.ownerEmail || undefined),
      attachments: o.allegati?.map((a) => ({ filename: a.filename, content: a.content })),
      tags: [{ name: 'tipo', value: o.tipo }],
    });
    if (error) {
      console.error('[mail] Resend ha rifiutato l’invio', error.name, error.message);
      return { esito: 'errore', motivo: 'errore_invio', eventoId: await log('errore', { motivo: 'errore_invio' }) };
    }
    return { esito: 'inviato', eventoId: await log('inviato', { resend: data?.id }) };
  } catch (err) {
    console.error('[mail] errore di rete verso Resend', err);
    return { esito: 'errore', motivo: 'errore_invio', eventoId: await log('errore', { motivo: 'errore_invio' }) };
  }
}
