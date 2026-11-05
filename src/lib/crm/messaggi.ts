// Contenuto di ogni messaggio (email e WhatsApp), in italiano e tedesco.
// Il contenuto è separato dall'impaginazione HTML (lib/email/render.ts): lo stesso testo
// alimenta l'email, il messaggio WhatsApp e le anteprime dell'admin.
import { site, formatPrice } from '../../data/site';
import { addDays, giorniA, parseIsoDate } from '../revisione';
import { modelloCampagna } from './campagne';
import type { Regole, TipoPromemoria } from './regole';
import { REGOLE_PREDEFINITE } from './regole';
import type { Cliente, Lingua } from './types';
import type { RichiestaValida } from './validate';

export interface Contenuto {
  lang: Lingua;
  oggetto: string;
  preheader: string;
  titolo: string;
  paragrafi: string[];
  dati?: [string, string][];
  cta?: { label: string; href: string };
  cta2?: { label: string; href: string };
  nota?: string;
  /** perché si riceve il messaggio (piè di pagina) */
  motivo: string;
}

export type TipoMessaggio = 'benvenuto' | 'promemoria' | 'tagliando' | 'campagna' | 'recensione';

const fmt = (lang: Lingua, d: Date) =>
  new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
const targaLeggibile = (t: string) => (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(t) ? `${t.slice(0, 2)} ${t.slice(2, 5)} ${t.slice(5)}` : t);

const MOTIVO: Record<Lingua, { promemoria: string; offerte: string; servizio: string }> = {
  it: {
    promemoria: 'Ricevi questa email perché ti sei iscritto ai promemoria di Car Trade Bolzano. Per non riceverne più, rispondi STOP.',
    offerte: 'Ricevi questa email perché hai scelto di ricevere le offerte di Car Trade Bolzano. Per non riceverne più, rispondi STOP.',
    servizio: 'Ricevi questa email per un servizio che hai fatto da Car Trade Bolzano.',
  },
  de: {
    promemoria: 'Sie erhalten diese E-Mail, weil Sie sich für die Erinnerungen von Car Trade Bozen angemeldet haben. Abmelden: Antworten Sie mit STOP.',
    offerte: 'Sie erhalten diese E-Mail, weil Sie Angebote von Car Trade Bozen erhalten möchten. Abmelden: Antworten Sie mit STOP.',
    servizio: 'Sie erhalten diese E-Mail zu einem Auftrag bei Car Trade Bozen.',
  },
};

/** Date in cui partiranno i promemoria di revisione, a partire da oggi */
export function dateAvvisi(scadenza: string, regole: Regole = REGOLE_PREDEFINITE, oggi = new Date()) {
  const scad = parseIsoDate(scadenza);
  return [...regole.revisione.giorniPrima]
    .sort((a, b) => b - a)
    .map((g) => ({ giorni: g, data: addDays(scad, -g) }))
    .filter((a) => a.data >= addDays(oggi, -1));
}

