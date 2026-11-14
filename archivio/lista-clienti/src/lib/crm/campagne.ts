// Modelli di campagna pronti. Testi scritti in italiano, tedesco e inglese (non tradotti parola per parola).
import { site } from '../../data/site';
import type { Filtri } from './regole';
import type { Interesse, Lingua } from './types';

type L<T = string> = Record<Lingua, T>;

export interface ModelloCampagna {
  id: string;
  titolo: string; // nome interno (admin, solo italiano)
  periodo: string; // quando ha senso mandarla
  filtri: Filtri; // pubblico suggerito
  oggetto: L;
  titoloMsg: L;
  testo: L<string[]>;
  cta: L<{ label: string; href: (base: string) => string }>;
  /** versione breve per WhatsApp */
  whatsapp: L;
  todo?: string;
}

const wa = (t: string) => site.whatsapp.href(t);

export const MODELLI_CAMPAGNA: ModelloCampagna[] = [
  {
    id: 'gomme-invernali',
    titolo: 'Gomme invernali',
    periodo: 'Ottobre – metà novembre',
    filtri: { interesse: 'gomme' },
    oggetto: {
      it: 'Gomme invernali: dal 15 novembre sono obbligatorie',
      de: 'Winterreifen: Ab 15. November Pflicht',
      en: 'Winter tyres: required from 15 November',
    },
    titoloMsg: { it: 'Il 15 novembre arriva prima di quanto pensi.', de: 'Der 15. November kommt schneller als gedacht.', en: '15 November comes sooner than you think.' },
    testo: {
      it: [
        'In provincia di Bolzano dal 15 novembre al 15 aprile servono gomme invernali montate o catene a bordo.',
        'Prenota adesso il cambio: scegli tu il giorno ed eviti la coda dell’ultima settimana. Se vuoi, controlliamo anche il battistrada e ti diciamo quante stagioni hanno ancora.',
      ],
      de: [
        'In Südtirol gilt vom 15. November bis 15. April die Winterausrüstungspflicht: Winterreifen montiert oder Schneeketten an Bord.',
        'Buchen Sie den Reifenwechsel jetzt, zum Wunschtermin und ohne den Andrang der letzten Woche. Auf Wunsch prüfen wir auch das Profil und sagen Ihnen, wie viele Saisonen die Reifen noch halten.',
      ],
      en: [
        'In South Tyrol, from 15 November to 15 April you need winter tyres fitted or snow chains on board.',
        'Book your tyre change now: pick the day yourself and skip the last-week queue. If you like, we’ll also check the tread and tell you how many seasons your tyres have left.',
      ],
    },
    cta: {
      it: { label: 'Prenota il cambio gomme', href: () => wa('Buongiorno, vorrei prenotare il cambio gomme invernali.') },
      de: { label: 'Reifenwechsel buchen', href: () => wa('Guten Tag, ich möchte einen Termin für den Wechsel auf Winterreifen.') },
      en: { label: 'Book your tyre change', href: () => wa('Hello, I’d like to book a change to winter tyres.') },
    },
    whatsapp: {
      it: 'Dal 15 novembre in provincia di Bolzano servono gomme invernali o catene a bordo. Vuoi prenotare il cambio? Rispondi qui con il giorno che preferisci.',
      de: 'Ab 15. November gilt in Südtirol die Winterausrüstungspflicht. Möchten Sie einen Termin für den Reifenwechsel? Antworten Sie einfach mit Ihrem Wunschtag.',
      en: 'From 15 November winter tyres or snow chains on board are required in South Tyrol. Would you like to book your tyre change? Just reply with the day that suits you.',
    },
  },
  {
    id: 'checkup-vacanze',
    titolo: 'Check-up prima delle vacanze',
    periodo: 'Giugno – luglio',
    filtri: {},
    oggetto: { it: 'Prima di partire: un check-up all’auto', de: 'Vor der Urlaubsfahrt: kurzer Auto-Check', en: 'Before you set off: a quick car check-up' },
    titoloMsg: { it: 'Parti tranquillo.', de: 'Entspannt losfahren.', en: 'Set off with peace of mind.' },
    testo: {
      it: [
        'Freni, pneumatici, livelli, luci e climatizzatore: controlliamo quello che conta per un viaggio lungo, con l’auto carica.',
        'Ti diciamo cosa va bene e cosa no prima di toccare qualcosa. Se serve un intervento, sai subito quanto costa.',
      ],
      de: [
        'Bremsen, Reifen, Flüssigkeiten, Licht und Klimaanlage: Wir prüfen, worauf es bei einer langen Fahrt mit vollem Auto ankommt.',
        'Wir sagen Ihnen, was passt und was nicht, bevor wir etwas anfassen. Ist eine Reparatur nötig, kennen Sie den Preis vorher.',
      ],
      en: [
        'Brakes, tyres, fluid levels, lights and air conditioning: we check what matters for a long trip with a loaded car.',
        'We tell you what’s fine and what isn’t before we touch anything. If something needs doing, you know the price straight away.',
      ],
    },
    cta: {
      it: { label: 'Prenota il check-up', href: () => wa('Buongiorno, vorrei prenotare un check-up prima delle vacanze.') },
      de: { label: 'Check buchen', href: () => wa('Guten Tag, ich möchte vor dem Urlaub einen Auto-Check buchen.') },
      en: { label: 'Book the check-up', href: () => wa('Hello, I’d like to book a check-up before my holiday.') },
    },
    whatsapp: {
      it: 'Prima delle vacanze: freni, gomme, livelli, luci e clima controllati in mezza mattina. Vuoi un appuntamento? Rispondi qui.',
      de: 'Vor dem Urlaub: Bremsen, Reifen, Flüssigkeiten, Licht und Klima an einem Vormittag geprüft. Möchten Sie einen Termin? Antworten Sie einfach hier.',
      en: 'Before your holiday: brakes, tyres, fluids, lights and air con checked in half a morning. Would you like an appointment? Reply here.',
    },
    todo: 'Confermare con il cliente durata e prezzo del check-up.',
  },
  {
    id: 'clima-primavera',
    titolo: 'Climatizzatore in primavera',
    periodo: 'Aprile – maggio',
    filtri: {},
    oggetto: { it: 'Climatizzatore: meglio sistemarlo prima del caldo', de: 'Klimaanlage: lieber vor der Hitze prüfen', en: 'Air conditioning: best sorted before the heat' },
    titoloMsg: { it: 'Aria fresca dal primo giorno caldo.', de: 'Kühle Luft ab dem ersten heißen Tag.', en: 'Cool air from the first hot day.' },
    testo: {
      it: [
        'Se l’aria esce poco fredda o con cattivo odore, di solito basta una ricarica del gas e una sanificazione dell’impianto.',
        'Farlo ad aprile vuol dire niente attese a luglio, quando lo chiedono tutti.',
      ],
      de: [
        'Kommt die Luft nur lauwarm oder riecht sie unangenehm, reichen meist neues Kältemittel und eine Desinfektion der Anlage.',
        'Im April erledigt heißt: kein Warten im Juli, wenn alle gleichzeitig kommen.',
      ],
      en: [
        'If the air isn’t coming out cold enough or smells bad, a refrigerant top-up and a sanitising of the system usually do the trick.',
        'Getting it done in April means no waiting in July, when everyone asks at once.',
      ],
    },
    cta: {
      it: { label: 'Prenota il controllo clima', href: () => wa('Buongiorno, vorrei prenotare la ricarica del climatizzatore.') },
      de: { label: 'Klima-Check buchen', href: () => wa('Guten Tag, ich möchte einen Termin für die Klimaanlage.') },
      en: { label: 'Book an air con check', href: () => wa('Hello, I’d like to book an air conditioning top-up.') },
    },
    whatsapp: {
      it: 'Il climatizzatore rinfresca poco? Ricarica del gas e sanificazione prima del caldo, senza le attese di luglio. Rispondi qui per un appuntamento.',
      de: 'Kühlt die Klimaanlage schwach? Kältemittel und Desinfektion vor der Hitze, ohne Wartezeit im Juli. Antworten Sie hier für einen Termin.',
      en: 'Air con not cooling much? Refrigerant top-up and sanitising before the heat, without the July wait. Reply here for an appointment.',
    },
    todo: 'Confermare con il cliente il servizio climatizzazione (vedi OfficinaView).',
  },
  {
    id: 'dekra-safety-check',
    titolo: 'DEKRA Safety Check',
    periodo: 'Tutto l’anno, a metà ciclo di revisione',
    filtri: { interesse: 'revisione' },
    oggetto: { it: 'Tra una revisione e l’altra: il controllo di sicurezza', de: 'Zwischen zwei Revisionen: der Sicherheits-Check', en: 'Between inspections: the safety check' },
    titoloMsg: { it: 'Un anno dalla revisione. Tutto a posto?', de: 'Ein Jahr seit der Revision. Alles in Ordnung?', en: 'A year since your inspection. All good?' },
    testo: {
      it: [
        'Con il DEKRA Safety Check controlliamo freni, sterzo, luci e pneumatici con gli stessi strumenti della revisione.',
        'Utile a metà ciclo, prima di un viaggio o prima di vendere l’auto: sai come sta, senza sorprese alla prossima revisione.',
      ],
      de: [
        'Beim DEKRA Safety Check prüfen wir Bremsen, Lenkung, Licht und Reifen mit denselben Geräten wie bei der Revision.',
        'Sinnvoll zur Halbzeit, vor einer Reise oder vor dem Verkauf: Sie wissen, wie es um das Auto steht, ohne Überraschung bei der nächsten Revision.',
      ],
      en: [
        'With the DEKRA Safety Check we test brakes, steering, lights and tyres with the same equipment used for the inspection.',
        'Useful halfway through the cycle, before a trip or before selling the car: you know how it stands, with no surprises at the next inspection.',
      ],
    },
    cta: {
      it: { label: 'Chiedi il Safety Check', href: () => wa('Buongiorno, vorrei informazioni sul DEKRA Safety Check.') },
      de: { label: 'Safety Check anfragen', href: () => wa('Guten Tag, ich hätte gern Informationen zum DEKRA Safety Check.') },
      en: { label: 'Ask about the Safety Check', href: () => wa('Hello, I’d like some information about the DEKRA Safety Check.') },
    },
    whatsapp: {
      it: 'A metà strada tra due revisioni: con il DEKRA Safety Check controlliamo freni, sterzo, luci e gomme. Vuoi fissarlo? Rispondi qui.',
      de: 'Zur Halbzeit zwischen zwei Revisionen: Beim DEKRA Safety Check prüfen wir Bremsen, Lenkung, Licht und Reifen. Termin gewünscht? Antworten Sie hier.',
      en: 'Halfway between two inspections: with the DEKRA Safety Check we test brakes, steering, lights and tyres. Want to book it? Reply here.',
    },
    todo: 'Confermare con DEKRA nome, contenuto e prezzo del Safety Check per i centri affiliati.',
  },
];

export const modelloCampagna = (id: string) => MODELLI_CAMPAGNA.find((m) => m.id === id);

export const ETICHETTE_INTERESSI: Record<Interesse, L> = {
  revisione: { it: 'Revisione', de: 'Revision', en: 'Inspection' },
  tagliando: { it: 'Tagliando', de: 'Inspektion', en: 'Car service' },
  carrozzeria: { it: 'Carrozzeria', de: 'Karosserie', en: 'Bodywork' },
  gomme: { it: 'Gomme', de: 'Reifen', en: 'Tyres' },
};
