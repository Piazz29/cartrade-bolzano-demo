// Impaginazione delle email nello stile del sito, compatibile con i client email:
// tabelle, stili inline, larghezza 600 px, bottone "a prova di Outlook", niente SVG né web font.
// Colori dal DESIGN.md: carta #F7F6F3, navy #0E2340, arancio #E8710A (bottone con testo navy, 5,1:1).
import { site } from '../../data/site';
import type { Contenuto } from '../crm/messaggi';

const C = {
  paper: '#F7F6F3',
  paper2: '#EEECE7',
  ink: '#0E2340',
  night: '#0A1A30',
  orange: '#E8710A',
  orangeInk: '#A64F08',
  muted: '#4A5A70',
  line: '#D9DCE1',
  white: '#FFFFFF',
};
const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif";

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const nl2br = (s: string) => esc(s).replace(/\r?\n/g, '<br>');

function button(label: string, href: string, primary = true) {
  const bg = primary ? C.orange : C.paper;
  const border = primary ? C.orange : C.ink;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
  <tr><td align="center" bgcolor="${bg}" style="background:${bg};border:1px solid ${border};border-radius:2px;mso-padding-alt:14px 22px;">
    <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:14px 22px;font-family:${FONT};font-size:16px;font-weight:bold;line-height:20px;color:${C.ink};text-decoration:none;border-radius:2px;">${esc(label)}&nbsp;&rarr;</a>
  </td></tr></table>`;
}

export interface RenderOpts {
  /** origine assoluta del sito (per logo e link), es. https://cartrade-demo.vercel.app */
  baseUrl: string;
  /** mostra la riga "messaggio inviato dalla demo" */
  demo?: boolean;
}

export function renderEmail(c: Contenuto, { baseUrl, demo = true }: RenderOpts): string {
  const lang = c.lang;
  const city = site.address.city[lang];
  const street = site.address.street[lang];
  const dati = c.dati?.length
    ? `<tr><td style="padding:8px 32px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${C.ink};">
          ${c.dati
            .map(
              ([k, v]) => `<tr>
            <td style="padding:12px 12px 12px 0;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:14px;line-height:20px;color:${C.muted};width:42%;vertical-align:top;">${esc(k)}</td>
            <td style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:15px;line-height:20px;color:${C.ink};font-weight:bold;vertical-align:top;">${esc(v)}</td>
          </tr>`,
            )
            .join('')}
        </table>
      </td></tr>`
    : '';
  const ctas = c.cta
    ? `<tr><td style="padding:24px 32px 8px;">
        ${button(c.cta.label, c.cta.href)}
        ${c.cta2 ? `<div style="height:12px;line-height:12px;font-size:12px;">&nbsp;</div>${button(c.cta2.label, c.cta2.href, false)}` : ''}
      </td></tr>`
    : '';
  const demoNote = demo
    ? `<p style="margin:12px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#93A0B4;">${
        { it: 'Demo: messaggio inviato dall’anteprima del nuovo sito.', de: 'Demo: Diese Nachricht stammt aus der Vorschau der neuen Website.', en: 'Demo: message sent from the new website preview.' }[lang]
      }</p>`
    : '';

  return `<!doctype html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(c.oggetto)}</title>
<!--[if mso]><style>table,td{font-family:Arial,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.paper2};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(c.preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.paper2}" style="background:${C.paper2};">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.paper};border-collapse:collapse;">
    <tr><td style="padding:28px 32px 20px;border-bottom:1px solid ${C.line};">
      <a href="${esc(baseUrl)}/${lang}/" target="_blank" style="text-decoration:none;"><img src="${esc(baseUrl)}/brand/logo-email.png" width="168" height="70" alt="Car Trade ${esc(city)}" style="display:block;border:0;width:168px;height:auto;font-family:${FONT};font-size:18px;font-weight:bold;color:${C.ink};"></a>
    </td></tr>
    <tr><td style="padding:0 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td height="3" width="78%" bgcolor="${C.ink}" style="font-size:0;line-height:0;background:${C.ink};">&nbsp;</td>
        <td height="3" width="22%" bgcolor="${C.orange}" style="font-size:0;line-height:0;background:${C.orange};">&nbsp;</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:28px 32px 4px;">
      <h1 style="margin:0;font-family:${FONT};font-size:26px;line-height:31px;font-weight:bold;letter-spacing:-0.3px;color:${C.ink};">${esc(c.titolo)}</h1>
    </td></tr>
    <tr><td style="padding:12px 32px 4px;">
      ${c.paragrafi.map((p) => `<p style="margin:0 0 14px;font-family:${FONT};font-size:16px;line-height:24px;color:${C.ink};">${nl2br(p)}</p>`).join('')}
    </td></tr>
    ${dati}
    ${ctas}
    ${c.nota ? `<tr><td style="padding:16px 32px 4px;"><p style="margin:0;font-family:${FONT};font-size:14px;line-height:21px;color:${C.muted};">${esc(c.nota)}</p></td></tr>` : ''}
    <tr><td style="padding:28px 32px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.night}" style="background:${C.night};">
        <tr><td style="padding:20px 22px;">
          <p style="margin:0;font-family:${FONT};font-size:14px;line-height:21px;color:${C.white};font-weight:bold;">${esc(site.name)} · ${{ it: 'Centro revisioni affiliato DEKRA', de: 'DEKRA-Partner für die Fahrzeugrevision', en: 'DEKRA-affiliated inspection centre' }[lang]}</p>
          <p style="margin:6px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:#C9D2DF;">${esc(street)} · ${esc(site.address.postalCode)} ${esc(city)}<br>
          <a href="${esc(site.phone.href)}" style="color:#C9D2DF;text-decoration:underline;">${esc(site.phone.display)}</a> · ${{ it: 'Lun–Ven 8:30–12:30, 14:00–18:00', de: 'Mo–Fr 8:30–12:30, 14:00–18:00', en: 'Mon–Fri 8:30–12:30, 14:00–18:00' }[lang]}</p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:${C.muted};">${esc(c.motivo)}</p>
      ${demoNote}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

/** Versione testo (client che non mostrano l'HTML, filtri antispam) */
export function renderText(c: Contenuto): string {
  const lines = [c.titolo, '', ...c.paragrafi.flatMap((p) => [p, ''])];
  if (c.dati?.length) lines.push(...c.dati.map(([k, v]) => `${k}: ${v}`), '');
  if (c.cta) lines.push(`${c.cta.label}: ${c.cta.href}`);
  if (c.cta2) lines.push(`${c.cta2.label}: ${c.cta2.href}`);
  if (c.nota) lines.push('', c.nota);
  lines.push('', '--', `${site.name} · ${site.address.street[c.lang]}, ${site.address.postalCode} ${site.address.city[c.lang]} · ${site.phone.display}`, c.motivo);
  return lines.join('\n');
}
