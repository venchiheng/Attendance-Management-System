import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    // 1. Get the authenticated user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch employee details joined with departments and positions
    const { data: employee, error: dbError } = await supabase
      .from("employees")
      .select(
        `
        *,
        positions (
          name
        ),
        departments (
          name
        ),
        profiles (
          pfp_url
        )
      `
      )
      .eq("id", user.id)
      .single();

    if (dbError) {
      console.error("Database Error:", dbError.message);
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("Global API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
