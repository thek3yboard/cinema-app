import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function createAuthRedirect(url: URL) {
  const response = NextResponse.redirect(url);
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
  response.headers.set('Expires', '0');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export async function GET(request: NextRequest, { params }: { params: { locale: string } }) {
  const code = request.nextUrl.searchParams.get('code');
  const requestedNext = request.nextUrl.searchParams.get('next');
  const safeNext = requestedNext?.startsWith(`/${params.locale}/`) ? requestedNext : `/${params.locale}/movies`;
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = safeNext;
  redirectUrl.search = '';

  if (!code) {
    redirectUrl.pathname = `/${params.locale}/signin`;
    redirectUrl.searchParams.set('error', 'oauth_callback');
    return createAuthRedirect(redirectUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    redirectUrl.pathname = `/${params.locale}/signin`;
    redirectUrl.searchParams.set('error', 'oauth_callback');
  }

  return createAuthRedirect(redirectUrl);
}
