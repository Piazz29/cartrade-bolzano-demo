// Controlli comuni alle rotte /api/admin/*: sessione valida e richiesta dalla stessa origine.
import type { APIContext } from 'astro';
import { json, sessioneValida, stessaOrigine } from './security';

export function soloAdmin(ctx: APIContext): Response | null {
  if (!sessioneValida(ctx.cookies)) return json({ ok: false, error: 'non_autorizzato' }, 401);
  if (ctx.request.method !== 'GET' && !stessaOrigine(ctx.request)) return json({ ok: false, error: 'origine' }, 403);
  return null;
}

export async function leggiJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    const t = await request.text();
    if (t.length > 20_000) return null;
    return JSON.parse(t) as T;
  } catch {
    return null;
  }
}

export const baseUrlDi = (request: Request) => new URL(request.url).origin;
