import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { status, note } = await request.json();

    // 1. Get the Admin's user object
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Update with the required "Review" fields
    const { error } = await supabase
      .from('employee_requests')
      .update({ 
        status: status,
        reviewed_by: user.id,          // The "Who"
        reviewed_at: new Date().toISOString(), // The "When"
        reviewed_note: note || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      // If the constraint still fails, it might need 'reviewed_note'
      console.error("Database Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}