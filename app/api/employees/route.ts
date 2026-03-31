import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  const [empRes, deptRes, posRes, shiftRes] = await Promise.all([
    supabase
      .from("employees")
      .select(`*, department:departments(name), position:positions(name)`)
      .order("created_at", { ascending: false }),
    supabase.from("departments").select("id, name"),
    supabase.from("positions").select("id, name"),
    supabase.from("shifts").select("id, shift_name")
  ]);

  if (empRes.error) return NextResponse.json({ error: empRes.error.message }, { status: 500 });

  const employees = empRes.data.map((employee: any) => ({
    ...employee,
    department: employee.department?.name || "N/A",
    position: employee.position?.name || "N/A",
  }));

  return NextResponse.json({
    employees,
    metadata: {
      departments: deptRes.data || [],
      positions: posRes.data || [],
      shifts: shiftRes.data || []
    }
  }, { status: 200 });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { data, error } = await supabase.from("employees").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { id, department, position, ...updates } = await request.json(); // Remove joined strings
  const { data, error } = await supabase.from("employees").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}