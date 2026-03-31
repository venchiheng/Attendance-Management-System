import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // --- EXCEPTIONS ---
  // Allow the ESP32 and API calls to bypass the login check
  if (url.pathname.startsWith('/api')) {
    return response;
  }

  // --- REDIRECT LOGIC ---

  // 1. If NOT logged in: Only allow access to /login
  if (!user && url.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If LOGGED IN: Don't let them go to /login or the root /
  // Replace '/dashboard' with whatever your main page is (e.g., /dashboard)
  if (user && (url.pathname === '/login' || url.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  // Matches all routes except static files and images
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}