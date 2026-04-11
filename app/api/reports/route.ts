import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get('month'); // "YYYY-MM"
    if (!monthStr) return NextResponse.json({ error: "Month is required" }, { status: 400 });

    const supabase = await createClient();

    // Calculate start and end of month safely
    const currentYear = Number(monthStr.split('-')[0]);
    const currentMonth = Number(monthStr.split('-')[1]);
    const startDate = `${monthStr}-01`;
    const endDate = new Date(currentYear, currentMonth, 0)
                    .toISOString().split('T')[0];

    // Previous Month Range for Trend Calculation
    const prevMonthObj = new Date(currentYear, currentMonth - 2, 1);
    const prevStartDate = prevMonthObj.toISOString().split('T')[0].slice(0, 7) + "-01";
    const prevEndDate = new Date(currentYear, currentMonth - 1, 0)
                    .toISOString().split('T')[0];

    // 1. Fetch All Employees
    const { data: employees } = await supabase
      .from('employees')
      .select('id, full_name');

    // 2. Fetch Attendance Logs using GTE/LTE
    const { data: attendanceLogs } = await supabase
      .from('attendance_log')
      .select('*')
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate);

    // 3. Fetch Approved Requests overlapping this month
    const { data: requests } = await supabase
      .from('employee_requests')
      .select('employee_id, request_type, status, start_date, end_date')
      .eq('status', 'approved')
      .or(`start_date.gte.${startDate},end_date.lte.${endDate}`);

    // 4. Fetch Previous Month Logs for Trend
    const { data: prevLogs } = await supabase
      .from('attendance_log')
      .select('attendance_status')
      .gte('attendance_date', prevStartDate)
      .lte('attendance_date', prevEndDate);

    // --- AGGREGATION ---
    const totalAttendance = attendanceLogs?.filter(log => 
      ['Present', 'Late'].includes(log.attendance_status)
    ).length || 0;
    const totalWorkMinutes = attendanceLogs?.reduce((acc, curr) => acc + (curr.worked_minutes || 0), 0) || 0;
    const totalRemote = requests?.filter(r => r.request_type === 'remote').length || 0;
    const totalLeave = requests?.filter(r => ['leave', 'emergency'].includes(r.request_type)).length || 0;
    const totalCompleteDays = attendanceLogs?.filter(log => (log.worked_minutes || 0) > 480).length || 0;

    // Fixed Incomplete Logic: Log exists but worked less than 8 hours (480 mins) 
    const totalIncomplete = attendanceLogs?.filter(log =>
      ['Present', 'Late'].includes(log.attendance_status) && log.worked_minutes < 480
    ).length || 0;

    // Calculate Current and Previous Month Averages
    const avgAttendance = totalAttendance > 0 
      ? Math.round((totalAttendance / (employees?.length || 1) / 22) * 100) 
      : 0;

    const prevAttendanceCount = prevLogs?.filter(log => 
      ['Present', 'Late'].includes(log.attendance_status)
    ).length || 0;
    const prevAvgAttendance = prevAttendanceCount > 0 
      ? Math.round((prevAttendanceCount / (employees?.length || 1) / 22) * 100) 
      : 0;

    const tableData = employees?.map(emp => {
      const empLogs = attendanceLogs?.filter(log => log.employee_id === emp.id) || [];
      const empRequests = requests?.filter(req => req.employee_id === emp.id) || [];

      const presentCount = empLogs.filter(l => (['Present', 'Late'].includes(l.attendance_status))).length;
      const remoteCount = empRequests.filter(r => r.request_type === 'remote').length;
      const leaveCount = empRequests.filter(r => ['leave', 'emergency'].includes(r.request_type)).length;
      
      const incompleteCount = empLogs.filter(l => (['Present', 'Late'].includes(l.attendance_status)) && (l.worked_minutes < 480)).length;
      const empMinutes = empLogs.reduce((acc, curr) => acc + (curr.worked_minutes || 0), 0);
      const rate = Math.min(Math.round(((presentCount + remoteCount) / 22) * 100), 100);

      return {
        employee: emp.full_name,
        present: presentCount,
        remote: remoteCount,
        leave: leaveCount,
        incomplete: incompleteCount,
        totalHours: `${Math.round(empMinutes / 60)}h`,
        rate: `${rate}%`
      };
    }) || [];

    return NextResponse.json({
      summary: {
        totalAttendance,
        avgAttendance,
        trend: avgAttendance - prevAvgAttendance,
        totalWorkHours: `${Math.round(totalWorkMinutes / 60)}h`,
        totalCompleteDays,
        totalRemote,
        totalLeave,
        totalIncomplete
      },
      tableData
    });

  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}