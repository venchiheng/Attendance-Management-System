"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import CreateEmployee from "./CreateEmployee";
import { logOut } from "@/actions/auth";

export default function SideBar({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/").pop();
    return segment
      ? segment.charAt(0).toUpperCase() + segment.slice(1)
      : "Dashboard";
  };

  const config = {
    "/employees": {
      label: "Add Employee",
      icon: "material-symbols:add-rounded",
      style: "bg-[#1A77F2]",
    },
    "/attendance": {
      label: "Export CSV",
      icon: "material-symbols-light:download",
      style: "bg-[#03C755]",
    },
    "/reports": {
      label: "Export CSV",
      icon: "material-symbols-light:download",
      style: "bg-[#03C755]",
    },
  }[pathname];

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: "hugeicons:dashboard-square-02",
    },
    { href: "/employees", label: "Employees", icon: "mingcute:group-line" },
    { href: "/attendance", label: "Attendance", icon: "mage:clipboard-2" },
    { href: "/reports", label: "Reports", icon: "mynaui:chart-column-solid" },
    { href: "/settings", label: "Settings", icon: "lsicon:setting-outline" },
  ];

  const getDescription = () => {
    switch (pathname) {
      case "/dashboard":
        return "Welcome to your dashboard overview. Here's what's happening today.";
      case "/employees":
        return "Manage your team members";
      case "/attendance":
        return "View and manage employee attendance records.";
      case "/reports":
        return "Monthly attendance summary and analytics.";
      case "/settings":
        return "Manage system configurations and preferences";
      default:
        return "";
    }
  };

  function getActions(pathname: string): void {
    const configItem = {
      "/employees": {
        getActions: (path: string) => {
          // Logic to open the Create Employee modal
          setIsModalOpen(true);
        },
      },
      "/attendance": {
        getActions: () => {
          // Placeholder for export CSV logic for attendance
          // You can implement CSV export logic here
          alert("Export Attendance CSV feature coming soon!");
        },
      },
      "/reports": {
        getActions: () => {
          // Placeholder for export CSV logic for reports
          // You can implement CSV export logic here
          alert("Export Reports CSV feature coming soon!");
        },
      },
    }[pathname];

    if (configItem && typeof configItem.getActions === "function") {
      configItem.getActions(pathname);
    }
  }
  return (
    <div className="drawer lg:drawer-open">
      <input id="main-sidebar" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col bg-base-200">
        <nav className="navbar w-full">
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
                ></path>
              </svg>
            </label>
          </div>

          <div className="flex-1 font-bold px-6 mt-6 text-2xl">
            {getTitle()} <span>Overview</span>
            <p className="text-sm opacity-60 font-normal mt-1.5">
              {getDescription()}
            </p>
          </div>

          <div className="flex-none gap-2 px-4">
            {config && (
              <button
                className={`btn btn-sm text-white ${config.style}`}
                onClick={() => getActions(pathname)}
              >
                <Icon className="text-white text-xl" icon={config.icon} />{" "}
                {config.label}
              </button>
            )}
          </div>
        </nav>

        <div className="p-6 flex-grow bg-base-200 overflow-auto">
          {children}
        </div>
      </div>

      {/* 2. THE SIDEBAR (DRAWER SIDE) */}
      <div className="drawer-side z-50 bg-white">
        <label htmlFor="main-sidebar" className="drawer-overlay"></label>

        {/* Container for the Sidebar Links */}
        <div className="flex flex-col min-h-full w-64 bg-base-100 text-base-content border-r border-base-200">
          {/* Logo Section */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary">neWwave</h1>
            <p className="text-xs opacity-60">Admin Dashboard</p>
          </div>

          {/* Menu Links */}
          <ul className="menu menu-md px-4 gap-2 grow w-full">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
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

          {/* User Profile Section (Pinned at the bottom) */}
          <div className="p-4 border-t border-base-300 bg-white">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-base-200">
              <div className="avatar placeholder flex items-center">
                <div className="bg-primary text-primary-content flex items-center justify-center rounded-full w-10">
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
              onClick={logOut}
            >
              <Icon icon="mdi:logout" /> Logout
            </button>
          </div>
        </div>
      </div>
      <CreateEmployee
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        action="create"
      />
    </div>
  );
}
