import type { APIRoute } from 'astro';
import { chiudiSessione, stessaOrigine } from '../../../lib/server/security';

export const prerender = false;

export const POST: APIRoute = ({ request, cookies, redirect }) => {
  if (stessaOrigine(request)) chiudiSessione(cookies);
  return redirect('/admin/login/', 303);
};
