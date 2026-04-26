import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Phnom_Penh",
  });

  try {
    // 1. Total Employees
    const { count: totalEmployees, error: empError } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("employment_status", "active");

    // 2. Total Checked In Today
    const { count: checkedIn, error: checkInError } = await supabase
      .from("attendance_log")
      .select("*", { count: "exact", head: true })
      .eq("attendance_date", today);

    // 3. Total Leave Today
    const { count: totalLeave, error: leaveError } = await supabase
      .from("attendance_log")
      .select("*", { count: "exact", head: true })
      .eq("attendance_date", today)
      .eq("attendance_status", "On leave");

    // 4. Calculate Checked Out
    const { count: totalRemote, error: remoteError } = await supabase
      .from("attendance_log")
      .select("*", { count: "exact", head: true })
      .eq("attendance_date", today)
      .eq("attendance_status", "Remote");

    const { count: totalAbsent, error: absentError } = await supabase
      .from("attendance_log")
      .select("*", { count: "exact", head: true })
      .eq("attendance_date", today)
      .eq("attendance_status", "Absent");

    if (empError || checkInError || leaveError || remoteError || absentError) {
      throw new Error("Failed to fetch counts");
    }

    return NextResponse.json({
      totalEmployees: totalEmployees || 0,
      checkedIn: checkedIn || 0,
      totalLeave: totalLeave || 0,
      totalRemote: totalRemote || 0,
      totalAbsent: totalAbsent || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
