// 45 clienti di ESEMPIO dell'area di Bolzano, per mostrare l'admin già "pieno".
// Generati in modo deterministico (stesso seme, stessi clienti) con date relative a oggi:
// le scadenze vicine restano vicine qualunque giorno si faccia la demo.
// Email @example.com e numeri +39 000…: dati finti, nessun invio reale parte mai verso di loro.
import { addDays, addMonths, calcolaScadenza, isoDate, lastDayOfMonth } from '../revisione';
import type { Canale, Cliente, Evento, Interesse, Lingua } from './types';

const PERSONE: [string, string, Lingua][] = [
  ['Marco', 'Rossi', 'it'], ['Giulia', 'Ferrari', 'it'], ['Thomas', 'Gruber', 'de'], ['Andrea', 'Bianchi', 'it'],
  ['Maria', 'Pichler', 'de'], ['Luca', 'Moretti', 'it'], ['Stefan', 'Mair', 'de'], ['Francesca', 'Gallo', 'it'],
  ['Elisabeth', 'Kofler', 'de'], ['Matteo', 'Conti', 'it'], ['Andreas', 'Hofer', 'de'], ['Sara', 'De Luca', 'it'],
  ['Julia', 'Oberhofer', 'de'], ['Paolo', 'Ricci', 'it'], ['Markus', 'Kerschbaumer', 'de'], ['Elena', 'Marino', 'it'],
  ['Sabine', 'Thaler', 'de'], ['Davide', 'Greco', 'it'], ['Florian', 'Gasser', 'de'], ['Chiara', 'Bruno', 'it'],
  ['Katharina', 'Plattner', 'de'], ['Simone', 'Costa', 'it'], ['Martin', 'Unterhofer', 'de'], ['Valentina', 'Fontana', 'it'],
  ['Verena', 'Pircher', 'de'], ['Alessandro', 'Rizzo', 'it'], ['Lukas', 'Ladurner', 'de'], ['Martina', 'Lombardi', 'it'],
  ['Monika', 'Egger', 'de'], ['Stefano', 'Colombo', 'it'], ['Hannes', 'Mayr', 'de'], ['Federica', 'Mancini', 'it'],
  ['Barbara', 'Rainer', 'de'], ['Roberto', 'Barbieri', 'it'], ['Manuel', 'Obkircher', 'de'], ['Anna', 'Caruso', 'it'],
  ['Petra', 'Rabensteiner', 'de'], ['Giorgio', 'Pellegrini', 'it'], ['Daniel', 'Steiner', 'de'], ['Silvia', 'Ferraro', 'it'],
  ['Claudia', 'Haller', 'de'], ['Michele', 'Testa', 'it'], ['Patrick', 'Kaserer', 'de'], ['Ingrid', 'Hölzl', 'de'],
  ['Michael', 'Pföstl', 'de'],
];

// Mese della scadenza rispetto a oggi (0 = fine di questo mese): tante scadenze vicine da mostrare
const OFFSET_SCADENZA = [-1, -1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LETTERE = 'ABCDEFGHJKLMNPRSTVWXYZ'; // le targhe italiane non usano I, O, Q, U
const slug = (s: string) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/[^a-z]/g, '');

