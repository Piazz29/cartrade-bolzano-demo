// Modelli di campagna pronti. Testi scritti in italiano e in tedesco (non tradotti parola per parola).
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
    },
    titoloMsg: { it: 'Il 15 novembre arriva prima di quanto pensi.', de: 'Der 15. November kommt schneller als gedacht.' },
    testo: {
      it: [
        'In provincia di Bolzano dal 15 novembre al 15 aprile servono gomme invernali montate o catene a bordo.',
        'Prenota adesso il cambio: scegli tu il giorno ed eviti la coda dell’ultima settimana. Se vuoi, controlliamo anche il battistrada e ti diciamo quante stagioni hanno ancora.',
      ],
      de: [
        'In Südtirol gilt vom 15. November bis 15. April die Winterausrüstungspflicht: Winterreifen montiert oder Schneeketten an Bord.',
        'Buchen Sie den Reifenwechsel jetzt, zum Wunschtermin und ohne den Andrang der letzten Woche. Auf Wunsch prüfen wir auch das Profil und sagen Ihnen, wie viele Saisonen die Reifen noch halten.',
      ],
    },
    cta: {
      it: { label: 'Prenota il cambio gomme', href: () => wa('Buongiorno, vorrei prenotare il cambio gomme invernali.') },
      de: { label: 'Reifenwechsel buchen', href: () => wa('Guten Tag, ich möchte einen Termin für den Wechsel auf Winterreifen.') },
    },
    whatsapp: {
      it: 'Dal 15 novembre in provincia di Bolzano servono gomme invernali o catene a bordo. Vuoi prenotare il cambio? Rispondi qui con il giorno che preferisci.',
      de: 'Ab 15. November gilt in Südtirol die Winterausrüstungspflicht. Möchten Sie einen Termin für den Reifenwechsel? Antworten Sie einfach mit Ihrem Wunschtag.',
    },
  },
  {
    id: 'checkup-vacanze',
    titolo: 'Check-up prima delle vacanze',
    periodo: 'Giugno – luglio',
    filtri: {},
    oggetto: { it: 'Prima di partire: un check-up all’auto', de: 'Vor der Urlaubsfahrt: kurzer Auto-Check' },
    titoloMsg: { it: 'Parti tranquillo.', de: 'Entspannt losfahren.' },
    testo: {
      it: [
        'Freni, pneumatici, livelli, luci e climatizzatore: controlliamo quello che conta per un viaggio lungo, con l’auto carica.',
        'Ti diciamo cosa va bene e cosa no prima di toccare qualcosa. Se serve un intervento, sai subito quanto costa.',
      ],
      de: [
        'Bremsen, Reifen, Flüssigkeiten, Licht und Klimaanlage: Wir prüfen, worauf es bei einer langen Fahrt mit vollem Auto ankommt.',
        'Wir sagen Ihnen, was passt und was nicht, bevor wir etwas anfassen. Ist eine Reparatur nötig, kennen Sie den Preis vorher.',
      ],
    },
    cta: {
      it: { label: 'Prenota il check-up', href: () => wa('Buongiorno, vorrei prenotare un check-up prima delle vacanze.') },
      de: { label: 'Check buchen', href: () => wa('Guten Tag, ich möchte vor dem Urlaub einen Auto-Check buchen.') },
    },
    whatsapp: {
      it: 'Prima delle vacanze: freni, gomme, livelli, luci e clima controllati in mezza mattina. Vuoi un appuntamento? Rispondi qui.',
      de: 'Vor dem Urlaub: Bremsen, Reifen, Flüssigkeiten, Licht und Klima an einem Vormittag geprüft. Möchten Sie einen Termin? Antworten Sie einfach hier.',
    },
    todo: 'Confermare con il cliente durata e prezzo del check-up.',
  },
  {
    id: 'clima-primavera',
    titolo: 'Climatizzatore in primavera',
    periodo: 'Aprile – maggio',
    filtri: {},
    oggetto: { it: 'Climatizzatore: meglio sistemarlo prima del caldo', de: 'Klimaanlage: lieber vor der Hitze prüfen' },
    titoloMsg: { it: 'Aria fresca dal primo giorno caldo.', de: 'Kühle Luft ab dem ersten heißen Tag.' },
    testo: {
      it: [
        'Se l’aria esce poco fredda o con cattivo odore, di solito basta una ricarica del gas e una sanificazione dell’impianto.',
        'Farlo ad aprile vuol dire niente attese a luglio, quando lo chiedono tutti.',
      ],
      de: [
        'Kommt die Luft nur lauwarm oder riecht sie unangenehm, reichen meist neues Kältemittel und eine Desinfektion der Anlage.',
        'Im April erledigt heißt: kein Warten im Juli, wenn alle gleichzeitig kommen.',
      ],
    },
    cta: {
      it: { label: 'Prenota il controllo clima', href: () => wa('Buongiorno, vorrei prenotare la ricarica del climatizzatore.') },
      de: { label: 'Klima-Check buchen', href: () => wa('Guten Tag, ich möchte einen Termin für die Klimaanlage.') },
    },
    whatsapp: {
      it: 'Il climatizzatore rinfresca poco? Ricarica del gas e sanificazione prima del caldo, senza le attese di luglio. Rispondi qui per un appuntamento.',
      de: 'Kühlt die Klimaanlage schwach? Kältemittel und Desinfektion vor der Hitze, ohne Wartezeit im Juli. Antworten Sie hier für einen Termin.',
    },
    todo: 'Confermare con il cliente il servizio climatizzazione (vedi OfficinaView).',
  },
  {
    id: 'dekra-safety-check',
    titolo: 'DEKRA Safety Check',
    periodo: 'Tutto l’anno, a metà ciclo di revisione',
    filtri: { interesse: 'revisione' },
    oggetto: { it: 'Tra una revisione e l’altra: il controllo di sicurezza', de: 'Zwischen zwei Revisionen: der Sicherheits-Check' },
    titoloMsg: { it: 'Un anno dalla revisione. Tutto a posto?', de: 'Ein Jahr seit der Revision. Alles in Ordnung?' },
    testo: {
      it: [
        'Con il DEKRA Safety Check controlliamo freni, sterzo, luci e pneumatici con gli stessi strumenti della revisione.',
        'Utile a metà ciclo, prima di un viaggio o prima di vendere l’auto: sai come sta, senza sorprese alla prossima revisione.',
      ],
      de: [
        'Beim DEKRA Safety Check prüfen wir Bremsen, Lenkung, Licht und Reifen mit denselben Geräten wie bei der Revision.',
        'Sinnvoll zur Halbzeit, vor einer Reise oder vor dem Verkauf: Sie wissen, wie es um das Auto steht, ohne Überraschung bei der nächsten Revision.',
      ],
    },
    cta: {
      it: { label: 'Chiedi il Safety Check', href: () => wa('Buongiorno, vorrei informazioni sul DEKRA Safety Check.') },
      de: { label: 'Safety Check anfragen', href: () => wa('Guten Tag, ich hätte gern Informationen zum DEKRA Safety Check.') },
    },
    whatsapp: {
      it: 'A metà strada tra due revisioni: con il DEKRA Safety Check controlliamo freni, sterzo, luci e gomme. Vuoi fissarlo? Rispondi qui.',
      de: 'Zur Halbzeit zwischen zwei Revisionen: Beim DEKRA Safety Check prüfen wir Bremsen, Lenkung, Licht und Reifen. Termin gewünscht? Antworten Sie hier.',
    },
    todo: 'Confermare con DEKRA nome, contenuto e prezzo del Safety Check per i centri affiliati.',
  },
  {
    id: 'nuove-auto',
    titolo: 'Nuove auto in showroom',
    periodo: 'Quando arrivano auto nuove',
    filtri: { interesse: 'auto' },
    oggetto: { it: 'Nuove auto nel nostro showroom', de: 'Neue Fahrzeuge in unserem Showroom' },
    titoloMsg: { it: 'Appena arrivate, già controllate.', de: 'Gerade eingetroffen, schon geprüft.' },
    testo: {
      it: [
        'Sono arrivate nuove auto usate e km 0. Come sempre le abbiamo controllate nella nostra officina prima di metterle in vendita.',
        'Prezzo in chiaro su ogni scheda. Se una ti interessa, scrivici: la teniamo ferma per una prova.',
      ],
      de: [
        'Neue Gebrauchtwagen und Tageszulassungen sind da. Wie immer vor dem Verkauf in unserer Werkstatt geprüft.',
        'Klarer Preis auf jedem Datenblatt. Gefällt Ihnen eines, schreiben Sie uns: Wir halten es für eine Probefahrt bereit.',
      ],
    },
    cta: {
      it: { label: 'Vedi le auto', href: (b) => `${b}/it/auto/` },
      de: { label: 'Fahrzeuge ansehen', href: (b) => `${b}/de/fahrzeuge/` },
    },
    whatsapp: {
      it: 'Sono arrivate nuove auto in showroom, tutte controllate in officina. Le trovi qui: {link}',
      de: 'Neue Fahrzeuge im Showroom, alle in der Werkstatt geprüft. Hier ansehen: {link}',
    },
  },
];

export const modelloCampagna = (id: string) => MODELLI_CAMPAGNA.find((m) => m.id === id);

export const ETICHETTE_INTERESSI: Record<Interesse, L> = {
  revisione: { it: 'Revisione', de: 'Revision' },
  tagliando: { it: 'Tagliando', de: 'Inspektion' },
  carrozzeria: { it: 'Carrozzeria', de: 'Karosserie' },
  gomme: { it: 'Gomme', de: 'Reifen' },
  auto: { it: 'Auto in vendita', de: 'Fahrzeuge' },
};
