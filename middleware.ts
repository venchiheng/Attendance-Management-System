import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = request.nextUrl; // No need to clone unless you're modifying it
  const role =
    user?.app_metadata?.role || user?.user_metadata?.role || "employee";

  // Route Definitions
  const isAuthPage = url.pathname === "/login" || url.pathname === "/auth";
  const isSetupPage = url.pathname === "/setup-password";
  const isPublicApi = url.pathname.startsWith("/api/auth");
  const isInvite =
    url.hash.includes("type=invite") ||
    url.searchParams.get("type") === "invite";

  // 1. Let Public APIs through
  if (isPublicApi) return response;

  // 2. UNAUTHENTICATED Logic
  if (!user) {
    // Allow login, setup, or invite links
    if (isAuthPage || isSetupPage || isInvite) {
      return response;
    }
    // Everything else redirects to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. AUTHENTICATED Logic
  if (user) {
    // If they are on a "logged out" page (login/auth), send them to their dashboard
    if (isAuthPage && !isInvite) {
      const dest = role === "admin" ? "/dashboard" : "/my-dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Role-Based Access Control (RBAC)
    const adminRoutes = [
      "/employees",
      "/organization",
      "/reports",
      "/settings",
      "/dashboard",
      "/requests",
      "/attendance",
    ];
    const isTryingAdminRoute = adminRoutes.some((path) =>
      url.pathname.startsWith(path)
    );

    // If an employee tries to access an admin route, send them to THEIR dashboard
    if (isTryingAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/oops-unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
