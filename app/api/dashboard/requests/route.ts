import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch data from Supabase
    const { data, error } = await supabase
      .from('employee_requests')
      .select(`
        id,
        request_type,
        status,
        start_date,
        end_date,
        created_at,
        employees (
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    // 2. Check for Supabase-specific errors
    if (error) {
      console.error("Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Transform the data for your InfoTable
    const formattedData = data.map((req: any) => ({
      id: req.id,
      name: req.employees?.full_name || "Unknown Employee",
      type: req.request_type,
      status: req.status,
      period: req.start_date ? `${req.start_date} to ${req.end_date || '?'}` : "N/A",
      created_at: new Date(req.created_at).toLocaleDateString(),
    }));

    return NextResponse.json(formattedData);

  } catch (err: any) {
    console.error("Server Crash:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}