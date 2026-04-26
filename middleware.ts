import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'; // Default token if not set in .env

export function middleware(request: NextRequest) {
  // Only apply to /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const urlToken = request.nextUrl.searchParams.get('token');
    const cookieToken = request.cookies.get('admin_token')?.value;

    // If token is provided in the URL and it matches, set a cookie and allow access
    if (urlToken === ADMIN_TOKEN) {
      const response = NextResponse.next();
      // Set a cookie that expires in 7 days
      response.cookies.set('admin_token', ADMIN_TOKEN, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'lax'
      });
      return response;
    }

    // If no valid URL token, check if they have a valid cookie
    if (cookieToken !== ADMIN_TOKEN) {
      // Not authenticated, redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
