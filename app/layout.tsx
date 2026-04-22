"use client";
import "./globals.css";
import { Poppins } from "next/font/google";
import { ReactNode } from "react";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: ReactNode }) {


  return (
    <html lang="en" className={`${poppins.variable}`} data-theme="light">
      <body>{children}</body>
    </html>
  );
}
