import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Workaround for Next.js Turbopack bug throwing 500 errors on HEAD requests
  if (process.env.NODE_ENV === 'development' && req.method === 'HEAD' && req.nextUrl.pathname.startsWith('/dashboard')) {
    return new NextResponse(null, { status: 200 });
  }

  const res = NextResponse.next();

  // Add Security Headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Add Request ID for tracing
  const requestId = crypto.randomUUID();
  res.headers.set('X-Request-ID', requestId);

  // Protect debug routes in production
  if (process.env.NODE_ENV === 'production') {
    if (req.nextUrl.pathname.startsWith('/api/debug-db')) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Not allowed in production' } }, { status: 403 });
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
