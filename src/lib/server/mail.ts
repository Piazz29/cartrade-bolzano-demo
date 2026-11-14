// Invio email con Resend. Ogni invio passa da qui: nessun altro punto del codice chiama Resend.
// Niente database: il tetto giornaliero è contato in memoria (vale per la singola istanza su Vercel,
// insieme al limite per IP in /api/richiesta basta contro l'abuso di un modulo che scrive solo al titolare).
import { Resend } from 'resend';
import { config, emailAttiva, LIMITI } from './config';
import { renderEmail, renderText } from '../email/render';
import type { Contenuto } from '../contatti';

let resend: Resend | null = null;
let invii: number[] = [];

export interface EsitoInvio {
  esito: 'inviato' | 'simulato' | 'errore';
  /** perché non è partita (simulata o errore) */
  motivo?: 'non_configurato' | 'limite_giorno' | 'errore_invio';
}

interface Opzioni {
  to: string;
  contenuto: Contenuto;
  baseUrl: string;
  allegati?: { filename: string; content: Buffer }[];
  replyTo?: string;
}

export async function inviaEmail(o: Opzioni): Promise<EsitoInvio> {
  // Senza chiave Resend: in sviluppo si simula; online è un errore, così il modulo propone WhatsApp
  // invece di dire "inviata" a un cliente la cui richiesta non arriverebbe a nessuno.
  if (!emailAttiva()) return import.meta.env.DEV ? { esito: 'simulato', motivo: 'non_configurato' } : { esito: 'errore', motivo: 'non_configurato' };

  const ora = Date.now();
  invii = invii.filter((t) => ora - t < 24 * 60 * 60_000);
  if (invii.length >= LIMITI.emailGiorno) return { esito: 'errore', motivo: 'limite_giorno' };

  resend ??= new Resend(config.resendKey);
  try {
    const { error } = await resend.emails.send({
      from: config.emailFrom,
      to: [o.to],
      subject: o.contenuto.oggetto,
      html: renderEmail(o.contenuto, { baseUrl: o.baseUrl }),
      text: renderText(o.contenuto),
      replyTo: o.replyTo,
      attachments: o.allegati?.map((a) => ({ filename: a.filename, content: a.content })),
    });
    if (error) {
      console.error('[mail] Resend ha rifiutato l’invio', error.name, error.message);
      return { esito: 'errore', motivo: 'errore_invio' };
    }
    invii.push(ora);
    return { esito: 'inviato' };
  } catch (err) {
    console.error('[mail] errore di rete verso Resend', err);
    return { esito: 'errore', motivo: 'errore_invio' };
  }
}
