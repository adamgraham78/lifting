import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()

  // Helper to create redirect with cookies preserved
  const redirectWithCookies = (url: string) => {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url))
    // Copy all cookies from supabaseResponse to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!data.user) {
      return redirectWithCookies('/auth/login')
    }
  }

  // Protect /settings routes
  if (request.nextUrl.pathname.startsWith('/settings')) {
    if (!data.user) {
      return redirectWithCookies('/auth/login')
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth') && data.user) {
    return redirectWithCookies('/dashboard')
  }

  // Redirect unauthenticated users from root to login
  if (request.nextUrl.pathname === '/' && !data.user) {
    return redirectWithCookies('/auth/login')
  }

  // Redirect authenticated users from root to dashboard
  if (request.nextUrl.pathname === '/' && data.user) {
    return redirectWithCookies('/dashboard')
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/', '/auth/:path*', '/dashboard/:path*', '/settings/:path*'],
}
