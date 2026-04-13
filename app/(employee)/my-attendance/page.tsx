"use client";
import { useEffect, useState, useMemo } from "react";
import DashboardSummary from "@/app/components/DashboardSummary";
import InfoTable from "@/app/components/InfoTable";
import Selector from "@/app/components/Selector";
import DateInput from "@/app/components/DateInput";
import { Icon } from "@iconify/react";

const columns = [
  { label: "Date", key: "date" },
  { label: "Check In", key: "checkIn" },
  { label: "Check Out", key: "checkOut" },
  { label: "Work Hours", key: "workHours" },
  { label: "Status", key: "status" },
];

export default function MyAttendancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchMyLogs = async () => {
      setLoading(true);
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
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesMonth = log.date?.startsWith(selectedMonth);
      // Use case-insensitive comparison for the status filter
      const matchesStatus = filterStatus === "all" || 
        log.status?.toLowerCase() === filterStatus.toLowerCase();
      return matchesMonth && matchesStatus;
    });
  }, [logs, selectedMonth, filterStatus]);

  const stats = useMemo(() => {
    if (filteredLogs.length === 0) return { present: 0, leave: 0, avgHours: "0", rate: "0", incomplete: 0 };

    // Standardize status checks with .toLowerCase()
    const presentLogs = filteredLogs.filter(l => ["present", "late"].includes(l.status?.toLowerCase()));
    const presentCount = presentLogs.length;
    const leaveCount = filteredLogs.filter(l => l.status?.toLowerCase() === "on leave").length;
    
    // Only count as incomplete if the user was actually present/late but worked < 8 hours
    const incompleteCount = presentLogs.filter(l => !l.checkOut || (parseFloat(l.workHours) < 8)).length;
    
    // Calculate total hours only for "Present" or "Late" status
    const totalHours = presentLogs.reduce((acc, curr) => acc + (parseFloat(curr.workHours) || 0), 0);
    
    const rate = Math.min(Math.round((presentCount / 22) * 100), 100);
    
    return {
      present: presentCount,
      leave: leaveCount,
      incomplete: incompleteCount,
      avgHours: presentCount > 0 ? (totalHours / presentCount).toFixed(1) : "0",
      rate: rate.toString()
    };
  }, [filteredLogs]);

  const handleExportCSV = () => {
    if (!filteredLogs.length) return;
    const csvHeaders = columns.map(col => col.label).join(",");
    const csvRows = filteredLogs.map((row: any) =>
      columns.map(col => `"${row[col.key] ?? ""}"`).join(",")
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
                { label: "On Leave", value: "On Leave" },
              ]}
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="btn btn-md bg-green-500 text-white hover:bg-green-700 "
          >
            <Icon
              icon="material-symbols:download-rounded"
              className="w-5 h-5"
            ></Icon>
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

      <div className="relative">
        <InfoTable title="Attendance Records" columns={columns} rows={filteredLogs} />
        {loading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}
      </div>
    </div>
  );
}
