import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD

  try {
    // 1. Total Employees
    const { count: totalEmployees, error: empError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employment_status', 'active');

    // 2. Total Checked In Today
    const { count: checkedIn, error: checkInError } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today);

    // 3. Total Late Today
    const { count: totalLate, error: lateError } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'late');

    // 4. Calculate Checked Out (logic depends on your schema, 
    const { count: checkedOut, error: checkOutError } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .not('check_out_time', 'is', null);

    if (empError || checkInError || lateError || checkOutError) {
        throw new Error("Failed to fetch counts");
    }

    return NextResponse.json({
      totalEmployees: totalEmployees || 0,
      checkedIn: checkedIn || 0,
      checkedOut: checkedOut || 0,
      totalLate: totalLate || 0,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}