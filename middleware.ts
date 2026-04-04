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
  const role = user?.user_metadata?.role || 'employee'

  // 1. PUBLIC ROUTES (Allow these to always pass)
  const isAuthPage = url.pathname === '/login' || url.pathname === '/auth';
  const isPublicApi = url.pathname === '/api/auth/login';

  if (isPublicApi) return response;

  // 2. UNAUTHENTICATED USERS
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. AUTHENTICATED USERS
  if (user) {
    // Prevent logged-in users from going back to login
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // ADMIN-ONLY ROUTE PROTECTION
    const adminRoutes = ['/employees', '/organization', '/reports'];
    const isTryingAdminRoute = adminRoutes.some(path => url.pathname.startsWith(path));

    if (isTryingAdminRoute && role !== 'admin') {
      // Redirect unauthorized employees to their specific dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  // Matches all routes except static files and images
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}