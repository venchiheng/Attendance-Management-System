import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: logs, error: logsError } = await supabase
      .from("attendance_log")
      .select(
        `
        *,
        employees (
          full_name
        )
      `
      )
      .order("attendance_date", { ascending: false });

    if (logsError) {
      return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    const logIds = (logs || []).map((item: any) => item.id);

    const { data: sessions, error: sessionsError } = await supabase
      .from("attendance_sessions")
      .select("id, log_id, check_in, check_out, session_minutes")
      .in("log_id", logIds)
      .order("check_in", { ascending: true });

    if (sessionsError) {
      return NextResponse.json(
        { error: sessionsError.message },
        { status: 500 }
      );
    }

    const formatTime = (value: string | null) => {
      if (!value) return "---";

      return new Date(value).toLocaleTimeString("en-US", {
        timeZone: "Asia/Phnom_Penh",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    const sessionsByLogId = (sessions || []).reduce(
      (acc: any, session: any) => {
        if (!acc[session.log_id]) acc[session.log_id] = [];
        acc[session.log_id].push(session);
        return acc;
      },
      {}
    );

    const formattedData = (logs || []).map((item: any) => {
      const employeeInfo = Array.isArray(item.employees)
        ? item.employees[0]
        : item.employees;

      const fullName = employeeInfo?.full_name || "Unknown Employee";
      const relatedSessions = (sessionsByLogId[item.id] || []).map(
        (session: any, index: number) => ({
          id: session.id,
          tapNumber: index + 1,
          checkIn: formatTime(session.check_in),
          checkOut: formatTime(session.check_out),
          duration:
            session.session_minutes && session.session_minutes > 0
              ? `${Math.floor(session.session_minutes / 60)}h ${
                  session.session_minutes % 60
                }m`
              : session.check_out
              ? "0m"
              : "Open Session",
          rawCheckIn: session.check_in,
          rawCheckOut: session.check_out,
          rawMinutes: session.session_minutes ?? 0,
        })
      );

      return {
        id: item.id,
        employee: fullName,
        date: item.attendance_date,
        checkIn: formatTime(item.check_in_time),
        checkOut: formatTime(item.check_out_time),
        workHours:
          item.worked_minutes > 0
            ? `${Math.floor(item.worked_minutes / 60)}h ${
                item.worked_minutes % 60
              }m`
            : "0m",
        workedMinutes: item.worked_minutes || 0,
        status: item.is_late ? "Late" : item.attendance_status,
        tapCount: relatedSessions.length,
        sessions: relatedSessions,
      };
    });

    return NextResponse.json(formattedData);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