export function benvenuto(c: Cliente, _baseUrl: string, regole: Regole = REGOLE_PREDEFINITE, oggi = new Date()): Contenuto {
  const lang = c.lingua;
  const scad = parseIsoDate(c.scadenza);
  const avvisi = dateAvvisi(c.scadenza, regole, oggi);
  const canale = c.canale === 'whatsapp' ? 'WhatsApp' : lang === 'it' ? 'email' : 'E-Mail';
  const giorni = giorniA(scad, oggi);
  if (lang === 'de') {
    return {
      lang,
      oggetto: `Erinnerung aktiv: Revision fällig bis ${fmt(lang, scad)}`,
      preheader: `Wir melden uns rechtzeitig vor dem ${fmt(lang, scad)}.`,
      titolo: `Danke, ${c.nome}. Wir denken für Sie daran.`,
      paragrafi: [
        giorni < 0
          ? `Die Revision Ihres Fahrzeugs ${targaLeggibile(c.targa)} ist seit ${fmt(lang, scad)} abgelaufen. Buchen Sie bitte möglichst bald einen Termin.`
          : `Die Revision Ihres Fahrzeugs ${targaLeggibile(c.targa)} ist bis ${fmt(lang, scad)} fällig.`,
        c.consenso_promemoria && avvisi.length
          ? `Wir schreiben Ihnen per ${canale} ${avvisi.map((a) => `am ${fmt(lang, a.data)} (${a.giorni} Tage vorher)`).join(' und ')}. Sonst nichts.`
          : c.consenso_promemoria
            ? `Sobald es Zeit ist, melden wir uns per ${canale}.`
            : 'Sie haben keine Erinnerungen gewählt: Wir schreiben Ihnen nur, wenn es ein passendes Angebot gibt.',
        ...(c.consenso_offerte ? ['Ab und zu schicken wir Ihnen auch ein saisonales Angebot, etwa zum Reifenwechsel. Abbestellen geht jederzeit.'] : []),
      ],
      dati: [
        ['Kennzeichen', targaLeggibile(c.targa)],
        ['Revision fällig bis', fmt(lang, scad)],
        ...(c.consenso_promemoria && avvisi.length ? ([['Erinnerungen', avvisi.map((a) => fmt(lang, a.data)).join(' · ')]] as [string, string][]) : []),
      ],
      cta: { label: 'Revision jetzt buchen', href: site.dekra.bookingUrl },
      nota: 'Stimmt etwas nicht? Antworten Sie auf diese E-Mail, wir korrigieren es.',
      motivo: MOTIVO.de.promemoria,
    };
  }
  return {
    lang,
    oggetto: `Promemoria attivo: la revisione scade il ${fmt(lang, scad)}`,
    preheader: `Ti avvisiamo noi prima del ${fmt(lang, scad)}.`,
    titolo: `Grazie, ${c.nome}. Ci pensiamo noi.`,
    paragrafi: [
      giorni < 0
        ? `La revisione della tua auto ${targaLeggibile(c.targa)} è scaduta il ${fmt(lang, scad)}. Prenota il prima possibile.`
        : `La revisione della tua auto ${targaLeggibile(c.targa)} scade il ${fmt(lang, scad)}.`,
      c.consenso_promemoria && avvisi.length
        ? `Ti scriveremo su ${canale} ${avvisi.map((a) => `il ${fmt(lang, a.data)} (${a.giorni} giorni prima)`).join(' e ')}. Nient’altro.`
        : c.consenso_promemoria
          ? `Ti scriveremo su ${canale} quando sarà il momento.`
          : 'Non hai scelto i promemoria: ti scriveremo solo per le offerte.',
      ...(c.consenso_offerte ? ['Ogni tanto ti mandiamo anche un’offerta di stagione, come il cambio gomme. Puoi dire basta quando vuoi.'] : []),
    ],
    dati: [
      ['Targa', targaLeggibile(c.targa)],
      ['Scadenza revisione', fmt(lang, scad)],
      ...(c.consenso_promemoria && avvisi.length ? ([['Promemoria', avvisi.map((a) => fmt(lang, a.data)).join(' · ')]] as [string, string][]) : []),
    ],
    cta: { label: 'Prenota la revisione', href: site.dekra.bookingUrl },
    nota: 'Hai sbagliato un dato? Rispondi a questa email e lo correggiamo.',
    motivo: MOTIVO.it.promemoria,
  };
}

