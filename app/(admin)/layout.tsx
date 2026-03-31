import SideBar from "@/app/components/SideBar";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SideBar>
      {children}
    </SideBar>
  );
}