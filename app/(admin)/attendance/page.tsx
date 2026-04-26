"use client";

import { Fragment, useEffect, useState } from "react";
import SearchBar from "@/app/components/SearchBar";
import DateInput from "@/app/components/DateInput";
import Selector from "@/app/components/Selector";
import AttendanceSummary from "@/app/components/AttendanceSummary";
import { Icon } from "@iconify/react";
import { createClient } from "@/app/lib/supabase/client";

type SessionItem = {
  id: string;
  tapNumber: number;
  checkIn: string;
  checkOut: string;
  duration: string;
  rawCheckIn: string | null;
  rawCheckOut: string | null;
  rawMinutes: number;
};

type AttendanceLog = {
  id: string;
  employee: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  status: string;
  tapCount: number;
  sessions: SessionItem[];
};

export default function AttendancePage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const supabase = createClient();

  const fetchLogs = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/attendance_log");
      const data = await res.json();
      setLogs(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial Fetch
    fetchLogs(true);

    // 2. Real-time Subscription
    const channel = supabase
      .channel("admin-attendance-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_log" },
        () => fetchLogs(false) // Re-fetch silently (no loading spinner)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_sessions" },
        () => fetchLogs(false)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleExpand = (logId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.employee
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || log.status === filterStatus;

    const matchesDate = !filterDate || log.date === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPresent = filteredLogs.filter(
    (l) => l.status === "Present"
  ).length;
  const totalLate = filteredLogs.filter((l) => l.status === "Late").length;
  const totalAbsent = filteredLogs.filter((l) => l.status === "Absent").length;

  const handleExportCSV = () => {
    if (!filteredLogs.length) return;

    const csvHeaders = [
      "Employee",
      "Date",
      "Check In",
      "Check Out",
      "Work Hours",
      "Status",
      "Tap Count",
    ].join(",");

    const csvRows = filteredLogs.map((row) =>
      [
        row.employee,
        row.date,
        row.checkIn,
        row.checkOut,
        row.workHours,
        row.status,
        row.tapCount,
      ]
        .map((value) => `"${value ?? ""}"`)
        .join(",")
    );

    const csvString = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `attendance_logs_${filterDate || "export"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";
      case "Late":
        return "bg-orange-100 text-orange-700";
      case "Absent":
        return "bg-red-100 text-red-700";
      case "On leave":
        return "bg-purple-100 text-purple-700";
      case "Remote":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="md:flex md:flex-row grid grid-cols-2 w-full gap-4">
          <SearchBar
            placeholder="Search name or date..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />

          <Selector
            value={filterStatus}
            placeholder="All Statuses"
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { label: "Present", value: "Present" },
              { label: "Late", value: "Late" },
              { label: "Absent", value: "Absent" },
              { label: "On leave", value: "On leave" },
              { label: "Remote", value: "Remote" },
            ]}
          />

          <DateInput
            value={filterDate}
            onChange={(val) => setFilterDate(val)}
          />

          <button
            onClick={handleExportCSV}
            className="btn btn-md bg-green-500 text-white hover:bg-green-700 w-fit"
          >
            <Icon
              icon="material-symbols:download-rounded"
              className="w-5 h-5"
            />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AttendanceSummary
          title="Total Records"
          value={filteredLogs.length}
          colorClass="bg-white"
        />
        <AttendanceSummary
          title="Present"
          value={totalPresent}
          colorClass="bg-green-100"
        />
        <AttendanceSummary
          title="Late"
          value={totalLate}
          colorClass="bg-orange-100"
        />
        <AttendanceSummary
          title="Absent"
          value={totalAbsent}
          colorClass="bg-red-100"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Attendance Logs
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Status</th>
                <th>Total Taps</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No attendance logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <Fragment key={log.id}>
                    <tr key={log.id} className="hover">
                      <td className="font-medium text-gray-800">
                        {log.employee}
                      </td>
                      <td>{log.date}</td>
                      <td>{log.checkIn}</td>
                      <td>{log.checkOut}</td>
                      <td>{log.workHours}</td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td>{log.tapCount}</td>
                      <td>
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="rounded-full w-fit flex flex-row px-3 py-1 gap-2 items-center bg-black text-white hover:bg-gray-800 border-none"
                        >
                          <Icon
                            icon={
                              expandedLogs[log.id]
                                ? "mdi:chevron-up"
                                : "mdi:chevron-down"
                            }
                            className="w-4 h-4"
                          />
                          {expandedLogs[log.id] ? "Hide Log" : "Expand Log"}
                        </button>
                      </td>
                    </tr>

                    {expandedLogs[log.id] && (
                      <tr>
                        <td colSpan={8} className="bg-gray-50 px-6 py-4">
                          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  Log Details
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {log.employee} • {log.date}
                                </p>
                              </div>
                              <span className="text-sm text-gray-500">
                                {log.sessions.length} session(s)
                              </span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="table w-full">
                                <thead className="bg-gray-50 text-xs text-gray-500">
                                  <tr>
                                    <th>#</th>
                                    <th>Check In Tap</th>
                                    <th>Check Out Tap</th>
                                    <th>Session Duration</th>
                                    <th>State</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {log.sessions.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan={5}
                                        className="text-center py-4 text-gray-500"
                                      >
                                        No session details found.
                                      </td>
                                    </tr>
                                  ) : (
                                    log.sessions.map((session) => (
                                      <tr key={session.id}>
                                        <td>{session.tapNumber}</td>
                                        <td>{session.checkIn}</td>
                                        <td>{session.checkOut}</td>
                                        <td>{session.duration}</td>
                                        <td>
                                          {session.rawCheckOut ? (
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                              Closed
                                            </span>
                                          ) : (
                                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                              Open
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && <div className="text-center py-4">Refreshing logs...</div>}
    </div>
  );
}
