"use server";
import { createClient } from "@/lib/supabase/server";

export async function getEmployee() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*, departments (name), positions (name)")
    .order("full_name", { ascending: true });

  if (error){
    console.log(error)
    return []
  };

  return data.map((item: any) => {
    const positionName = item.positions.name;
    const departmentName = item.departments.name;
    return {
      name: item.full_name,
      nfc_id: item.nfc_id,
      position: positionName,
      department: departmentName,
      hireDate: item.hire_date,
      workMode: item.work_mode,
      type: item.employment_type,
    };
  });
}
