"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { logOut } from "@/actions/auth";

export default function SideBar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTitle = () => {
    if (!mounted) return "Dashboard";
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/").pop();
    return segment
      ? segment.charAt(0).toUpperCase() + segment.slice(1)
      : "Dashboard";
  };

  const getDescription = () => {
    if (!mounted) return "";
    switch (pathname) {
      case "/dashboard":
        return "Welcome to your dashboard overview. Here's what's happening today.";
      case "/employees":
        return "Manage your team members";
      case "/organization":
        return "Manage your orgranization's structure.";
      case "/attendance":
        return "View and manage employee attendance records.";
      case "/requests":
        return "Review and manage leave and remote work requests.";
      case "/reports":
        return "Monthly attendance summary and analytics.";
      case "/settings":
        return "Manage system configurations and preferences";
      default:
        return "";
    }
  };

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: "hugeicons:dashboard-square-02",
    },
    { href: "/attendance", label: "Attendance", icon: "mage:clipboard-2" },
    { href: "/requests", label: "Requests", icon: "hugeicons:note-03" },
    { href: "/employees", label: "Employees", icon: "mingcute:group-line" },
    {
      href: "/organization",
      label: "Organization",
      icon: "fluent:building-32-regular",
    },
    { href: "/reports", label: "Reports", icon: "mynaui:chart-column-solid" },
    { href: "/settings", label: "Settings", icon: "lsicon:setting-outline" },
  ];

  return (
    <div className="drawer lg:drawer-open">
      <input id="main-sidebar" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col bg-base-200">
        <nav className="navbar w-full border-b border-base-300 lg:border-none">
          <div className="flex-none lg:hidden">
            <label htmlFor="main-sidebar" className="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>

          <div className="flex-1 font-bold px-6 mt-6 text-2xl">
            <div className="text-black">
              {getTitle()} <span className="font-bold">Overview</span>
              <p className="text-sm opacity-60 font-normal mt-1.5">
                {getDescription()}
              </p>
            </div>
          </div>

          <div className="flex-none px-4"></div>
        </nav>

        <div className="p-6 flex-grow bg-base-200 overflow-auto">
          {children}
        </div>
      </div>

      {/* SIDEBAR (DRAWER SIDE) */}
      <div className="drawer-side z-50 bg-white">
        <label htmlFor="main-sidebar" className="drawer-overlay"></label>

        <div className="flex flex-col min-h-full w-64 bg-base-100 text-base-content border-r border-base-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary">neWwave</h1>
            <p className="text-xs opacity-60">Admin Dashboard</p>
          </div>

          <ul className="menu menu-md px-4 gap-2 grow w-full">
            {menuItems.map((item) => {
              // Only check active state if mounted
              const isActive = mounted && pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 font-md"
                        : "text-gray-600 hover:bg-base-200"
                    }`}
                  >
                    <Icon
                      icon={item.icon}
                      className={`w-5 h-5 ${isActive ? "text-blue-700" : ""}`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="p-4 border-t border-base-300 bg-white">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-base-200">
              <div className="avatar placeholder flex items-center">
                <div className="bg-primary text-primary-content flex items-center justify-center rounded-full w-10 h-10">
                  <span className="text-xs">AD</span>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-bold">Admin User</p>
                <p className="text-xs opacity-50">admin@newwave.com</p>
              </div>
            </div>
            <button
              className="btn btn-ghost btn-md w-full mt-2 text-error justify-start"
              onClick={() => logOut()}
            >
              <Icon icon="mdi:logout" /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
