"use server";
import { createClient } from "@/app/lib/supabase/client";
import { revalidatePath } from "next/cache";

const CAL_ID = "en.kh#holiday@group.v.calendar.google.com";
const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;

export async function syncHolidays() {
  const supabase = createClient();

  // Dynamic Year Detection
  const currentYear = new Date().getFullYear();
  const timeMin = `${currentYear}-01-01T00:00:00Z`;
  const timeMax = `${currentYear}-12-31T23:59:59Z`;

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        CAL_ID
      )}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
    );
    const data = await res.json();

    if (!data.items) throw new Error("No holidays found for the current year");

    const officialHolidays = data.items.map((item: any) => ({
      holiday_date: item.start.date || item.start.dateTime.split("T")[0],
      holiday_name: item.summary,
      holiday_type: "Public",
    }));

    // Upsert logic handles the "Long-Term" aspect
    // It updates existing ones and adds new ones without duplicates
    const { error } = await supabase
      .from("holidays")
      .upsert(officialHolidays, { onConflict: "holiday_date, holiday_name" });

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, year: currentYear };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function getHolidays() {
  const supabase = createClient();
  const { data } = await supabase
    .from("holidays")
    .select("*")
    .order("holiday_date", { ascending: true });

  return data;
}

// Delete a specific holiday
export async function deleteHoliday(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("holidays").delete().eq("id", id);

  if (error) return { success: false };

  revalidatePath("/settings");
  return { success: true };
}

export async function addManualHoliday(formData: { 
  holiday_name: string, 
  holiday_date: string, 
  holiday_type: "Company" | "Public" 
}) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('holidays')
    .insert([formData])
    .select();

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/settings');
  return { success: true, data };
}