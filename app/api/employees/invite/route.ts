import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      full_name,
      phone_number,
      nfc_id,
      department_id,
      position_id,
      shift_id,
      hire_date,
      work_mode,
      employment_type,
      employment_status,
    } = body;
    const cookieStore = await cookies();

    // Debugging: Check if URL exists
    if (!process.env.N8N_WEBHOOK_URL) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_URL is not defined in environment variables" },
        { status: 500 }
      );
    }

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

    // 1. Generate Invitation Link
    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.generateLink({
        type: "invite",
        email: email,
        options: {
          data: { fullname: full_name, role: "employee" },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/setup-password`,
        },
      });

    if (inviteError) {
      console.error("Supabase Auth Error:", inviteError.message);
      return NextResponse.json(
        { error: `Auth Error: ${inviteError.message}` },
        { status: 400 }
      );
    }

    const invitationLink = inviteData.properties.action_link;

    // 2. Trigger n8n (ADDED AWAIT HERE)
    try {
      const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-employee-email": email,
        },
        // We wrap the object in [ ] because the example shows an array
        body: JSON.stringify([
          {
            email: email,
            name: full_name,
            link: invitationLink,
          },
        ]),
      });

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        throw new Error(
          `n8n responded with ${n8nResponse.status}: ${errorText}`
        );
      }
    } catch (err: any) {
      console.error("Email trigger error:", err);
      return NextResponse.json(
        { error: `Email Service Error: ${err.message}` },
        { status: 500 }
      );
    }

    // 3. Database Insert
    const { error: dbError } = await supabase.from("employees").insert({
      id: inviteData.user.id,
      email,
      full_name,
      phone_number,
      nfc_id,
      department_id,
      position_id,
      shift_id,
      hire_date,
      work_mode,
      employment_type,
      employment_status: employment_status || "active",
    });

    if (dbError) {
      console.error("DB Error:", dbError.message);
      return NextResponse.json(
        { error: `Database Error: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (globalError: any) {
    console.error("Global API Error:", globalError);
    return NextResponse.json({ error: globalError.message }, { status: 500 });
  }
}
