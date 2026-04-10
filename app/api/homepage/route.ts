import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = await createClient();

  // 2. Now you can use it
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  };

  // 1. Fetch Detailed Employee Info
  // Updated to match your schema: positions and departments
  const { data: employee, error: empError } = await supabase
    .from("employees")
    .select(
      `
      *,
      departments(name),
      positions(name)
    `
    )
    .eq("id", user.id) // Assuming auth.users.id maps to employees.id
    .single();

  if (empError || !employee) {
    return NextResponse.json(
      { error: "Employee profile not found" },
      { status: 404 }
    );
  }

  // 2. Date Calculations (Phnom Penh Context)
  // Get current time in Phnom Penh regardless of server location
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" }));
  
  const currentDay = now.getDay(); 
  // Logic to find the Monday of the current week
  const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Helper to get YYYY-MM-DD without UTC conversion shifting the day
  const toLocalDateString = (date: Date) => date.toLocaleDateString("en-CA");

  // 3. Weekly Attendance Logs
  const { data: weeklyLogs } = await supabase
    .from("attendance_log")
    .select(
      "attendance_date, check_in_time, check_out_time, worked_minutes, attendance_status"
    )
    .eq("employee_id", employee.id)
    .gte("attendance_date", toLocalDateString(startOfWeek));

  // 4. Monthly Summary Data
  const { data: monthlyLogs } = await supabase
    .from("attendance_log")
    .select("attendance_status")
    .eq("employee_id", employee.id)
    .gte("attendance_date", toLocalDateString(startOfMonth));

  const { data: approvedRequests } = await supabase
    .from("employee_requests")
    .select("request_type, start_date, end_date")
    .eq("employee_id", employee.id)
    .eq("status", "approved")
    .gte("start_date", toLocalDateString(startOfMonth));

  // 5. Recent 5 Requests
  const { data: recentRequests } = await supabase
    .from("employee_requests")
    .select("id, request_type, status, created_at")
    .eq("employee_id", employee.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // 6. Upcoming Leave (Next 7 Days)
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 14 );
  const { data: upcomingLeave } = await supabase
    .from("employee_requests")
    .select("id, request_type, start_date, end_date")
    .eq("employee_id", employee.id)
    .eq("status", "approved")
    .in("request_type", ["leave", "remote"])
    .gte("start_date", toLocalDateString(now))
    .lte("start_date", toLocalDateString(nextWeek))
    .limit(3);

  // Format response to match your UI needs
  return NextResponse.json({
    employee: {
      ...employee,
      department_name: employee.departments?.name || "N/A",
      position: employee.positions?.name || "N/A",
    },
    weeklyLogs:
      weeklyLogs?.map((log) => ({
        date: log.attendance_date,
        check_in_time: log.check_in_time
          ? new Date(log.check_in_time).toLocaleTimeString("en-US", {
              timeZone: "Asia/Phnom_Penh",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : null,
        check_out_time: log.check_out_time
          ? new Date(log.check_out_time).toLocaleTimeString("en-US", {
              timeZone: "Asia/Phnom_Penh",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : null,
        total_hours: log.worked_minutes
          ? (log.worked_minutes / 60).toFixed(1)
          : "0",
      })) || [],
    summary: {
      present:
        monthlyLogs?.filter((l) => l.attendance_status === "Present" || l.attendance_status === "Late").length ||
        0,
      leave:
        approvedRequests?.filter((r) => r.request_type === "leave").length || 0,
      remote:
        approvedRequests?.filter((r) => r.request_type === "remote").length ||
        0,
      totalWorkDays: 22, // Static or fetch from a settings table
    },
    recentRequests:
      recentRequests?.map((req) => ({
        id: req.id,
        type:
          req.request_type.charAt(0).toUpperCase() + req.request_type.slice(1),
        status: req.status,
        created_at: req.created_at,
      })) || [],
    upcomingLeave:
      upcomingLeave?.map((leave) => ({
        id: leave.id,
        type: leave.request_type,
        start_date: leave.start_date,
        duration_days: leave.end_date
          ? Math.ceil(
              (new Date(leave.end_date).getTime() -
                new Date(leave.start_date).getTime()) /
                (1000 * 3600 * 24)
            ) + 1
          : 1,
      })) || [],
    startOfWeek: startOfWeek.toISOString(),
  });
}
