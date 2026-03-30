import React from "react";
import DateInput from "@/components/DateInput";
import ReportSummary from "@/components/ReportSummary";
import AttendanceSummary from "@/components/AttendanceSummary";
import InfoTable from "@/components/InfoTable";
type Props = {};

const columns = [
    { label: "Employee", key: "employee" },
    { label: "Present", key: "present" },
    { label: "Remote", key: "remote" },
    { label: "Leave", key: "leave" },
    { label: "Incomplete", key: "incomplete" },
    { label: "Total Hours", key: "totalHours" },
    { label: "Rate", key: "rate" },
];

const rows = [
    {
        employee: "John Doe",
        present: 20,
        remote: 5,
        leave: 2,
        incomplete: 1,
        totalHours: 160,
        rate: "80%",
    },
    {
        employee: "Jane Smith",
        present: 18,
        remote: 7,
        leave: 3,
        incomplete: 2,
        totalHours: 150,
        rate: "75%",
    },
    {
        employee: "Alice Johnson",
        present: 22,
        remote: 4,
        leave: 1,
        incomplete: 0,
        totalHours: 170,
        rate: "85%",
    },
];

export default function page({}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col w-min">
        <DateInput mode="month" />
      </div>
      <div className="flex flex-row gap-4">
        <ReportSummary
          title="Total Attendance"
          subtitle="Employees Present"
          icon="mingcute:group-line"
          value={120}
          variant="bg-blue-600"
          textColor="text-white"
          subtitleColor="text-white"
        />
        <ReportSummary
          title="Avg Attendance"
          value="50%"
          subtitle="from last month"
          icon="streamline:graph-arrow-increase"
          trend={-3}
          variant="bg-white"
          textColor="text-black"
          iconColor="text-green-600"
          subtitleColor="text-gray-500"
        />

        <ReportSummary
          title="Total Work Hours"
          value="1600h"
          subtitle="Accross all Employees"
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
          value={5}
          variant="bg-white"
          textColor="text-black"
          iconColor="text-blue-700"
          subtitleColor="text-gray-500"
        />
      </div>
      <div className="flex flex-row gap-4">
        <AttendanceSummary 
          title="Total Remote"
          value={10}
          colorClass="bg-blue-100 text-blue-500"
        />
        <AttendanceSummary 
          title="Total Leave"
          value={15}
          colorClass="bg-red-100 text-red-700"
        />
        <AttendanceSummary 
          title="Total Incomplete"
          value={5}
          colorClass="bg-orange-100 text-orange-600"
        />
      </div>
      <InfoTable title="Monthly Employee Summary" columns={columns} rows={rows} />
    </div>
  );
}
