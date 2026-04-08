import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch data from Supabase
    const { data, error } = await supabase
      .from("employee_requests")
      .select(
        `
        id,
        request_type,
        status,
        start_date,
        end_date,
        reason,
        reviewed_note,
        reviewed_by,
        reviewed_at,
        created_at,
        employees (
          full_name
        ),
        profiles:reviewed_by (
      fullname
    )
      `
      )
      .order("created_at", { ascending: false });

    // 2. Check for Supabase-specific errors
    if (error) {
      console.error("Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    function capitalizeFirstLetter(str: string): string {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // 3. Transform the data for your InfoTable
    const formattedData = data.map((req: any) => ({
      id: req.id,
      name: req.employees?.full_name || "Unknown",
      title: `${capitalizeFirstLetter(req.request_type)} Request`,
      type: capitalizeFirstLetter(req.request_type || "Unknown"),
      status: capitalizeFirstLetter(req.status),
      start_date: req.start_date || "---",
      end_date: req.end_date || "---",
      period:
        req.start_date && req.end_date
          ? `${req.start_date} to ${req.end_date}`
          : `${req.start_date || "---"}`,
      duration:
        req.start_date && req.end_date
          ? `${
              Math.ceil(
                (new Date(req.end_date).getTime() -
                  new Date(req.start_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              ) + 1
            } days`
          : "---",
      submitAt: new Date(req.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      reason: req.reason || "No reason provided",
      note: req.reviewed_note || "",
      reviewBy: req.profiles?.fullname || "---",
      reviewAt: req.reviewed_at
        ? new Date(req.reviewed_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "",
    }));

    return NextResponse.json(formattedData);
  } catch (err: any) {
    console.error("Server Crash:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestType, leaveType, startDate, endDate, description } = body;

    const insertData = {
      employee_id: user.id,
      request_type: requestType,
      status: "pending",
      reason: description,
      start_date: startDate || null,
      end_date: endDate || null,
      request_data: {
        leave_type: leaveType || null,
      },
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from("employee_requests")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Database Insert Error:", error.message);
      
      if (error.code === "23514") {
        return NextResponse.json(
          { error: "Validation failed: Check dates and request requirements." },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5. Success response
    return NextResponse.json(
      { message: "Request submitted successfully", data },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("Server Crash:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}