export function promemoria(c: Cliente, tipo: TipoPromemoria, baseUrl: string, oggi = new Date(), scadenzaTagliando?: Date): Contenuto {
  const lang = c.lingua;
  if (tipo === 'tagliando') {
    const href = `${baseUrl}${lang === 'it' ? '/it/officina-carrozzeria/#preventivo' : '/de/werkstatt-karosserie/#preventivo'}`;
    const quando = scadenzaTagliando ? fmt(lang, scadenzaTagliando) : '';
    return lang === 'de'
      ? {
          lang,
          oggetto: 'Ein Jahr seit der letzten Inspektion',
          preheader: 'Zeit für die Inspektion. Termin und Preis vorab.',
          titolo: `${c.nome}, Zeit für die Inspektion.`,
          paragrafi: [
            `Seit der letzten Inspektion Ihres Fahrzeugs ${targaLeggibile(c.targa)} ist ein Jahr vergangen${quando ? ` (fällig ab ${quando})` : ''}.`,
            'Antworten Sie auf diese E-Mail oder schreiben Sie uns auf WhatsApp: Wir schlagen einen Termin vor und nennen Ihnen den Preis, bevor wir anfangen.',
          ],
          cta: { label: 'Termin anfragen', href: site.whatsapp.href(`Guten Tag, ich möchte einen Termin für die Inspektion (${c.targa}).`) },
          cta2: { label: 'Angebot online', href },
          motivo: MOTIVO.de.promemoria,
        }
      : {
          lang,
          oggetto: 'È passato un anno dall’ultimo tagliando',
          preheader: 'È ora del tagliando. Giorno e prezzo prima di iniziare.',
          titolo: `${c.nome}, è ora del tagliando.`,
          paragrafi: [
            `Dall’ultimo tagliando della tua auto ${targaLeggibile(c.targa)} è passato un anno${quando ? ` (scade il ${quando})` : ''}.`,
            'Rispondi a questa email o scrivici su WhatsApp: ti proponiamo un giorno e ti diciamo quanto costa prima di iniziare.',
          ],
          cta: { label: 'Chiedi un appuntamento', href: site.whatsapp.href(`Buongiorno, vorrei prenotare il tagliando (${c.targa}).`) },
          cta2: { label: 'Preventivo online', href },
          motivo: MOTIVO.it.promemoria,
        };
  }
  const scad = parseIsoDate(c.scadenza);
  const g = giorniA(scad, oggi);
  const fee = formatPrice(site.revisionFee.total, lang, 2);
  if (lang === 'de') {
    return {
      lang,
      oggetto: g < 0 ? 'Ihre Revision ist abgelaufen' : g <= 10 ? `Letzte Tage: Revision fällig bis ${fmt(lang, scad)}` : `Ihre Revision ist in ${g} Tagen fällig`,
      preheader: 'In zwei Minuten online gebucht. Wunschtag selbst wählen.',
      titolo: g < 0 ? `${c.nome}, die Revision ist abgelaufen.` : `${c.nome}, die Revision ist bis ${fmt(lang, scad)} fällig.`,
      paragrafi: [
        g < 0
          ? 'Mit abgelaufener Revision zu fahren wird bestraft. Am Tag des Termins dürfen Sie mit dem Auto zu uns kommen.'
          : `Noch ${g === 1 ? 'ein Tag' : `${g} Tage`}. Buchen Sie online den Tag, der Ihnen passt.`,
        'Findet die Prüfung einen Mangel, ist unsere Werkstatt gleich nebenan: kein zweiter Weg, kein Abschleppwagen.',
      ],
      dati: [
        ['Kennzeichen', targaLeggibile(c.targa)],
        ['Fällig bis', fmt(lang, scad)],
        ['Staatlicher Tarif', fee],
      ],
      cta: { label: 'Revision buchen', href: site.dekra.bookingUrl },
      nota: 'Bitte den Fahrzeugschein oder das Einheitsdokument im Original mitbringen.',
      motivo: MOTIVO.de.promemoria,
    };
  }
  return {
    lang,
    oggetto: g < 0 ? 'La revisione della tua auto è scaduta' : g <= 10 ? `Ultimi giorni: la revisione scade il ${fmt(lang, scad)}` : `La revisione della tua auto scade tra ${g} giorni`,
    preheader: 'Prenoti online in due minuti, il giorno lo scegli tu.',
    titolo: g < 0 ? `${c.nome}, la revisione è scaduta.` : `${c.nome}, la revisione scade il ${fmt(lang, scad)}.`,
    paragrafi: [
      g < 0
        ? 'Circolare con la revisione scaduta comporta una sanzione. Il giorno della prenotazione puoi venire da noi con l’auto.'
        : `Mancano ${g === 1 ? 'un giorno' : `${g} giorni`}. Prenota online il giorno che preferisci.`,
      'Se il controllo trova un difetto, l’officina è nella stessa sede: niente seconda officina, niente carro attrezzi.',
    ],
    dati: [
      ['Targa', targaLeggibile(c.targa)],
      ['Scadenza', fmt(lang, scad)],
      ['Tariffa nazionale', fee],
    ],
    cta: { label: 'Prenota la revisione', href: site.dekra.bookingUrl },
    nota: 'Porta la carta di circolazione o il Documento Unico in originale.',
    motivo: MOTIVO.it.promemoria,
  };
}

