"use client";
import "./globals.css";
import { Poppins } from "next/font/google";
import SideBar from "@/components/SideBar";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});



export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/auth");

  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body>
        {isAuthPage ? <main>{children}</main> : <SideBar>{children}</SideBar>}
      </body>
    </html>
  );
}
