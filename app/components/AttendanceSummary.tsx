import React from "react";

interface AttendanceSummaryProps {
  title: string;
  value: number | string;
  colorClass: string;
}

const AttendanceSummary = ({ title, value, colorClass }: AttendanceSummaryProps) => {
  return (
    <div className={`flex-1 p-4 rounded-2xl border ${colorClass} bg-base-100 shadow-sm transition-all hover:shadow-md`}>
      <p className={`text-sm font-normal mb-2 ${colorClass.split(' ')[0].replace('border-', 'text-')}`}>
        {title}
      </p>
      <h3 className="text-2xl font-bold text-base-content">
        {value}
      </h3>
    </div>
  );
};

export default AttendanceSummary;