export function campagna(modelloId: string, c: Pick<Cliente, 'nome' | 'lingua'>, baseUrl: string): Contenuto {
  const m = modelloCampagna(modelloId);
  if (!m) throw new Error(`Modello di campagna sconosciuto: ${modelloId}`);
  const lang = c.lingua;
  return {
    lang,
    oggetto: m.oggetto[lang],
    preheader: m.testo[lang][0],
    titolo: m.titoloMsg[lang],
    paragrafi: [lang === 'de' ? `Guten Tag ${c.nome},` : `Ciao ${c.nome},`, ...m.testo[lang]],
    cta: { label: m.cta[lang].label, href: m.cta[lang].href(baseUrl) },
    motivo: MOTIVO[lang].offerte,
  };
}

export function recensione(c: Pick<Cliente, 'nome' | 'lingua'>): Contenuto {
  const lang = c.lingua;
  return lang === 'de'
    ? {
        lang,
        oggetto: `Wie war es, ${c.nome}?`,
        preheader: 'Eine Minute für eine Google-Bewertung.',
        titolo: 'Danke für Ihr Vertrauen.',
        paragrafi: [
          'Die Arbeit an Ihrem Auto ist abgeschlossen.',
          'Waren Sie zufrieden? Eine Bewertung auf Google hilft anderen Autofahrern in Bozen, uns zu finden. Das dauert eine Minute.',
        ],
        cta: { label: 'Bewertung schreiben', href: site.google.writeReviewUrl },
        nota: 'Lief etwas nicht wie erwartet? Antworten Sie auf diese E-Mail: Wir möchten es als Erste wissen.',
        motivo: MOTIVO.de.servizio,
      }
    : {
        lang,
        oggetto: `Com’è andata, ${c.nome}?`,
        preheader: 'Un minuto per una recensione su Google.',
        titolo: 'Grazie per averci scelto.',
        paragrafi: [
          'Il lavoro sulla tua auto è completato.',
          'Ti sei trovato bene? Una recensione su Google aiuta altri automobilisti di Bolzano a trovarci. Ci vuole un minuto.',
        ],
        cta: { label: 'Scrivi una recensione', href: site.google.writeReviewUrl },
        nota: 'Qualcosa non è andato come doveva? Rispondi a questa email: vogliamo saperlo per primi.',
        motivo: MOTIVO.it.servizio,
      };
}

const TIPI_RICHIESTA: Record<string, string> = {
  officina: 'Officina',
  carrozzeria: 'Carrozzeria',
  nonso: 'Da capire',
  revisione: 'Revisione',
  auto: 'Auto in vendita',
  altro: 'Altro',
};
const PREF: Record<string, string> = { phone: 'Telefono', whatsapp: 'WhatsApp', email: 'Email' };

/** Email per il titolare: nuova richiesta dal sito. Sempre in italiano. */
export function nuovaRichiesta(r: RichiestaValida, foto: number): Contenuto {
  const tipo = TIPI_RICHIESTA[r.tipo] ?? r.tipo;
  const cosa = r.variante === 'quote' ? 'preventivo' : 'contatto';
  const tel = r.telefono.replace(/^\+39/, '');
  return {
    lang: 'it',
    oggetto: `Nuova richiesta di ${cosa}: ${tipo} · ${r.nome}`,
    preheader: r.messaggio.slice(0, 90),
    titolo: `${r.nome} chiede un ${cosa}.`,
    paragrafi: [r.messaggio],
    dati: [
      ['Tipo', tipo],
      ['Telefono', r.telefono],
      ...(r.email ? ([['Email', r.email]] as [string, string][]) : []),
      ...(r.auto ? ([['Auto', r.auto]] as [string, string][]) : []),
      ...(r.targa ? ([['Targa', targaLeggibile(r.targa)]] as [string, string][]) : []),
      ['Preferisce', PREF[r.preferenza] ?? r.preferenza],
      ['Lingua', r.lingua === 'de' ? 'Tedesco' : 'Italiano'],
      ...(foto ? ([['Foto', `${foto} allegat${foto === 1 ? 'a' : 'e'}`]] as [string, string][]) : []),
    ],
    cta: r.preferenza === 'whatsapp'
      ? { label: `Rispondi su WhatsApp`, href: `https://wa.me/${r.telefono.replace(/\D/g, '')}` }
      : { label: `Chiama ${r.nome.split(' ')[0]}`, href: `tel:${r.telefono}` },
    cta2: r.email ? { label: 'Rispondi via email', href: `mailto:${r.email}` } : undefined,
    nota: `Arrivata dalla pagina ${r.pagina || 'del sito'}. Cellulare: ${tel}.`,
    motivo: 'Email automatica del sito Car Trade Bolzano (demo): una richiesta compilata da un cliente.',
  };
}

