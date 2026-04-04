import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get('month'); // "YYYY-MM"
    if (!monthStr) return NextResponse.json({ error: "Month is required" }, { status: 400 });

    const supabase = await createClient();

    // Calculate start and end of month safely
    const startDate = `${monthStr}-01`;
    const endDate = new Date(Number(monthStr.split('-')[0]), Number(monthStr.split('-')[1]), 0)
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

    // --- AGGREGATION ---
    const totalAttendance = attendanceLogs?.length || 0;
    const totalWorkMinutes = attendanceLogs?.reduce((acc, curr) => acc + (curr.worked_minutes || 0), 0) || 0;
    const totalRemote = requests?.filter(r => r.request_type === 'remote').length || 0;
    const totalLeave = requests?.filter(r => ['leave', 'emergency'].includes(r.request_type)).length || 0;

    // Fixed Incomplete Logic: Log exists but worked less than 8 hours (480 mins) 
    const totalIncomplete = attendanceLogs?.filter(log => 
      !log.check_out_time || (log.worked_minutes && log.worked_minutes < 480)
    ).length || 0;

    const tableData = employees?.map(emp => {
      const empLogs = attendanceLogs?.filter(log => log.employee_id === emp.id) || [];
      const empRequests = requests?.filter(req => req.employee_id === emp.id) || [];

      const presentCount = empLogs.filter(l => l.attendance_status === 'Present' || l.attendance_status === 'Late').length;
      const remoteCount = empRequests.filter(r => r.request_type === 'remote').length;
      const leaveCount = empRequests.filter(r => ['leave', 'emergency'].includes(r.request_type)).length;
      
      const incompleteCount = empLogs.filter(l => !l.check_out_time || (l.worked_minutes < 480)).length;
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
        avgAttendance: totalAttendance > 0 ? Math.round((totalAttendance / (employees?.length || 1) / 22) * 100) : 0,
        trend: -3,
        totalWorkHours: `${Math.round(totalWorkMinutes / 60)}h`,
        totalCompleteDays: attendanceLogs?.filter(l => l.attendance_status === 'Present' && l.check_out_time).length || 0,
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