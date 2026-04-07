import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, full_name, nfc_id, department_id, position_id } = body; // Destructure all fields
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 1. Invite to Auth (This sends the email)
  const { data: authData, error: authError } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      data: { fullname: full_name, role: "employee" },
      redirectTo: `http://localhost:3000/setup-password`,
    });

  if (authError)
    return NextResponse.json({ error: authError.message }, { status: 400 });

  const { error: dbError } = await supabase.from("employees").insert({
    id: authData.user.id,
    email,
    full_name,
    nfc_id,
    department_id,
    position_id,
    employment_status: "active",
  });

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
