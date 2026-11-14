// Sicurezza delle rotte /api: solo richieste dalla stessa origine e limite di richieste per IP
// (best effort, in memoria della singola istanza).

/** Richieste solo dalla stessa origine (niente invii da altri siti) */
export function stessaOrigine(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('sec-fetch-site') !== 'cross-site';
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

const finestre = new Map<string, number[]>();
/** max richieste per finestra (ms) per chiave (es. IP + rotta). Su Vercel vale per la singola istanza. */
export function troppeRichieste(chiave: string, max: number, finestraMs: number) {
  const ora = Date.now();
  const lista = (finestre.get(chiave) ?? []).filter((t) => ora - t < finestraMs);
  lista.push(ora);
  finestre.set(chiave, lista);
  if (finestre.size > 5000) finestre.clear();
  return lista.length > max;
}

export const ipDi = (request: Request, clientAddress?: string) =>
  request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress || 'ignoto';

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
