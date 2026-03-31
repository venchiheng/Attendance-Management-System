"use client";
import React, { useEffect, useState } from "react";
import DashboardSummary from "@/app/components/DashboardSummary";
import InfoTable from "@/app/components/InfoTable";
import { Icon } from "@iconify/react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    checkedIn: 0,
    checkedOut: 0,
    totalLate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

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
      const res = await fetch("/api/dashboard/requests");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const formattedData = data.map((item: any) => ({
        ...item
      }));
      setRequests(formattedData);
    } catch (err) {
      console.error("Requests Fetch Error:", err);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchRequests()]);
      setLoading(false);
    };
    loadAllData();
  }, []);

  if (loading)
    return (
      <div className="p-4 text-gray-400 w-full flex justify-center items-center text-lg">
        Loading Summary...
      </div>
    );

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-row gap-4 w-full">
        <DashboardSummary
          icon="mingcute:group-line"
          title="Total Employees"
          value={stats.totalEmployees}
          variant="blue"
        />
        <DashboardSummary
          icon="mi:user-check"
          title="Total Checked In"
          value={stats.checkedIn}
          variant="green"
        />
        <DashboardSummary
          icon="tabler:user-bolt"
          title="Total Check Out"
          value={stats.checkedOut}
          variant="red"
        />
        <DashboardSummary
          icon="proicons:clock"
          title="Total Late"
          value={stats.totalLate}
          variant="orange"
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
            { label: "Submitted", key: "created_at" },
            {
              label: "Status",
              key: "status",
              render: (row) => (
                <span
                  className={`badge badge-sm ${
                    row.status === "approved"
                      ? "badge-success"
                      : row.status === "pending"
                      ? "badge-warning"
                      : "badge-ghost"
                  }`}
                >
                  {row.status}
                </span>
              ),
            },
            {
              label: "Action",
              key: "action",
              render: (row) => (
                <div className="flex gap-2">
                  <button className="btn btn-sm bg-green-500 text-white">
                    Approve
                  </button>
                  <button className="btn btn-sm bg-red-600 text-white">
                    Reject
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
