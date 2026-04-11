"use client";
import { useEffect, useState } from "react";
import DateInput from "@/app/components/DateInput";
import ReportSummary from "@/app/components/ReportSummary";
import AttendanceSummary from "@/app/components/AttendanceSummary";
import InfoTable from "@/app/components/InfoTable";
import { Icon } from "@iconify/react";

const columns = [
  { label: "Employee", key: "employee" },
  { label: "Present", key: "present" },
  { label: "Remote", key: "remote" },
  { label: "Leave", key: "leave" },
  { label: "Incomplete", key: "incomplete" },
  { label: "Total Hours", key: "totalHours" },
  { label: "Attendance Rate", key: "rate" },
];

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getStats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?month=${selectedMonth}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setReportData(data);
      } catch (err) {
        console.error("Report Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    getStats();
  }, [selectedMonth]);

  // Use optional chaining (?.) so the page doesn't crash if reportData is null
  const stats = reportData?.summary || {};
  const tableRows = reportData?.tableData || [];

  const handleExportCSV = () => {
    if (!tableRows.length) return;

    const csvHeaders = columns.map(col => col.label).join(",");
    const csvRows = tableRows.map((row: any) => 
      columns.map(col => `"${row[col.key] ?? ""}"`).join(",")
    );

    const csvString = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row w-full justify-between items-center gap-2">
        <DateInput 
          mode="month" 
          value={selectedMonth} 
          onChange={(val: string) => setSelectedMonth(val)} 
        />
        <button 
          onClick={handleExportCSV}
          className="btn btn-md bg-green-500 text-white hover:bg-green-700 "
        >
          <Icon icon="material-symbols:download-rounded" className="w-5 h-5"></Icon>
          Export CSV
        </button>
      </div>

      <div className="flex flex-row gap-4">
        <ReportSummary
          title="Total Attendance"
          subtitle="Employees Present"
          icon="mingcute:group-line"
          value={stats.totalAttendance || 0}
          variant="bg-blue-600"
          textColor="text-white"
          subtitleColor="text-white"
        />
        <ReportSummary
          title="Avg Attendance"
          value={(stats.avgAttendance || 0) + "%"}
          subtitle="from last month"
          icon="streamline:graph-arrow-increase"
          trend={stats.trend || 0}
          variant="bg-white"
          textColor="text-black"
          iconColor="text-green-600"
          subtitleColor="text-gray-500"
        />
        <ReportSummary
          title="Total Work Hours"
          value={(stats.totalWorkHours || 0) + "h"}
          subtitle="Across all Employees"
          icon="mingcute:time-line"
          variant="bg-white"
          textColor="text-black"
          iconColor="text-orange-500"
          subtitleColor="text-gray-500"
        />
        <ReportSummary
          title="Total Complete Days"
          subtitle="All Employees"
          icon="mingcute:calendar-line"
          value={stats.totalCompleteDays || 0}
          variant="bg-white"
          textColor="text-black"
          iconColor="text-blue-700"
          subtitleColor="text-gray-500"
        />
      </div>

      <div className="flex flex-row gap-4">
        <AttendanceSummary 
          title="Total Remote"
          value={stats.totalRemote || 0}
          colorClass="bg-blue-100 text-blue-500"
        />
        <AttendanceSummary 
          title="Total Leave"
          value={stats.totalLeave || 0}
          colorClass="bg-red-100 text-red-700"
        />
        <AttendanceSummary 
          title="Total Incomplete"
          value={stats.totalIncomplete || 0}
          colorClass="bg-orange-100 text-orange-600"
        />
      </div>

      <InfoTable 
        title="Monthly Employee Summary" 
        columns={columns} 
        rows={tableRows} 
      />
    </div>
  );
}