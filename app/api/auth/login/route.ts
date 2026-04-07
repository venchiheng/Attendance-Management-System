import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              /* Handled by middleware */
            }
          },
        },
      }
    );

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError)
      return NextResponse.json({ error: authError.message }, { status: 401 });

    // 2. Fetch Authorization Role from 'profiles'
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, fullname")
      .eq("id", authData.user.id)
      .single();

    if (profile) {
      await supabase.auth.updateUser({
        data: {
          role: profile.role,
          full_name: profile.fullname,
        },
      });
    }

    // 3. Response with Role-Based context
    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile?.role || "employee",
          name: profile?.fullname || "User",
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
