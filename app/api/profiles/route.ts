import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("telegram_chat_id, role")
    .eq("id", user.id)
    .single();

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  // Get the real User ID from the session for security
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  
  // Determine target user: Use ID from body (Admin editing employee) or default to session user (Settings)
  const targetId = body.id || user.id;

  // Fetch requester's profile to verify permissions
  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = requesterProfile?.role === "admin";

  // Security: If updating someone else OR updating a 'role', requester must be an admin
  if ((targetId !== user.id || body.role !== undefined) && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates: any = {};
  if (body.telegram_chat_id !== undefined) updates.telegram_chat_id = body.telegram_chat_id;
  if (body.role !== undefined) updates.role = body.role;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", targetId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// export async function PUT(request: Request) {
//   const supabase = await createClient();

//   const { id, role, telegram_chat_id } = await request.json();

//   const { data, error } = await supabase
//     .from("profiles")
//     .update({ role, telegram_chat_id })
//     .eq("id", id)
//     .select()
//     .single();

//   if (error)
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   return NextResponse.json(data);
// }