import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("attendance_log")
      .select(`
        *,
        employees (
          full_name
        )
      `)
      .order("attendance_date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedData = data.map((item: any) => {
      const employeeInfo = Array.isArray(item.employees) ? item.employees[0] : item.employees;
      const fullName = employeeInfo?.full_name || "Unknown Employee";

      return {
        id: item.id,
        employee: fullName,
        date: item.attendance_date,
        checkIn: item.check_in_time
          ? new Date(item.check_in_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "---",
        checkOut: item.check_out_time
          ? new Date(item.check_out_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "---",
        workHours:
          item.worked_minutes > 0
            ? `${Math.floor(item.worked_minutes / 60)}h ${item.worked_minutes % 60}m`
            : "0m",
        status: item.is_late ? "Late" : item.attendance_status,
      };
    });

    return NextResponse.json(formattedData);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}