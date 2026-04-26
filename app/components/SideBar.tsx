"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { logout as signOut } from "../lib/actions/auth";
import { createClient } from "../lib/supabase/client";

export default function SideBar({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: {
    fullname: string | null;
    role: string | null;
    email: string | null;
    pfp_url: string | null;
  };
}) {
  const pathname = usePathname();
  const router = useRouter(); // 4. Initialize router
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    // 5. Real-time listener for Profile updates
    const channel = supabase
      .channel("sidebar-user-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe((status) => {
        if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          supabase.realtime.connect();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getTitle = () => {
    if (!mounted) return "Dashboard";
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/").pop();
    if (!segment) return "Dashboard";

    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const closeDrawer = () => {
    const drawerCheckbox = document.getElementById(
      "main-sidebar"
    ) as HTMLInputElement;
    if (drawerCheckbox) {
      drawerCheckbox.checked = false;
    }
  };

  const getDescription = () => {
    if (!mounted) return "";
    switch (pathname) {
      case "/dashboard":
        return "Welcome to your dashboard overview. Here's what's happening today";
      case "/employees":
        return "Manage your team members";
      case "/organization":
        return "Manage your orgranization's structure";
      case "/attendance":
        return "View and manage employee attendance records";
      case "/requests":
        return "Review and manage leave and remote work requests";
      case "/reports":
        return "Monthly attendance summary and analytics";
      case "/settings":
        return "Manage system configurations and preferences";
      case "/my-dashboard":
        return `Welcome back, ${user?.fullname || "Guest User"}!`;
      case "/my-attendance":
        return "View your attendance history and records";
      case "/my-requests":
        return "View and manage your submitted requests";
      case "/submit-request":
        return "Fill out the form below to submit your request";
      case "/my-profile":
        return "View your personal information";
      default:
        return "";
    }
  };

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const adminItems = [
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

  const employeeItems = [
    {
      href: "/my-dashboard",
      label: "Dashboard",
      icon: "hugeicons:dashboard-square-02",
    },
    {
      href: "/my-attendance",
      label: "My Attendance",
      icon: "mage:clipboard-2",
    },
    { href: "/my-requests", label: "My Requests", icon: "hugeicons:note-03" },
    {
      href: "/submit-request",
      label: "Submit Request",
      icon: "streamline:send-email",
    },
    { href: "/my-profile", label: "Profile", icon: "mingcute:user-4-line" },
  ];

  const menuItems = isAdmin ? adminItems : employeeItems;

  const handleLogOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();

      localStorage.clear();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

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

        <div className="p-6 bg-base-200 overflow-auto">{children}</div>
      </div>

      {/* SIDEBAR (DRAWER SIDE) */}
      <div className="drawer-side z-50 bg-white">
        <label htmlFor="main-sidebar" className="drawer-overlay"></label>

        <div className="flex flex-col min-h-full w-64 bg-base-100 text-base-content order-r border-base-200">
          <div className="p-6 flex flex-col items-center justify-center">
            <img src="/newwave_logo.png" alt="logo" />
            <p className="text-xs opacity-60">
              {isAdmin ? "Admin Dashboard" : "Employee Portal"}
            </p>
          </div>

          <ul className="menu menu-md px-4 gap-2 grow w-full">
            {menuItems.map((item) => {
              const isActive = mounted && pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeDrawer}
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
            <div className="flex items-center gap-3 p-2 rounded-lg bg-base-200 min-w-0">
              <div className="avatar flex items-center shrink-0">
                {user?.pfp_url ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={
                        mounted && user?.pfp_url
                          ? `${user.pfp_url}?t=${new Date().getTime()}`
                          : user?.pfp_url || ""
                      }
                      alt={user?.fullname || "User profile"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center rounded-full w-10 h-10">
                    <span className="text-xs">
                      {user?.fullname
                        ? user.fullname
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "U"}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-sm min-w-0 flex-1">
                <p className="font-bold truncate">
                  {user?.fullname || "Guest User"}
                </p>
                <p
                  className="text-xs opacity-50 truncate"
                  title={user?.email || "No Email"}
                >
                  {user?.email || "No Email"}
                </p>
              </div>
            </div>

            <button
              className="btn btn-ghost btn-md w-full mt-2 text-error justify-start"
              onClick={handleLogOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Icon icon="mdi:logout" />
              )}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
