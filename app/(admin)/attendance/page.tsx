"use client";
import { useEffect, useState } from "react";
import InfoTable from "@/app/components/InfoTable";
import SearchBar from "@/app/components/SearchBar";
import DateInput from "@/app/components/DateInput";
import Selector from "@/app/components/Selector";
import AttendanceSummary from "@/app/components/AttendanceSummary";
import { Icon } from "@iconify/react";

const columns = [
  { label: "Employee", key: "employee" },
  { label: "Date", key: "date" },
  { label: "Check In", key: "checkIn" },
  { label: "Check Out", key: "checkOut" },
  { label: "Work Hours", key: "workHours" },
  { label: "Status", key: "status" },
];

export default function AttendancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // 1. Same fetch pattern as your employee page
  const fetchLogs = async () => {
    setLoading(true);
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
    fetchLogs();
  }, []);

  // 2. Same derived filtering pattern as your employee page
  const filteredLogs = logs.filter((log: any) => {
    // 1. Search Query Match
    const matchesSearch = log.employee
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    // 2. Status Match
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;

    // 3. Date Match (Ensures log.date matches our picker)
    const matchesDate = !filterDate || log.date === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // 3. Summaries based on the filtered data
  const totalPresent = filteredLogs.filter(
    (l) => l.status === "Present"
  ).length;
  const totalLate = filteredLogs.filter((l) => l.status === "Late").length;
  const totalAbsent = filteredLogs.filter((l) => l.status === "Absent").length;

  const handleExportCSV = () => {
    if (!filteredLogs.length) return;

    const csvHeaders = columns.map((col) => col.label).join(",");
    const csvRows = filteredLogs.map((row: any) =>
      columns.map((col) => `"${row[col.key] ?? ""}"`).join(",")
    );

    const csvString = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_logs_${filterDate || "export"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex w-full gap-2">
          <SearchBar
            placeholder="Search name or date..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
          <div className="w-48">
            <DateInput
              value={filterDate}
              onChange={(val) => setFilterDate(val)}
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
              { label: "On leave", value: "On leave" },
              { label: "Remote", value: "Remote" },
            ]}
          />
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

      {/* Summary Cards */}
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

      <InfoTable
        title="Attendance Logs"
        columns={columns}
        rows={filteredLogs}
      />

      {loading && <div className="text-center py-4">Refreshing logs...</div>}
    </div>
  );
}
