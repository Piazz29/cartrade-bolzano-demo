// MAPPA UNICA DELLE FOTO DEL SITO.
// Ogni posizione ha un nome fisso. Per mettere una foto vera basta salvarla in src/assets/foto/ con quel nome
// (estensione .jpg, .jpeg, .png, .webp o .avif) e rifare il build: il componente Photo la usa al posto di Unsplash
// e Astro la ottimizza da solo (AVIF e WebP, dimensioni giuste per ogni schermo).
// Se il file non c'è, resta la foto segnaposto di Unsplash indicata qui.
// Elenco completo con l'inquadratura consigliata: README, sezione "Foto reali".

export interface PosizioneFoto {
  /** nome del file in src/assets/foto/, senza estensione */
  file: string;
  /** foto Unsplash usata finché manca quella vera (null = nessun segnaposto) */
  unsplash: string | null;
  /** punto di ritaglio per Unsplash (es. "focalpoint&fp-x=0.5&fp-y=0.55") */
  crop?: string;
  /** dove compare */
  dove: string;
  /** come scattarla */
  scatto: string;
  orientamento: 'orizzontale' | 'verticale' | 'quadrata';
}

export const FOTO = {
  hero: {
    file: 'hero',
    unsplash: '1771340012319-0b4fca008b54',
    crop: 'focalpoint&fp-x=0.5&fp-y=0.55',
    dove: 'Home, foto a tutto schermo',
    scatto: 'Officina con un’auto sul ponte sollevatore e un meccanico al lavoro, luce naturale. Soggetto al centro, un po’ sotto la metà: sopra resta spazio per il titolo. Almeno 2400 px di lato lungo.',
    orientamento: 'orizzontale',
  },
  'revisione-linea': {
    file: 'revisione-linea',
    unsplash: '1791419542289-693087bd1044',
    dove: 'Pagina Revisione (foto larga) e indice servizi della Home',
    scatto: 'La linea di revisione con un’auto sopra (banco freni o ponte), da dietro o di tre quarti. Inquadratura larga e bassa, niente persone in primo piano.',
    orientamento: 'orizzontale',
  },
  'officina-motore': {
    file: 'officina-motore',
    unsplash: '1615906655593-ad0386982a0f',
    dove: 'Pagina Officina e carrozzeria, in alto',
    scatto: 'Dettaglio delle mani del meccanico sul vano motore, con lampada o strumento di diagnosi. Ravvicinata, sfondo scuro e ordinato.',
    orientamento: 'orizzontale',
  },
  'officina-ponti': {
    file: 'officina-ponti',
    unsplash: '1767681092416-bccf9410bda4',
    dove: 'Pagina Officina (sezione Officina) e indice servizi della Home',
    scatto: 'Panoramica dell’officina con due o tre auto sui ponti, pavimento pulito, luci accese. Dall’ingresso, ad altezza occhi.',
    orientamento: 'orizzontale',
  },
  'officina-gomme': {
    file: 'officina-gomme',
    unsplash: '1645445522156-9ac06bc7a767',
    dove: 'Pagina Officina, sotto la foto dell’officina (solo computer)',
    scatto: 'Cambio gomme: mani con guanti che montano una ruota, o la smontagomme in uso. Ravvicinata.',
    orientamento: 'orizzontale',
  },
  carrozzeria: {
    file: 'carrozzeria',
    unsplash: null,
    dove: 'Pagina Officina (sezione Carrozzeria) e indice servizi della Home',
    scatto: 'Carrozziere al lavoro su una fiancata (lucidatura o preparazione), luce radente che mostra la superficie. Già presente: foto del cliente.',
    orientamento: 'orizzontale',
  },
  'carrozzeria-dettaglio': {
    file: 'carrozzeria-dettaglio',
    unsplash: '1786489785778-a163f38b7c87',
    dove: 'Pagina Officina, accanto alla carrozzeria (solo computer)',
    scatto: 'Dettaglio verticale: carteggiatura o mascheratura prima della verniciatura, oppure il forno di verniciatura.',
    orientamento: 'verticale',
  },
  sede: {
    file: 'sede',
    unsplash: null,
    dove: 'Pagina Azienda, foto in alto',
    scatto: 'La facciata con l’insegna, dal piazzale, con un po’ di cielo. Già presente (680 px): serve una versione ad almeno 2400 px.',
    orientamento: 'orizzontale',
  },
  'team-1': { file: 'team-1', unsplash: null, dove: 'Pagina Azienda, ritratto del titolare', scatto: 'Ritratto a mezzo busto in officina, sfondo sfocato, luce morbida. Stesso taglio per tutti e quattro.', orientamento: 'verticale' },
  'team-2': { file: 'team-2', unsplash: null, dove: 'Pagina Azienda, ritratto del responsabile tecnico', scatto: 'Come team-1, davanti alla linea di revisione.', orientamento: 'verticale' },
  'team-3': { file: 'team-3', unsplash: null, dove: 'Pagina Azienda, ritratto del capo officina', scatto: 'Come team-1, in officina.', orientamento: 'verticale' },
  'team-4': { file: 'team-4', unsplash: null, dove: 'Pagina Azienda, ritratto del carrozziere', scatto: 'Come team-1, in carrozzeria.', orientamento: 'verticale' },
} as const satisfies Record<string, PosizioneFoto>;

export type FotoKey = keyof typeof FOTO;
