import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { isSupabaseConfigured } from './lib/supabase/config';
import { updateSession } from './lib/supabase/middleware';
 
const intlMiddleware = createMiddleware(routing);

const protectedPath = /^\/(en-US|es-ES|es-MX)\/(movies|shows|people|onscreentogether|search)(?:\/.*)?$/;

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request) as NextResponse;

  // The project remains usable until its Supabase variables are configured locally.
  if (!isSupabaseConfigured) return response;

  const user = await updateSession(request, response);
  if (!user && protectedPath.test(request.nextUrl.pathname)) {
    const locale = request.nextUrl.pathname.split('/')[1] || routing.defaultLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/signin`;
    redirectUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
 
export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(en-US|es-ES|es-MX)/:path*']
};
