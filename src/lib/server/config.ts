// Configurazione del server, letta dalle variabili d'ambiente (vedi .env.example).
// Solo per codice lato server: le chiavi non finiscono mai nel browser.
import {
  ADMIN_DEMO_PASSWORD,
  DEMO_KEY,
  DEMO_OWNER_EMAIL,
  EMAIL_FROM,
  RESEND_API_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  WHATSAPP_PHONE_ID,
  WHATSAPP_TEMPLATE,
  WHATSAPP_TOKEN,
} from 'astro:env/server';
import type { StatoServizi } from '../crm/types';

export const config = {
  supabaseUrl: SUPABASE_URL?.trim() || '',
  supabaseKey: SUPABASE_SERVICE_ROLE_KEY?.trim() || '',
  resendKey: RESEND_API_KEY?.trim() || '',
  emailFrom: EMAIL_FROM?.trim() || 'Car Trade Bolzano · demo <demo@auralpdigital.com>',
  ownerEmail: DEMO_OWNER_EMAIL?.trim() || '',
  demoKey: DEMO_KEY?.trim() || '',
  adminPassword: ADMIN_DEMO_PASSWORD?.trim() || (import.meta.env.DEV ? 'demo' : ''),
  whatsapp: {
    token: WHATSAPP_TOKEN?.trim() || '',
    phoneId: WHATSAPP_PHONE_ID?.trim() || '',
    template: WHATSAPP_TEMPLATE?.trim() || '',
  },
};

/** Limiti anti-spam sugli invii email reali */
export const LIMITI = { emailGiorno: 30, emailPerDestinatario: 5 };

export const dbAttivo = () => Boolean(config.supabaseUrl && config.supabaseKey);
/** Le email reali partono solo con Resend E Supabase: senza database non si possono contare gli invii (limiti) */
export const emailAttiva = () => Boolean(config.resendKey && dbAttivo());
export const whatsappApiAttiva = () => Boolean(config.whatsapp.token && config.whatsapp.phoneId && config.whatsapp.template);

export const statoServizi = (): StatoServizi => ({
  db: dbAttivo(),
  email: emailAttiva(),
  whatsappApi: whatsappApiAttiva(),
  demoKey: Boolean(config.demoKey),
});