/* ------------------------------------------------------------------ */
/* WhatsApp: stesso contenuto, in breve                                 */
/* ------------------------------------------------------------------ */
export function testoWhatsApp(tipo: TipoMessaggio, c: Cliente, baseUrl: string, opts: { modello?: string; oggi?: Date } = {}): string {
  const lang = c.lingua;
  const oggi = opts.oggi ?? new Date();
  const firma = lang === 'de' ? '\n\nCar Trade Bozen · DEKRA-Partner' : '\n\nCar Trade Bolzano · centro revisioni DEKRA';
  const scad = fmt(lang, parseIsoDate(c.scadenza));
  switch (tipo) {
    case 'benvenuto':
      return lang === 'de'
        ? `Guten Tag ${c.nome}, danke für Ihre Anmeldung. Die Revision für ${targaLeggibile(c.targa)} ist bis ${scad} fällig: Wir erinnern Sie rechtzeitig.${firma}`
        : `Ciao ${c.nome}, grazie per l’iscrizione. La revisione di ${targaLeggibile(c.targa)} scade il ${scad}: ti avvisiamo noi per tempo.${firma}`;
    case 'promemoria': {
      const g = giorniA(parseIsoDate(c.scadenza), oggi);
      return lang === 'de'
        ? `Guten Tag ${c.nome}, die Revision für ${targaLeggibile(c.targa)} ist ${g < 0 ? `seit ${scad} abgelaufen` : `bis ${scad} fällig (noch ${g} Tage)`}. Hier online buchen: ${site.dekra.bookingUrl}${firma}`
        : `Ciao ${c.nome}, la revisione di ${targaLeggibile(c.targa)} ${g < 0 ? `è scaduta il ${scad}` : `scade il ${scad} (mancano ${g} giorni)`}. Prenoti qui in due minuti: ${site.dekra.bookingUrl}${firma}`;
    }
    case 'tagliando':
      return lang === 'de'
        ? `Guten Tag ${c.nome}, seit der letzten Inspektion für ${targaLeggibile(c.targa)} ist ein Jahr vergangen. Sollen wir einen Termin vorschlagen? Antworten Sie einfach hier.${firma}`
        : `Ciao ${c.nome}, è passato un anno dall’ultimo tagliando di ${targaLeggibile(c.targa)}. Vuoi che ti proponiamo un giorno? Rispondi pure qui.${firma}`;
    case 'campagna': {
      const m = modelloCampagna(opts.modello ?? '');
      const link = m ? m.cta[lang].href(baseUrl) : baseUrl;
      const body = m ? m.whatsapp[lang].replace('{link}', link) : '';
      return `${lang === 'de' ? `Guten Tag ${c.nome},` : `Ciao ${c.nome},`} ${body}${firma}`;
    }
    case 'recensione':
      return lang === 'de'
        ? `Guten Tag ${c.nome}, danke für Ihr Vertrauen. Waren Sie zufrieden? Eine kurze Google-Bewertung hilft uns sehr: ${site.google.writeReviewUrl}${firma}`
        : `Ciao ${c.nome}, grazie per averci scelto. Ti sei trovato bene? Una recensione su Google ci aiuta tantissimo: ${site.google.writeReviewUrl}${firma}`;
  }
}

/** Link wa.me con il messaggio già scritto. Senza numero apre WhatsApp per scegliere il contatto. */
export const linkWhatsApp = (telefono: string | null, testo: string) =>
  `https://wa.me/${telefono ? telefono.replace(/\D/g, '') : ''}?text=${encodeURIComponent(testo)}`;
