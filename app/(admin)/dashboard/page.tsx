"use client";
import { useEffect, useState } from "react";
import DashboardSummary from "@/app/components/DashboardSummary";
import InfoTable from "@/app/components/InfoTable";
import { createClient } from "@/app/lib/supabase/client";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    checkedIn: 0,
    totalRemote: 0,
    totalLeave: 0,
    totalAbsent: 0,
  });
  const [loading, setLoading] = useState(true);
  type Request = {
    id: string;
    name: string;
    type: string;
    period: string;
    submitAt: string;
    status: string;
  };

  const [requests, setRequests] = useState<Request[]>([]);
  const supabase = createClient();

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/dashboard/summary");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStats(data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const formattedData = data.map((item: any) => ({
        ...item,
      }));
      setRequests(formattedData);
    } catch (err) {
      console.error("Requests Fetch Error:", err);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      // Pure REST: The ID is in the URL path
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }), // Only send the changes
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      // Update UI state
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      );
    } catch (err) {
      console.error("REST Update Error:", err);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([fetchSummary(), fetchRequests()]);
    };
    loadAllData();

    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_log" },
        () => loadAllData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_sessions" },
        () => loadAllData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employee_requests" },
        () => loadAllData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading)
    return (
      <div className="p-4 text-gray-400 w-full flex justify-center items-center text-lg">
        Loading Summary...
      </div>
    );

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <DashboardSummary
          icon="mingcute:group-line"
          title="Total Employees"
          value={stats.totalEmployees}
          variant="blue"
        />
        <DashboardSummary
          icon="tabler:user-check"
          title="Total Checked In"
          value={stats.checkedIn}
          variant="green"
        />
        <DashboardSummary
          icon="tabler:user-pause"
          title="Total On Leave"
          value={stats.totalLeave}
          variant="orange"
        />
        <DashboardSummary
          icon="tabler:user-pin"
          title="Total Remote"
          value={stats.totalRemote}
          variant="blue"
        />
        <DashboardSummary
          icon="tabler:user-cancel"
          title="Total Absent"
          value={stats.totalAbsent}
          variant="red"
        />
      </div>
      <div className="gap-4 w-full">
        <InfoTable
          title="Recent Requests"
          rows={requests}
          columns={[
            { label: "Employee Name", key: "name" },
            {
              label: "Type",
              key: "type",
            },
            { label: "Period", key: "period" },
            { label: "Submitted", key: "submitAt" },
            {
              label: "Status",
              key: "status",
              render: (row) => (
                <span
                  className={`py-1 px-2 text-xs font-medium rounded-full ${
                    row.status === "Approved" || row.status === "approved"
                      ? "bg-green-100 text-green-600 border border-green-300"
                      : row.status === "Pending" || row.status === "pending"
                      ? "bg-amber-100 text-amber-600 border border-amber-300"
                      : "bg-red-100 text-red-600 border border-red-300"
                  }`}
                >
                  {row.status}
                </span>
              ),
            },
            {
              label: "Action",
              key: "action",
              render: (row: Request) => {
                if (row.status !== "Pending") {
                  return (
                    <span className="text-xs text-gray-400 italic">
                      Completed
                    </span>
                  );
                }

                return (
                  <div className="flex gap-2">
                    <button
                      className="bg-green-500 text-white rounded-full px-4 py-1 font-semibold cursor-pointer hover:underline hover:bg-green-600"
                      onClick={() => {
                        updateRequestStatus(row.id, "approved");
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 text-white rounded-full px-4 py-1 font-semibold cursor-pointer hover:underline hover:bg-red-600"
                      onClick={() => updateRequestStatus(row.id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                );
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
