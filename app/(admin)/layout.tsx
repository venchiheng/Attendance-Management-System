import SideBar from "@/app/components/SideBar";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 2. Get the authenticated user from the session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("fullname, role, email, pfp_url")
    .eq("id", user.id)
    .single();

  return (
    <SideBar user={profile ?? undefined}>
      {children}
    </SideBar>
  );
}