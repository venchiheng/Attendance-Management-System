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

    // 2. Fetch the existing request to check ownership
    const { data: existingRequest, error: fetchError } = await supabase
      .from("employee_requests")
      .select("employee_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // 3. Ownership check: If the user is the requester (Employee)
    const isOwner = existingRequest.employee_id === user.id;

    if (isOwner) {
      // Employees are restricted: only "cancel" is allowed
      const normalizedStatus = status?.toLowerCase();
      if (normalizedStatus !== "cancelled" && normalizedStatus !== "cancel") {
        return NextResponse.json(
          { error: "Employees are only permitted to cancel their own requests." },
          { status: 403 }
        );
      }

      const { error } = await supabase
        .from("employee_requests")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Database Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: "Request successfully cancelled" });
    }

    // 4. Administrator logic: Update with the required "Review" fields
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