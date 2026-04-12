import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Hard stop if env vars are missing in production
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars in middleware", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    });
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { pathname } = request.nextUrl;

    // Public routes
    if (
      pathname === "/login" ||
      pathname === "/auth" ||
      pathname === "/setup-password" ||
      pathname.startsWith("/auth/confirm") ||
      pathname.startsWith("/api/auth")
    ) {
      return response;
    }

    // Refresh / validate auth cookies
    await supabase.auth.getClaims();

    return response;
  } catch (error) {
    console.error("Middleware auth error:", error);
    return NextResponse.next({
      request,
    });
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};