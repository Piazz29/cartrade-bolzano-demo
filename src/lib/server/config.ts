// Configurazione del server, letta dalle variabili d'ambiente (vedi .env.example).
// Solo per codice lato server: le chiavi non finiscono mai nel browser.
// Il sito non ha database: l'unico servizio esterno è Resend, per inoltrare al titolare
// le richieste dei moduli contatti e preventivo. Il destinatario è fisso (lib/contatti.ts → site.email).
import { EMAIL_FROM, RESEND_API_KEY } from 'astro:env/server';

/** Indirizzo del mittente: quello di EMAIL_FROM (dominio verificato su Resend), sempre con il nome "Sito web" */
const indirizzoMittente = (() => {
  const v = EMAIL_FROM?.trim() || '';
  return v.match(/<([^>]+)>/)?.[1] || (v.includes('@') ? v : 'demo@auralpdigital.com');
})();

export const config = {
  resendKey: RESEND_API_KEY?.trim() || '',
  emailFrom: `Sito web Car Trade Bolzano <${indirizzoMittente}>`,
};

/** Tetto anti-abuso sulle email inoltrate al titolare (per istanza del server, in memoria) */
export const LIMITI = { emailGiorno: 60 };

export const emailAttiva = () => Boolean(config.resendKey);
