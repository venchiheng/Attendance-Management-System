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
  }

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
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" })
  );

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

  const formatTime = (value: string | null) => {
    if (!value) return null;

    return new Date(value).toLocaleTimeString("en-US", {
      timeZone: "Asia/Phnom_Penh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // 3. Weekly Attendance Logs
  const { data: weeklyLogs } = await supabase
    .from("attendance_log")
    .select(
      `
    id,
    attendance_date,
    worked_minutes,
    check_in_time,
    check_out_time,
    attendance_status,
    attendance_sessions (
      id,
      check_in,
      check_out,
      session_minutes
    )
  `
    )
    .eq("employee_id", employee.id)
    .gte("attendance_date", toLocalDateString(startOfWeek))
    .order("attendance_date", { ascending: true });

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
  nextWeek.setDate(now.getDate() + 14);
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
      weeklyLogs?.map((log: any) => {
        const sessions = [...(log.attendance_sessions || [])].sort(
          (a: any, b: any) =>
            new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
        );

        const mostRecentSession = sessions[0] || null;

        return {
          id: log.id,
          date: log.attendance_date,
          first_check_in: log.check_in_time
            ? formatTime(log.check_in_time)
            : null,
          last_check_out: log.check_out_time
            ? formatTime(log.check_out_time)
            : null,
          check_in_time: mostRecentSession?.check_in
            ? formatTime(mostRecentSession.check_in)
            : null,
          check_out_time: mostRecentSession?.check_out
            ? formatTime(mostRecentSession.check_out)
            : null,
          total_hours: log.worked_minutes
            ? (log.worked_minutes / 60).toFixed(1)
            : "0",
          worked_minutes: log.worked_minutes || 0,
          attendance_status: log.attendance_status,
          attendance_sessions: sessions.map((session: any) => ({
            id: session.id,
            check_in: session.check_in,
            check_out: session.check_out,
            session_minutes: session.session_minutes || 0,
          })),
        };
      }) || [],
    summary: {
      present:
        monthlyLogs?.filter(
          (l) =>
            l.attendance_status === "Present" || l.attendance_status === "Late"
        ).length || 0,
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
