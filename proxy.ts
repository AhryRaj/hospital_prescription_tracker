import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Auth pages are public (no token needed)
const publicRoutes = ['/auth/login', '/auth/register', '/auth/verify-email', '/auth/verify-pending', '/auth/forgot-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public auth routes
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Read JWT from cookie
  const token = request.cookies.get('auth_token')?.value
  const session = token ? await verifyToken(token) : null

  // If not authenticated and trying to access protected routes → redirect to login
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If authenticated and trying to access auth pages → redirect to home
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Exclude API routes, static assets, and Next.js internals
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
