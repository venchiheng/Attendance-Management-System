import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/app/lib/supabase/server";
import { get } from "http";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendInviteEmailThroughN8n({
  email,
  name,
  link,
}: {
  email: string;
  name: string;
  link: string;
}) {
  if (!process.env.N8N_WEBHOOK_URL) {
    throw new Error("N8N_WEBHOOK_URL is not defined");
  }

  const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-employee-email": email,
    },
    body: JSON.stringify([
      {
        email,
        name,
        link,
      },
    ]),
  });

  if (!n8nResponse.ok) {
    const errorText = await n8nResponse.text();
    throw new Error(`n8n responded with ${n8nResponse.status}: ${errorText}`);
  }
}

export async function GET() {
  const supabase = await createClient();

  const [empRes, deptRes, posRes, shiftRes] = await Promise.all([
    supabase
      .from("employees")
      .select(
        `
        *, 
        department:departments(name), 
        position:positions(name),
        profile:user_id(role)
      `
      )
      .order("created_at", { ascending: false }),
    supabase.from("departments").select("id, name"),
    supabase.from("positions").select("id, name"),
    supabase.from("shifts").select("id, shift_name"),
  ]);

  if (empRes.error) {
    return NextResponse.json({ error: empRes.error.message }, { status: 500 });
  }

  const employees = empRes.data.map((employee: any) => ({
    ...employee,
    department: employee.department?.name || "N/A",
    position: employee.position?.name || "N/A",
    role: employee.profile?.role,
  }));

  return NextResponse.json(
    {
      employees,
      metadata: {
        departments: deptRes.data || [],
        positions: posRes.data || [],
        shifts: shiftRes.data || [],
      },
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("employees")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = getAdminClient();
    const body = await request.json();

    const {
      id,
      role,
      department,
      position,
      profile,
      send_access_link,
      ...validEmployeeData
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // 1. Get current employee first
    const { data: existingEmployee, error: existingError } = await supabase
      .from("employees")
      .select("id, user_id, email, full_name")
      .eq("id", id)
      .single();

    if (existingError || !existingEmployee) {
      return NextResponse.json(
        { error: existingError?.message || "Employee not found" },
        { status: 404 }
      );
    }

    const oldEmail = existingEmployee.email;
    const newEmail = validEmployeeData.email;
    const emailChanged =
      typeof newEmail === "string" &&
      newEmail.trim() !== "" &&
      newEmail !== oldEmail;

    // 2. Update employees table
    const { data, error } = await supabase
      .from("employees")
      .update(validEmployeeData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 3. Always sync auth email if the email changed
    if (emailChanged) {
      const authUserId = existingEmployee.user_id || existingEmployee.id;

      const { error: authUpdateError } =
        await adminSupabase.auth.admin.updateUserById(authUserId, {
          email: newEmail,
          user_metadata: {
            fullname: validEmployeeData.full_name || existingEmployee.full_name,
            role: "employee",
          },
          email_confirm: true,
        });

      if (authUpdateError) {
        return NextResponse.json(
          { error: `Auth update failed: ${authUpdateError.message}` },
          { status: 400 }
        );
      }

      // Optional: also sync profiles table email if you store email there
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email: newEmail,
          fullname: validEmployeeData.full_name || existingEmployee.full_name,
        })
        .eq("id", authUserId);

      if (profileError) {
        return NextResponse.json(
          { error: `Profile update failed: ${profileError.message}` },
          { status: 400 }
        );
      }
    }

    // 4. Only send access link when explicitly requested
    if (send_access_link) {
      if (!process.env.N8N_WEBHOOK_URL) {
        return NextResponse.json(
          { error: "N8N_WEBHOOK_URL is not defined in environment variables" },
          { status: 500 }
        );
      }

      const emailToUse = validEmployeeData.email || existingEmployee.email;
      const nameToUse = validEmployeeData.full_name || existingEmployee.full_name;

      const { data: linkData, error: linkError } =
        await adminSupabase.auth.admin.generateLink({
          type: "recovery",
          email: emailToUse,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/setup-password`,
          },
        });

      if (linkError) {
        return NextResponse.json(
          { error: `Failed to generate access link: ${linkError.message}` },
          { status: 400 }
        );
      }

      const actionLink = linkData?.properties?.action_link;

      if (!actionLink) {
        return NextResponse.json(
          { error: "No action link returned from Supabase" },
          { status: 500 }
        );
      }

      await sendInviteEmailThroughN8n({
        email: emailToUse,
        name: nameToUse,
        link: actionLink,
      });
    }

    return NextResponse.json({
      success: true,
      data,
      email_updated: emailChanged,
      access_link_sent: !!send_access_link,
    });
  } catch (err: any) {
    console.error("PUT /api/employees error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
