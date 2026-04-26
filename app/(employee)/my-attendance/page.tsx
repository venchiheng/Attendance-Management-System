"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import DashboardSummary from "@/app/components/DashboardSummary";
import Selector from "@/app/components/Selector";
import DateInput from "@/app/components/DateInput";
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
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  workedMinutes: number;
  status: string;
  tapCount: number;
  sessions: SessionItem[];
};

export default function MyAttendancePage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [filterStatus, setFilterStatus] = useState("all");

  const supabase = createClient();

  useEffect(() => {
    const fetchMyLogs = async () => {
      try {
        const res = await fetch("/api/attendance_log");
        const data = await res.json();
        setLogs(data || []);
      } catch (error) {
        console.error("Error fetching attendance logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLogs();

    const channel = supabase
      .channel("my-attendance-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_log" },
        () => fetchMyLogs() // Re-fetch when logs change
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_sessions" },
        () => fetchMyLogs() // Re-fetch when sessions change
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

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesMonth = log.date?.startsWith(selectedMonth);
      const matchesStatus =
        filterStatus === "all" ||
        log.status?.toLowerCase() === filterStatus.toLowerCase();

      return matchesMonth && matchesStatus;
    });
  }, [logs, selectedMonth, filterStatus]);

  const stats = useMemo(() => {
    if (filteredLogs.length === 0) {
      return {
        present: 0,
        leave: 0,
        avgHours: "0.0",
        rate: "0",
        incomplete: 0,
      };
    }

    const presentLogs = filteredLogs.filter((l) =>
      ["present", "late"].includes(l.status?.toLowerCase())
    );

    const leaveCount = filteredLogs.filter(
      (l) => l.status?.toLowerCase() === "on leave"
    ).length;

    const totalMinutes = presentLogs.reduce(
      (acc, curr) => acc + (curr.workedMinutes || 0),
      0
    );

    const incompleteCount = presentLogs.filter(
      (l) => !l.checkOut || l.checkOut === "---" || (l.workedMinutes || 0) < 480
    ).length;

    const attendanceRate = Math.min(
      Math.round((presentLogs.length / 22) * 100),
      100
    );

    return {
      present: presentLogs.length,
      leave: leaveCount,
      incomplete: incompleteCount,
      avgHours:
        presentLogs.length > 0
          ? (totalMinutes / 60 / presentLogs.length).toFixed(1)
          : "0.0",
      rate: attendanceRate.toString(),
    };
  }, [filteredLogs]);

  const handleExportCSV = () => {
    if (!filteredLogs.length) return;

    const csvHeaders = [
      "Date",
      "Check In",
      "Check Out",
      "Work Hours",
      "Status",
      "Tap Count",
    ].join(",");

    const csvRows = filteredLogs.map((row) =>
      [
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
    link.setAttribute("download", `my_attendance_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "bg-green-100 text-green-700";
      case "late":
        return "bg-orange-100 text-orange-700";
      case "absent":
        return "bg-red-100 text-red-700";
      case "on leave":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row w-full justify-between gap-4">
          <div className="flex gap-2 items-center">
            <div className="w-fit">
              <DateInput
                mode="month"
                value={selectedMonth}
                onChange={(val: string) => setSelectedMonth(val)}
              />
            </div>

            <Selector
              value={filterStatus}
              placeholder="All Statuses"
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { label: "Present", value: "Present" },
                { label: "Late", value: "Late" },
                { label: "Absent", value: "Absent" },
                { label: "On Leave", value: "On leave" },
              ]}
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="btn btn-md bg-green-500 text-white hover:bg-green-700"
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
        <DashboardSummary
          icon="tdesign:task-checked-1"
          title="Total Present"
          value={stats.present.toString()}
          variant="green"
        />
        <DashboardSummary
          icon="material-symbols:warning-outline-rounded"
          title="Leave Days"
          value={stats.leave.toString()}
          variant="orange"
        />
        <DashboardSummary
          icon="tabler:clock"
          title="Avg. Daily Hours"
          value={`${stats.avgHours}h`}
          variant="blue"
        />
        <DashboardSummary
          icon="streamline:graph-arrow-increase"
          title="Attendance Rate"
          value={`${stats.rate}%`}
          variant="purple"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Attendance Records
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Status</th>
                <th>Total Sessions</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <Fragment key={log.id}>
                    <tr className="hover">
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
                          className="btn btn-sm bg-black text-white hover:bg-gray-800 border-none"
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
                        <td colSpan={7} className="bg-gray-50 px-6 py-4">
                          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  Session Details
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {log.date}
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
                                    <th>Duration</th>
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

        {loading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}
      </div>
    </div>
  );
}