export function generaEsempi(oggi = new Date()): { clienti: Cliente[]; eventi: Evento[] } {
  const rnd = mulberry32(20261105);
  const pick = <T,>(a: ArrayLike<T>): T => a[Math.floor(rnd() * a.length)];
  const clienti: Cliente[] = [];
  const eventi: Evento[] = [];
  let ev = 0;
  const evento = (e: Omit<Evento, 'id'>) => eventi.push({ id: `es-ev-${++ev}`, ...e });
  const at = (d: Date, h = 10) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, Math.floor(rnd() * 60)).toISOString();

  PERSONE.forEach(([nome, cognome, linguaMadre], i) => {
    const id = `es-${String(i + 1).padStart(2, '0')}`;
    // Scadenza: fine del mese obiettivo. Ricaviamo l'ultima revisione (2 anni prima, stesso mese).
    const target = new Date(oggi.getFullYear(), oggi.getMonth() + OFFSET_SCADENZA[i], 1);
    const usaImmatricolazione = i % 9 === 4;
    const rif_tipo = usaImmatricolazione ? 'reg' : 'rev';
    const rif = new Date(target.getFullYear() - (usaImmatricolazione ? 4 : 2), target.getMonth(), 1);
    const scad = calcolaScadenza(rif_tipo, rif.getMonth() + 1, rif.getFullYear(), oggi).date;

    // Iscrizione: negli ultimi 8 mesi, 6 clienti in questo mese
    const creato = i % 8 === 3 ? new Date(oggi.getFullYear(), oggi.getMonth(), Math.max(1, oggi.getDate() - Math.floor(rnd() * 4))) : addDays(oggi, -Math.floor(20 + rnd() * 220));
    const interessi = new Set<Interesse>(['revisione']);
    if (rnd() < 0.55) interessi.add('tagliando');
    if (rnd() < 0.5) interessi.add('gomme');
    if (rnd() < 0.22) interessi.add('carrozzeria');
    rnd(); // posto dell'ex interesse "auto": mantiene uguali i clienti di esempio
    const canale: Canale = rnd() < 0.7 ? 'email' : 'whatsapp';
    const lingua: Lingua = linguaMadre === 'de' && rnd() < 0.15 ? 'it' : linguaMadre;
    const tagliando = rnd() < 0.6 ? isoDate(addDays(oggi, -Math.floor(150 + rnd() * 260))) : null;

    const c: Cliente = {
      id,
      creato_il: at(creato, 9 + (i % 8)),
      nome,
      cognome,
      email: `${slug(nome)}.${slug(cognome)}@example.com`,
      telefono: `+39000000${String(1000 + i * 37).slice(-4)}`,
      targa: `${pick(['D', 'E', 'F', 'G', 'G', 'H'])}${pick(LETTERE)}${String(Math.floor(rnd() * 1000)).padStart(3, '0')}${pick(LETTERE)}${pick(LETTERE)}`,
      rif_tipo,
      rif_mese: rif.getMonth() + 1,
      rif_anno: rif.getFullYear(),
      scadenza: isoDate(scad),
      ultimo_tagliando: tagliando,
      interessi: [...interessi],
      canale,
      lingua,
      consenso_privacy_il: at(creato, 9),
      consenso_promemoria: i % 15 !== 7,
      consenso_offerte: i % 4 !== 1 && i % 7 !== 5,
      origine: i % 3 === 0 ? 'qr' : 'sito',
      esempio: true,
    };
    clienti.push(c);

    evento({ cliente_id: id, tipo: 'iscrizione', canale: 'sistema', esito: 'registrato', dettagli: { origine: c.origine }, creato_il: c.creato_il });
    evento({ cliente_id: id, tipo: 'benvenuto', canale: 'email', esito: 'simulato', dettagli: {}, creato_il: c.creato_il });

    // Promemoria a 30 giorni già partiti per chi è entro il mese
    const g30 = addDays(scad, -30);
    if (g30 < oggi && scad >= addDays(oggi, -40) && c.consenso_promemoria && new Date(c.creato_il) < g30) {
      evento({ cliente_id: id, tipo: 'promemoria', canale, esito: 'simulato', dettagli: { chiave: `revisione:${c.scadenza}:30`, regola: 'revisione', giorni: 30 }, creato_il: at(g30, 8) });
    }
    // Visite in officina
    if (tagliando) {
      evento({ cliente_id: id, tipo: 'visita', canale: 'sistema', esito: 'registrato', dettagli: { motivo: 'tagliando' }, creato_il: at(new Date(tagliando), 11) });
    }
    if (OFFSET_SCADENZA[i] >= 20) {
      const rev = addMonths(scad, -24);
      evento({ cliente_id: id, tipo: 'visita', canale: 'sistema', esito: 'registrato', dettagli: { motivo: 'revisione' }, creato_il: at(lastDayOfMonth(rev.getFullYear(), rev.getMonth() + 1), 9) });
    }
    // Recensioni: 12 richieste, 7 ottenute
    if (i % 4 === 2 || i === 9 || i === 31) {
      const quando = addDays(oggi, -Math.floor(5 + rnd() * 120));
      evento({ cliente_id: id, tipo: 'recensione_richiesta', canale, esito: 'simulato', dettagli: {}, creato_il: at(quando, 17) });
      if (i % 8 === 2 || i === 9 || i === 31) {
        evento({ cliente_id: id, tipo: 'recensione_ottenuta', canale: 'sistema', esito: 'registrato', dettagli: {}, creato_il: at(addDays(quando, 1 + Math.floor(rnd() * 3)), 20) });
      }
    }
  });

  // Una campagna già inviata in primavera, per lo storico
  const aprile = new Date(oggi.getFullYear() - (oggi.getMonth() < 4 ? 1 : 0), 3, 14);
  const destinatari = clienti.filter((c) => c.consenso_offerte && new Date(c.creato_il) < aprile);
  const esclusi = clienti.filter((c) => !c.consenso_offerte && new Date(c.creato_il) < aprile).length;
  const idCampagna = 'es-camp-clima';
  destinatari.forEach((c) =>
    evento({ cliente_id: c.id, tipo: 'campagna', canale: c.canale, esito: 'simulato', dettagli: { campagna: idCampagna, modello: 'clima-primavera' }, creato_il: at(aprile, 9) }),
  );
  evento({
    cliente_id: null,
    tipo: 'campagna_invio',
    canale: 'sistema',
    esito: 'simulato',
    dettagli: { campagna: idCampagna, modello: 'clima-primavera', titolo: 'Climatizzatore in primavera', destinatari: destinatari.length, inviati: 0, simulati: destinatari.length, esclusi, errori: 0 },
    creato_il: at(aprile, 9),
  });

  return { clienti, eventi };
}
