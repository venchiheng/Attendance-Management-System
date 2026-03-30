"use client";
import React, { useEffect, useState } from "react";
import { getAttendanceLogs } from "@/actions/attendance";
import InfoTable from "@/components/InfoTable";
import SearchBar from "@/components/SearchBar";
import DateInput from "@/components/DateInput";
import Selector from "@/components/Selector";
import AttendanceSummary from "@/components/AttendanceSummary";

export default function AttendancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { label: "Employee", key: "employee" },
    { label: "Date", key: "date" },
    { label: "Check In", key: "checkIn" },
    { label: "Check Out", key: "checkOut" },
    { label: "Work Hours", key: "workHours" },
    { label: "Status", key: "status" },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAttendanceLogs();
      setLogs(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Dynamic Summaries
  const totalRecords = logs.length;
  const totalPresent = logs.filter(l => l.status === "Present").length;
  const totalLate = logs.filter(l => l.status === "Late").length;
  const totalAbsent = logs.filter(l => l.status === "Absent").length;

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-[2]"><SearchBar placeholder="Search attendance..." /></div>
          <div className="flex-1"><DateInput mode="day"/></div>
          <div className="flex-1">
            <Selector
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Present", value: "Present" },
                { label: "Late", value: "Late" },
                { label: "Absent", value: "Absent" },
              ]}
              defaultValue="all"
              placeholder="Filter by status..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-6 mb-6">
        <AttendanceSummary title="Total Records" value={totalRecords} colorClass="bg-white" />
        <AttendanceSummary title="Total Present" value={totalPresent} colorClass="bg-green-100" />
        <AttendanceSummary title="Total Late" value={totalLate} colorClass="bg-orange-100" />
        <AttendanceSummary title="Total Absent" value={totalAbsent} colorClass="bg-red-100" />
      </div>

      <InfoTable 
        title="Attendance Logs" 
        columns={columns} 
        rows={logs} 
      />
    </div>
  );
}