// proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
              request,
            });

            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh auth cookies for SSR
    await supabase.auth.getClaims();

    const pathname = request.nextUrl.pathname;

    const isAuthPage = pathname === "/login" || pathname === "/auth";
    const isSetupPage = pathname === "/setup-password";
    const isPublicApi = pathname.startsWith("/api/auth");
    const isAuthConfirm = pathname.startsWith("/auth/confirm");

    if (isPublicApi || isAuthConfirm || isAuthPage || isSetupPage) {
      return response;
    }

    return response;
  } catch (error) {
    console.error("Proxy auth error:", error);
    return NextResponse.next({
      request,
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};