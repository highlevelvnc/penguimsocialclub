import { type NextRequest, NextResponse } from 'next/server'
import { defaultLocale, isValidLocale } from '@/lib/i18n/config'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Extract locale from first path segment
  const segments = pathname.split('/')
  const maybeLocale = segments[1]

  // If no valid locale prefix, redirect to default locale
  if (!isValidLocale(maybeLocale)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname}`
    return NextResponse.redirect(url)
  }

  // Set headers for downstream use
  const response = NextResponse.next()
  response.headers.set('x-locale', maybeLocale)
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
