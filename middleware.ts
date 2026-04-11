import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables in middleware");
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const role =
      user?.app_metadata?.role || user?.user_metadata?.role || "employee";

    const isAuthPage = pathname === "/login" || pathname === "/auth";
    const isSetupPage = pathname === "/setup-password";
    const isPublicApi = pathname.startsWith("/api/auth");

    // URL fragments (#...) are not reliably available to middleware/server
    const isInvite = request.nextUrl.searchParams.get("type") === "invite";

    if (isPublicApi) return response;

    if (!user) {
      if (isAuthPage || isSetupPage || isInvite) {
        return response;
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthPage && !isInvite) {
      const dest = role === "admin" ? "/dashboard" : "/my-dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }

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
      pathname.startsWith(path)
    );

    if (isTryingAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/oops-unauthorized", request.url));
    }

    return response;
  } catch (error) {
    console.error("Middleware auth error:", error);

    // Never crash middleware at the edge
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff|woff2)$).*)",
  ],
};