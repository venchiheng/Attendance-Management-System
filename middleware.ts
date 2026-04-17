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

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

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

  const url = request.nextUrl;
  const role =
    user?.app_metadata?.role || user?.user_metadata?.role || "employee";

  const publicRoutes = [
    "/login",
    "/auth",
    "/forgot-password",
    "/setup-password",
    "/update-password",
  ];

  const isPublicRoute = publicRoutes.includes(url.pathname);
  const isPublicApi = url.pathname.startsWith("/api/auth");
  const isInvite = url.searchParams.get("type") === "invite";

  if (isPublicApi) return response;

  if (!user) {
    if (isPublicRoute || isInvite) {
      return response;
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  if ((url.pathname === "/login" || url.pathname === "/auth") && !isInvite) {
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
    url.pathname.startsWith(path)
  );

  if (isTryingAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/oops-unauthorized", request.url));
  }

  return response;
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
